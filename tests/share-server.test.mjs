import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import net from "node:net";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("share sessions upload, stream state, and delete expired files", { timeout: 15_000 }, async () => {
  const storageRoot = await mkdtemp(join(tmpdir(), "pointking-share-test-"));
  const port = await findOpenPort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      SHARE_STORAGE_DIR: storageRoot,
      SHARE_TTL_MS: "1200",
      SHARE_CLEANUP_INTERVAL_MS: "250",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(child);
    const input = {
      title: "Two page PDF",
      file: { name: "sample.pdf", type: "application/pdf", size: 7, lastModified: 123 },
      state: {
        annotations: [],
        deletedPageIds: [],
        view: { zoom: 1.25, panX: 10, panY: 20 },
      },
    };
    const first = await postJson(`${origin}/api/share-sessions`, input, 201);
    const second = await postJson(`${origin}/api/share-sessions`, { ...input, title: "Unique" }, 201);
    assert.notEqual(first.id, second.id, "each share link must be unique");
    assert.match(first.id, /^[A-Za-z0-9_-]{20,64}$/);

    const uploadBytes = Buffer.from("PDFDATA");
    const upload = await fetch(`${origin}/api/share-sessions/${first.id}/file`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
        "X-File-Name": encodeURIComponent("sample.pdf"),
        "X-File-Last-Modified": "123",
      },
      body: uploadBytes,
    });
    assert.equal(upload.status, 201);
    assert.deepEqual(Buffer.from(await (await fetch(`${origin}/api/share-sessions/${first.id}/file`)).arrayBuffer()), uploadBytes);
    assert.deepEqual(await readFile(join(storageRoot, first.id, "source.bin")), uploadBytes);
    const head = await fetch(`${origin}/api/share-sessions/${first.id}/file`, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("accept-ranges"), "bytes");
    assert.equal(head.headers.get("content-length"), String(uploadBytes.length));
    const partial = await fetch(`${origin}/api/share-sessions/${first.id}/file`, { headers: { Range: "bytes=1-3" } });
    assert.equal(partial.status, 206);
    assert.equal(partial.headers.get("content-range"), `bytes 1-3/${uploadBytes.length}`);
    assert.deepEqual(Buffer.from(await partial.arrayBuffer()), uploadBytes.subarray(1, 4));
    assert.equal((await fetch(`${origin}/api/share-sessions/${first.id}/file`, { headers: { Range: "bytes=99-100" } })).status, 416);

    const abort = new AbortController();
    const stream = await fetch(`${origin}/api/share-sessions/${first.id}/events?clientId=client-alpha&role=host&name=Host`, {
      headers: { "X-Real-IP": "203.0.113.9" },
      signal: abort.signal,
    });
    assert.equal(stream.status, 200);
    const reader = stream.body.getReader();
    const snapshot = await readSseEvent(reader);
    assert.equal(snapshot.type, "snapshot");
    assert.deepEqual(snapshot.participants[0], {
      id: "client-alpha",
      role: "host",
      name: "设计师",
      ip: "203.0.113.9",
      connectedAt: snapshot.participants[0].connectedAt,
    });
    const profileResponse = await postJson(`${origin}/api/share-sessions/${first.id}/events`, {
      type: "profile",
      sender: "client-alpha",
      payload: { name: "小王" },
    }, 202);
    assert.equal(profileResponse.name, "小王");
    const renamedPresence = await readSseEvent(reader, "presence", (event) => event.participants[0]?.name === "小王");
    assert.equal(renamedPresence.participants[0].name, "小王");

    const eventResponse = await postJson(`${origin}/api/share-sessions/${first.id}/events`, {
      type: "annotations",
      sender: "client-beta",
      payload: {
        annotations: [{ id: "a1", type: "text", page: "2", text: "Synced" }],
        deletedPageIds: ["4"],
      },
    }, 202);
    assert.equal(eventResponse.ok, true);
    const event = await readSseEvent(reader, "annotations");
    assert.equal(event.payload.annotations[0].text, "Synced");
    assert.deepEqual(event.payload.deletedPageIds, ["4"]);
    abort.abort();

    await delay(180);
    const saved = JSON.parse(await readFile(join(storageRoot, first.id, "session.json"), "utf8"));
    assert.equal(saved.state.annotations[0].text, "Synced");
    assert.deepEqual(saved.state.deletedPageIds, ["4"]);

    const sharePage = await fetch(`${origin}/share/${first.id}`);
    assert.equal(sharePage.status, 200);
    assert.match(await sharePage.text(), /<base id="appBase" href="\/"/);
    assert.equal((await fetch(`${origin}/server.mjs`)).status, 404, "server source must not be publicly served");

    await delay(1450);
    const expired = await fetch(`${origin}/api/share-sessions/${first.id}`);
    assert.ok([404, 410].includes(expired.status));
    await assert.rejects(stat(join(storageRoot, first.id)));
  } finally {
    child.kill();
    await once(child, "exit").catch(() => {});
    await rm(storageRoot, { recursive: true, force: true });
  }
});

async function postJson(url, body, expectedStatus) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, expectedStatus);
  return response.json();
}

async function findOpenPort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForServer(child) {
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const timeout = setTimeout(() => child.kill(), 5_000);
  try {
    for await (const chunk of child.stdout) {
      if (String(chunk).includes("PointKing running")) return;
    }
    throw new Error(`PointKing server stopped before startup: ${stderr}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function readSseEvent(reader, expectedType = "snapshot", predicate = () => true) {
  const decoder = new TextDecoder();
  let buffer = "";
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    for (const block of buffer.split(/\n\n/)) {
      const line = block.split(/\n/).find((entry) => entry.startsWith("data: "));
      if (!line) continue;
      const event = JSON.parse(line.slice(6));
      if (event.type === expectedType && predicate(event)) return event;
    }
  }
  throw new Error(`Timed out waiting for SSE event ${expectedType}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
