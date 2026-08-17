import { randomBytes } from "node:crypto";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || 8081);
const host = process.env.HOST || "0.0.0.0";
const shareTtlMs = Math.max(1_000, Number(process.env.SHARE_TTL_MS || 24 * 60 * 60 * 1_000));
const cleanupIntervalMs = Math.max(250, Number(process.env.SHARE_CLEANUP_INTERVAL_MS || 5 * 60 * 1_000));
const maxJsonBytes = Math.max(1_024, Number(process.env.SHARE_MAX_JSON_BYTES || 50 * 1_024 * 1_024));
const maxUploadBytes = Math.max(1_024, Number(process.env.SHARE_MAX_UPLOAD_BYTES || 500 * 1_024 * 1_024));
const shareRoot = resolve(process.env.SHARE_STORAGE_DIR || join(root, "data", "shares"));
const sessionIdPattern = /^[A-Za-z0-9_-]{20,64}$/;
const liveClients = new Map();
const persistTimers = new Map();
const sessionCache = new Map();

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};

await mkdir(shareRoot, { recursive: true });
await cleanupExpiredSessions();

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
    if (url.pathname.startsWith("/api/share-sessions")) {
      await handleShareApi(request, response, url);
      return;
    }

    if (/^\/share\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) {
      serveStaticFile(join(root, "index.html"), response);
      return;
    }

    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    if (!isPublicStaticPath(pathname)) {
      sendText(response, 404, "Not found");
      return;
    }
    const filePath = normalize(join(root, pathname));
    if (!isPathInside(root, filePath) || !existsSync(filePath)) {
      sendText(response, 404, "Not found");
      return;
    }
    serveStaticFile(filePath, response);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) sendJson(response, error.statusCode || 500, { error: error.statusCode === 413 ? "request_too_large" : error.statusCode === 400 ? "invalid_request" : "internal_error" });
    else response.end();
  }
});

server.listen(port, host, () => {
  console.log(`PointKing running at http://${host}:${port}`);
  console.log(`Share uploads expire after ${Math.round(shareTtlMs / 3_600_000)} hours`);
});

const cleanupTimer = setInterval(cleanupExpiredSessions, cleanupIntervalMs);
cleanupTimer.unref?.();

async function handleShareApi(request, response, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 2 && request.method === "POST") {
    const input = await readJsonBody(request);
    const now = Date.now();
    const id = createSessionId();
    const file = normalizeFileMetadata(input.file);
    const state = normalizeSharedState(input.state);
    const session = {
      id,
      createdAt: now,
      expiresAt: now + shareTtlMs,
      title: cleanText(input.title, 240) || "PointKing",
      file,
      projectSize: file?.size || Buffer.byteLength(JSON.stringify(state), "utf8"),
      state,
    };
    await writeSession(session);
    sendJson(response, 201, publicSession(session));
    return;
  }

  const id = parts[2];
  if (!sessionIdPattern.test(id || "")) {
    sendJson(response, 404, { error: "share_not_found" });
    return;
  }
  const session = await readActiveSession(id, response);
  if (!session) return;

  if (parts.length === 3 && request.method === "GET") {
    sendJson(response, 200, publicSession(session));
    return;
  }
  if (parts[3] === "file" && request.method === "PUT") {
    await receiveSharedFile(request, response, session);
    return;
  }
  if (parts[3] === "file" && (request.method === "GET" || request.method === "HEAD")) {
    await serveSharedFile(request, response, session);
    return;
  }
  if (parts[3] === "events" && request.method === "GET") {
    openEventStream(request, response, url, session);
    return;
  }
  if (parts[3] === "events" && request.method === "POST") {
    await receiveSharedEvent(response, session, await readJsonBody(request));
    return;
  }
  sendJson(response, 404, { error: "share_route_not_found" });
}

async function readActiveSession(id, response) {
  const session = await readSession(id);
  if (!session) {
    sendJson(response, 404, { error: "share_not_found" });
    return null;
  }
  if (session.expiresAt <= Date.now()) {
    await deleteSession(id, "expired");
    sendJson(response, 410, { error: "share_expired" });
    return null;
  }
  return session;
}

async function receiveSharedFile(request, response, session) {
  const declaredLength = Number(request.headers["content-length"] || 0);
  if (declaredLength > maxUploadBytes) {
    sendJson(response, 413, { error: "file_too_large" });
    request.resume();
    return;
  }

  const directory = getSessionDirectory(session.id);
  const temporaryPath = join(directory, "source.uploading");
  const finalPath = join(directory, "source.bin");
  await mkdir(directory, { recursive: true });
  let size = 0;
  let settled = false;
  const output = createWriteStream(temporaryPath, { flags: "w" });

  const fail = async (status, error) => {
    if (settled) return;
    settled = true;
    output.destroy();
    await rm(temporaryPath, { force: true }).catch(() => {});
    if (!response.headersSent) sendJson(response, status, { error });
  };
  request.on("data", (chunk) => {
    size += chunk.length;
    if (size > maxUploadBytes) fail(413, "file_too_large");
  });
  request.on("aborted", () => fail(400, "upload_aborted"));
  request.on("error", () => fail(400, "upload_failed"));
  output.on("error", () => fail(500, "upload_failed"));
  output.on("finish", async () => {
    if (settled) return;
    settled = true;
    await rename(temporaryPath, finalPath);
    session.file = {
      ...(session.file || {}),
      name: decodeHeaderText(request.headers["x-file-name"]) || session.file?.name || "document",
      type: cleanText(request.headers["content-type"], 160) || session.file?.type || "application/octet-stream",
      size,
      lastModified: Number(request.headers["x-file-last-modified"] || session.file?.lastModified || Date.now()),
      uploaded: true,
    };
    session.projectSize = size;
    await writeSession(session);
    broadcast(session.id, { type: "file-ready", file: session.file, sentAt: Date.now() });
    sendJson(response, 201, { ok: true, file: session.file });
  });
  request.pipe(output);
}

async function serveSharedFile(request, response, session) {
  const filePath = join(getSessionDirectory(session.id), "source.bin");
  const info = await stat(filePath).catch(() => null);
  if (!info?.isFile()) {
    sendJson(response, 404, { error: "shared_file_not_found" });
    return;
  }
  const range = parseByteRange(request.headers.range, info.size);
  if (range === false) {
    response.writeHead(416, {
      "Content-Range": `bytes */${info.size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
    });
    response.end();
    return;
  }
  const start = range?.start ?? 0;
  const end = range?.end ?? Math.max(0, info.size - 1);
  const status = range ? 206 : 200;
  const headers = {
    "Content-Type": session.file?.type || "application/octet-stream",
    "Content-Length": Math.max(0, end - start + 1),
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(session.file?.name || "document")}`,
    "Cache-Control": "private, no-store",
    "Accept-Ranges": "bytes",
  };
  if (range) headers["Content-Range"] = `bytes ${start}-${end}/${info.size}`;
  response.writeHead(status, headers);
  if (request.method === "HEAD") response.end();
  else createReadStream(filePath, { start, end }).pipe(response);
}

function parseByteRange(value, size) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(value).trim());
  if (!match || (!match[1] && !match[2]) || size <= 0) return false;
  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return false;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return false;
    end = Math.min(end, size - 1);
  }
  return { start, end };
}

function openEventStream(request, response, url, session) {
  const clientId = cleanClientId(url.searchParams.get("clientId")) || createSessionId();
  const role = url.searchParams.get("role") === "host" ? "host" : "guest";
  const requestedName = cleanText(url.searchParams.get("name"), 30);
  const legacyHostName = role === "host" && ["发起人", "Host"].includes(requestedName);
  const name = legacyHostName ? "设计师" : requestedName || (role === "host" ? "设计师" : "访客");
  const ip = getClientIp(request);
  const clients = getLiveClients(session.id);
  clients.set(clientId, { id: clientId, role, name, ip, voiceEnabled: false, response, connectedAt: Date.now() });
  response.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.write("retry: 1500\n\n");
  sendSse(response, { type: "snapshot", session: publicSession(session), participants: publicParticipants(session.id) });
  broadcastPresence(session.id);

  const heartbeat = setInterval(() => response.write(": keep-alive\n\n"), 20_000);
  heartbeat.unref?.();
  request.on("close", () => {
    clearInterval(heartbeat);
    if (clients.get(clientId)?.response === response) clients.delete(clientId);
    if (!clients.size) liveClients.delete(session.id);
    broadcastPresence(session.id);
  });
}

async function receiveSharedEvent(response, session, input) {
  const sender = cleanClientId(input.sender);
  const allowedTypes = new Set(["cursor", "annotations", "view", "video", "activity", "profile", "voice-state", "rtc-signal"]);
  if (!sender || !allowedTypes.has(input.type)) {
    sendJson(response, 400, { error: "invalid_share_event" });
    return;
  }
  const client = liveClients.get(session.id)?.get(sender);
  if (input.type === "profile") {
    if (!client) {
      sendJson(response, 409, { error: "share_client_not_connected" });
      return;
    }
    client.name = cleanText(input.payload?.name, 30) || (client.role === "host" ? "设计师" : "访客");
    broadcastPresence(session.id);
    sendJson(response, 202, { ok: true, name: client.name });
    return;
  }
  if (input.type === "voice-state") {
    if (!client) {
      sendJson(response, 409, { error: "share_client_not_connected" });
      return;
    }
    client.voiceEnabled = input.payload?.enabled === true;
    broadcastPresence(session.id);
    sendJson(response, 202, { ok: true, voiceEnabled: client.voiceEnabled });
    return;
  }
  if (input.type === "rtc-signal") {
    const target = cleanClientId(input.payload?.target);
    const targetClient = liveClients.get(session.id)?.get(target);
    const signal = normalizeRtcSignal(input.payload);
    if (!client?.voiceEnabled || !targetClient?.voiceEnabled || !signal) {
      sendJson(response, 409, { error: "voice_peer_not_available" });
      return;
    }
    sendSse(targetClient.response, {
      type: "rtc-signal",
      sender,
      sentAt: Date.now(),
      payload: signal,
    });
    sendJson(response, 202, { ok: true });
    return;
  }
  const event = {
    type: input.type,
    sender,
    sentAt: Date.now(),
    payload: input.payload && typeof input.payload === "object" ? input.payload : {},
  };
  if (event.type === "annotations") {
    session.state.annotations = normalizeAnnotations(event.payload.annotations);
    if (Array.isArray(event.payload.deletedPageIds)) {
      session.state.deletedPageIds = event.payload.deletedPageIds.map(String).slice(0, 10_000);
    }
    session.state.version = Number(session.state.version || 0) + 1;
    event.payload = {
      annotations: session.state.annotations,
      deletedPageIds: session.state.deletedPageIds,
      version: session.state.version,
    };
    scheduleSessionPersist(session);
  } else if (event.type === "view") {
    session.state.view = normalizeView(event.payload);
    event.payload = session.state.view;
    scheduleSessionPersist(session);
  } else if (event.type === "video") {
    session.state.video = normalizeVideoState(event.payload);
    event.payload = session.state.video;
    scheduleSessionPersist(session);
  }
  broadcast(session.id, event, sender);
  sendJson(response, 202, { ok: true, version: session.state.version || 0 });
}

function publicSession(session) {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    file: session.file || null,
    projectSize: Math.max(0, Number(session.projectSize || session.file?.size || 0)),
    state: session.state || normalizeSharedState({}),
  };
}

function normalizeSharedState(input = {}) {
  return {
    annotations: normalizeAnnotations(input.annotations),
    deletedPageIds: Array.isArray(input.deletedPageIds) ? input.deletedPageIds.map(String).slice(0, 10_000) : [],
    pages: normalizeSharedPages(input.pages),
    view: normalizeView(input.view),
    video: normalizeVideoState(input.video),
    version: Math.max(0, Number(input.version || 0)),
  };
}

function normalizeAnnotations(input) {
  return Array.isArray(input) ? input.filter((item) => item && typeof item === "object").slice(0, 10_000) : [];
}

function normalizeSharedPages(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 500).map((page, index) => ({
    id: cleanText(page?.id, 80) || String(index + 1),
    name: cleanText(page?.name, 240) || `page-${index + 1}.png`,
    type: cleanText(page?.type, 160) || "image/png",
    image: typeof page?.image === "string" && page.image.startsWith("data:image/") ? page.image : "",
  })).filter((page) => page.image);
}

function normalizeView(input = {}) {
  return {
    zoom: clampNumber(input.zoom, 0.35, 2.6, 1),
    panX: clampNumber(input.panX, -100_000, 100_000, 0),
    panY: clampNumber(input.panY, -100_000, 100_000, 0),
  };
}

function normalizeVideoState(input = {}) {
  return {
    currentTime: clampNumber(input.currentTime, 0, 7 * 24 * 60 * 60, 0),
    paused: input.paused !== false,
    playbackRate: clampNumber(input.playbackRate, 0.25, 4, 1),
  };
}

function normalizeRtcSignal(input = {}) {
  const target = cleanClientId(input.target);
  if (!target) return null;
  if (input.description && ["offer", "answer"].includes(input.description.type) && typeof input.description.sdp === "string") {
    return {
      target,
      description: {
        type: input.description.type,
        sdp: input.description.sdp.slice(0, 200_000),
      },
    };
  }
  if (input.candidate && typeof input.candidate.candidate === "string") {
    return {
      target,
      candidate: {
        candidate: input.candidate.candidate.slice(0, 4_000),
        sdpMid: cleanText(input.candidate.sdpMid, 100) || null,
        sdpMLineIndex: Number.isInteger(input.candidate.sdpMLineIndex) ? input.candidate.sdpMLineIndex : null,
        usernameFragment: cleanText(input.candidate.usernameFragment, 200) || null,
      },
    };
  }
  return null;
}

function normalizeFileMetadata(input) {
  if (!input || typeof input !== "object") return null;
  return {
    name: cleanText(input.name, 240) || "document",
    type: cleanText(input.type, 160) || "application/octet-stream",
    size: Math.max(0, Number(input.size || 0)),
    lastModified: Math.max(0, Number(input.lastModified || 0)),
    uploaded: false,
  };
}

function scheduleSessionPersist(session) {
  clearTimeout(persistTimers.get(session.id));
  const timer = setTimeout(() => {
    persistTimers.delete(session.id);
    writeSession(session).catch(console.error);
  }, 80);
  timer.unref?.();
  persistTimers.set(session.id, timer);
}

function getLiveClients(id) {
  if (!liveClients.has(id)) liveClients.set(id, new Map());
  return liveClients.get(id);
}

function broadcastPresence(id) {
  broadcast(id, { type: "presence", participants: publicParticipants(id), sentAt: Date.now() });
}

function publicParticipants(id) {
  return [...(liveClients.get(id)?.values() || [])].map(({ id: clientId, role, name, ip, voiceEnabled, connectedAt }) => ({
    id: clientId,
    role,
    name,
    ip,
    voiceEnabled: voiceEnabled === true,
    connectedAt,
  }));
}

function broadcast(id, event, excludedClientId = "") {
  for (const client of liveClients.get(id)?.values() || []) {
    if (client.id !== excludedClientId) sendSse(client.response, event);
  }
}

function sendSse(response, event) {
  if (!response.destroyed && !response.writableEnded) response.write(`data: ${JSON.stringify(event).replace(/[\r\n]/g, "")}\n\n`);
}

async function cleanupExpiredSessions() {
  const entries = await readdir(shareRoot, { withFileTypes: true }).catch(() => []);
  const now = Date.now();
  await Promise.all(entries.filter((entry) => entry.isDirectory() && sessionIdPattern.test(entry.name)).map(async (entry) => {
    const session = await readSession(entry.name);
    if (!session || session.expiresAt <= now) await deleteSession(entry.name, "expired");
  }));
}

async function deleteSession(id, reason) {
  const directory = getSessionDirectory(id);
  sessionCache.delete(id);
  clearTimeout(persistTimers.get(id));
  persistTimers.delete(id);
  broadcast(id, { type: "session-expired", reason, sentAt: Date.now() });
  for (const client of liveClients.get(id)?.values() || []) client.response.end();
  liveClients.delete(id);
  await rm(directory, { recursive: true, force: true });
}

async function writeSession(session) {
  sessionCache.set(session.id, session);
  const directory = getSessionDirectory(session.id);
  await mkdir(directory, { recursive: true });
  const target = join(directory, "session.json");
  const temporary = join(directory, "session.json.tmp");
  await writeFile(temporary, JSON.stringify(session), "utf8");
  await rename(temporary, target);
}

async function readSession(id) {
  if (!sessionIdPattern.test(id || "")) return null;
  if (sessionCache.has(id)) return sessionCache.get(id);
  try {
    const session = JSON.parse(await readFile(join(getSessionDirectory(id), "session.json"), "utf8"));
    if (session?.id !== id) return null;
    sessionCache.set(id, session);
    return session;
  } catch {
    return null;
  }
}

function getSessionDirectory(id) {
  if (!sessionIdPattern.test(id || "")) throw new Error("Invalid share session id");
  const directory = resolve(shareRoot, id);
  if (!isPathInside(shareRoot, directory)) throw new Error("Invalid share session path");
  return directory;
}

function createSessionId() {
  return randomBytes(18).toString("base64url");
}

function cleanClientId(value) {
  const text = String(value || "");
  return /^[A-Za-z0-9_-]{8,80}$/.test(text) ? text : "";
}

function getClientIp(request) {
  const realIp = normalizeClientIp(request.headers["x-real-ip"]);
  if (realIp) return realIp;
  const forwardedIp = normalizeClientIp(String(request.headers["x-forwarded-for"] || "").split(",")[0]);
  if (forwardedIp) return forwardedIp;
  return normalizeClientIp(request.socket?.remoteAddress) || "—";
}

function normalizeClientIp(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const text = cleanText(raw, 80);
  return text.startsWith("::ffff:") ? text.slice(7) : text;
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength);
}

function decodeHeaderText(value) {
  try {
    return cleanText(decodeURIComponent(String(value || "")), 240);
  } catch {
    return cleanText(value, 240);
  }
}

function clampNumber(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxJsonBytes) {
      const error = new Error("JSON body too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON body");
    error.statusCode = 400;
    throw error;
  }
}

function serveStaticFile(filePath, response) {
  response.writeHead(200, {
    "Content-Type": types[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(text);
}

function isPublicStaticPath(pathname) {
  return pathname === "/index.html"
    || pathname === "/script.js"
    || pathname === "/styles.css"
    || pathname.startsWith("/assets/")
    || pathname.startsWith("/vendor/");
}

function isPathInside(parent, child) {
  const normalizedParent = resolve(parent);
  const normalizedChild = resolve(child);
  return normalizedChild === normalizedParent || normalizedChild.startsWith(`${normalizedParent}${sep}`);
}
