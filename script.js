import * as pdfjs from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.mjs";

const app = document.querySelector(".app");
const canvasViewport = document.querySelector("#canvasViewport");
const canvasSurface = document.querySelector("#canvasSurface");
const pageStack = document.querySelector("#pageStack");
const leftResizeHandle = document.querySelector("#leftResizeHandle");
const rightResizeHandle = document.querySelector("#rightResizeHandle");
const leftCollapseBtn = document.querySelector("#leftCollapseBtn");
const rightCollapseBtn = document.querySelector("#rightCollapseBtn");
const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const docTitle = document.querySelector("#docTitle");
const fileName = document.querySelector("#fileName");
const fileMeta = document.querySelector("#fileMeta");
const tools = document.querySelectorAll(".tool");
const undoBtn = document.querySelector("#undoBtn");
const clearBtn = document.querySelector("#clearBtn");
const shareBtn = document.querySelector("#shareBtn");
const shareText = document.querySelector("#shareText");
const zoomReadout = document.querySelector("#zoomReadout");
const commentList = document.querySelector("#commentList");
const commentCount = document.querySelector("#commentCount");
const brandName = document.querySelector("#brandName");
const brandSub = document.querySelector("#brandSub");
const dropTitle = document.querySelector("#dropTitle");
const panelTitle = document.querySelector("#panelTitle");
const docSubtitle = document.querySelector("#docSubtitle");
const languageBtn = document.querySelector("#languageBtn");
const languageText = document.querySelector("#languageText");
const themeBtn = document.querySelector("#themeBtn");
const placeholderProduct = document.querySelector("#placeholderProduct");
const placeholderTitle = document.querySelector("#placeholderTitle");
const placeholderCopy = document.querySelector("#placeholderCopy");
const commentsTitle = document.querySelector("#commentsTitle");
const canvasMenu = createCanvasMenu();
const annotationNotice = createAnnotationNotice();
let commentImagePreview;

const translations = {
  zh: {
    appTitle: "\u6307\u70b9\u738b",
    brandSub: "\u6279\u6ce8\u5de5\u4f5c\u53f0",
    dropTitle: "\u62d6\u5165\u6587\u4ef6",
    panelTitle: "\u6587\u4ef6",
    docSubtitle: "\u5728\u7ebf\u6279\u6ce8 \u00b7 \u591a\u9875\u753b\u5e03",
    share: "\u5206\u4eab",
    copied: "\u5df2\u590d\u5236",
    ready: "\u5df2\u5c31\u7eea",
    comments: "\u6279\u6ce8",
    placeholderProduct: "\u6307\u70b9\u738b",
    placeholderTitle: "\u591a\u9875 PDF \u4e00\u6b21\u5c55\u5f00",
    placeholderCopy:
      "\u5bfc\u5165 PDF \u540e\uff0c\u9875\u9762\u4f1a\u5728\u65e0\u9650\u753b\u5e03\u4e0a\u7eb5\u5411\u6392\u5e03\u3002\u6309\u4f4f Ctrl \u5e76\u6eda\u52a8\u9f20\u6807\u53ef\u4ee5\u7f29\u653e\u753b\u5e03\u3002",
    markTool: "\u6279\u6ce8",
    selectTool: "\u9009\u62e9",
    textTool: "\u6587\u5b57",
    undo: "\u64a4\u9500",
    clear: "\u6e05\u7a7a",
    inputPlaceholder: "\u8f93\u5165\u610f\u89c1",
    unsavedAnnotation: "\u8bf7\u5148\u4fdd\u5b58\u5f53\u524d\u6279\u6ce8",
    editAnnotation: "\u7f16\u8f91",
    deleteAnnotation: "\u5220\u9664",
    markComment: "\u5df2\u521b\u5efa\u77e9\u5f62\u6807\u6ce8\u3002",
    textComment: "\u5df2\u521b\u5efa\u6587\u5b57\u6279\u6ce8\u3002",
    page: "\u7b2c ${page} \u9875",
    themeLight: "\u5207\u6362\u5230\u4eae\u8272",
    themeDark: "\u5207\u6362\u5230\u6697\u8272",
    collapseLeft: "\u6298\u53e0\u5de6\u680f",
    expandLeft: "\u5c55\u5f00\u5de6\u680f",
    collapseRight: "\u6298\u53e0\u53f3\u680f",
    expandRight: "\u5c55\u5f00\u53f3\u680f",
  },
  en: {
    appTitle: "PointKing",
    brandSub: "Review desk",
    dropTitle: "Drop file",
    panelTitle: "Files",
    docSubtitle: "Online review · Multi-page canvas",
    share: "Share",
    copied: "Copied",
    ready: "Ready",
    comments: "Comments",
    placeholderProduct: "PointKing",
    placeholderTitle: "Open every PDF page at once",
    placeholderCopy:
      "Import a PDF and every page is arranged on an infinite canvas. Hold Ctrl and scroll to zoom the canvas.",
    markTool: "Annotate",
    selectTool: "Select",
    textTool: "Text",
    undo: "Undo",
    clear: "Clear",
    inputPlaceholder: "Type feedback",
    unsavedAnnotation: "Save the current annotation first",
    editAnnotation: "Edit",
    deleteAnnotation: "Delete",
    markComment: "Rectangle mark created.",
    textComment: "Text note created.",
    page: "Page ${page}",
    themeLight: "Switch to light",
    themeDark: "Switch to dark",
    collapseLeft: "Collapse left panel",
    expandLeft: "Expand left panel",
    collapseRight: "Collapse right panel",
    expandRight: "Expand right panel",
  },
};

const svgNS = "http://www.w3.org/2000/svg";
const storagePrefix = "pointking.annotations.";
const lastDocumentKey = "pointking.lastDocument";
const defaultDocumentKey = "demo:homepage-review.pdf";
const fileDatabaseName = "pointking.files";
const fileStoreName = "documents";
const layoutStorageKey = "pointking.layout";
const languageStorageKey = "pointking.language";
const themeStorageKey = "pointking.theme";
const defaultAnnotationColor = "#6e7cff";
const annotationColors = ["#6e7cff", "#00c2a8", "#ff6b6b", "#f5a524", "#8b5cf6"];

let currentTool = "select";
let currentLanguage = localStorage.getItem(languageStorageKey) || "zh";
let currentTheme = localStorage.getItem(themeStorageKey) || "dark";
let currentDocumentKey = defaultDocumentKey;
let annotations = [];
let dragStart = null;
let dragPreview = null;
let activePointer = null;
let pan = { x: 0, y: 0 };
let zoom = 1;
let isPanning = false;
let lastPanPoint = null;
let editingAnnotationId = null;
let regionPreviewFrame = null;
let annotationNoticeTimer = null;
const pendingRegionPreviewIds = new Set();

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs";

commentImagePreview = createCommentImagePreview();
applyTheme();
applyLanguage();
restoreLayout();
centerCanvas();
initializeDocument();
bindResizeHandle(leftResizeHandle, "left");
bindResizeHandle(rightResizeHandle, "right");
bindCollapseButton(leftCollapseBtn, "left");
bindCollapseButton(rightCollapseBtn, "right");
renderLucideIcons();

languageBtn.addEventListener("click", () => {
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyLanguage();
  renderAnnotations();
});

themeBtn.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem(themeStorageKey, currentTheme);
  applyTheme();
});

tools.forEach((button) => {
  button.addEventListener("click", () => {
    setCurrentTool(button.dataset.tool);
  });
});

canvasViewport.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const annotation = event.target.closest(".annotation-ui");
  if (annotation?.dataset.annotationId) {
    showAnnotationContextMenu(event.clientX, event.clientY, annotation.dataset.annotationId);
    return;
  }

  showCanvasMenu(event.clientX, event.clientY);
});

document.addEventListener("pointerdown", (event) => {
  if (!canvasMenu.contains(event.target)) hideCanvasMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideCanvasMenu();
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragging");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragging");
});

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragging");
  const [file] = event.dataTransfer.files;
  if (file) loadFile(file);
});

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) loadFile(file);
});

canvasViewport.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      zoomAt(event.clientX, event.clientY, event.deltaY);
      return;
    }

    pan.x -= event.deltaX;
    pan.y -= event.deltaY;
    applyCanvasTransform();
  },
  { passive: false },
);

canvasViewport.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".annotation-ui")) return;

  const page = event.target.closest(".doc-page");
  activePointer = event.pointerId;

  if (!page || event.button === 1 || event.altKey || event.shiftKey) {
    beginPan(event);
    return;
  }

  if (hasOpenAnnotationEditor()) {
    event.preventDefault();
    event.stopPropagation();
    showUnsavedAnnotationNotice();
    focusCurrentAnnotationEditor();
    dragStart = null;
    dragPreview = null;
    return;
  }

  if (currentTool === "select") {
    removeEmptyDraftAnnotations();
    dragStart = null;
    return;
  }

  dragStart = getPagePoint(event, page);

  if (currentTool === "mark") {
    removeEmptyDraftAnnotations();
    dragPreview = addAnnotation({
      type: "mark",
      pageId: page.dataset.pageId,
      x: dragStart.x,
      y: dragStart.y,
      width: 0,
      height: 0,
      text: "",
      draft: true,
      preview: true,
    });
    return;
  }

});

canvasViewport.addEventListener("pointermove", (event) => {
  if (dragPreview && dragStart && currentTool === "mark") {
    const page = event.target.closest(".doc-page") || pageStack.querySelector(`.doc-page[data-page-id="${dragPreview.pageId}"]`);
    if (!page) return;

    updateDragPreview(event, page);
    return;
  }

  if (!isPanning || event.pointerId !== activePointer) return;
  pan.x += event.clientX - lastPanPoint.x;
  pan.y += event.clientY - lastPanPoint.y;
  lastPanPoint = { x: event.clientX, y: event.clientY };
  applyCanvasTransform();
});

canvasViewport.addEventListener("pointerup", (event) => {
  if (isPanning) {
    endPan(event);
    return;
  }

  const page = event.target.closest(".doc-page");
  if (!dragStart || currentTool !== "mark") {
    dragStart = null;
    dragPreview = null;
    return;
  }

  const targetPage = page || pageStack.querySelector(`.doc-page[data-page-id="${dragPreview?.pageId}"]`);
  if (!targetPage || !dragPreview) {
    dragStart = null;
    dragPreview = null;
    return;
  }

  const end = getPagePoint(event, targetPage);
  const distance = Math.hypot(end.x - dragStart.x, end.y - dragStart.y);
  if (distance > 2) {
    dragPreview.preview = false;
    dragPreview.width = Math.max(4, dragPreview.width);
    dragPreview.height = Math.max(3, dragPreview.height);
    renderAnnotations();
    focusAnnotationInput(dragPreview.id);
  } else {
    dragPreview.type = "text";
    dragPreview.preview = false;
    delete dragPreview.width;
    delete dragPreview.height;
    renderAnnotations();
    focusAnnotationInput(dragPreview.id);
  }
  dragStart = null;
  dragPreview = null;
});

canvasViewport.addEventListener("pointercancel", endPan);

undoBtn.addEventListener("click", () => {
  annotations.pop();
  saveAnnotations();
  renderAnnotations();
});

clearBtn.addEventListener("click", () => {
  annotations = [];
  saveAnnotations();
  renderAnnotations();
});

commentList.addEventListener("click", (event) => {
  const comment = event.target.closest("[data-annotation-id]");
  if (!comment) return;

  focusAnnotationFromComment(comment.dataset.annotationId);
});

commentList.addEventListener("mouseover", (event) => {
  const comment = event.target.closest("[data-annotation-id]");
  if (!comment || comment.contains(event.relatedTarget)) return;

  setAnnotationBreathing(comment.dataset.annotationId, true);
});

commentList.addEventListener("mouseout", (event) => {
  const comment = event.target.closest("[data-annotation-id]");
  if (!comment || comment.contains(event.relatedTarget)) return;

  setAnnotationBreathing(comment.dataset.annotationId, false);
});

shareBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("https://pointking.app/review/demo");
    setShareText(t("copied"));
  } catch {
    setShareText(t("ready"));
  }
  setTimeout(() => setShareText(t("share")), 1400);
});

window.addEventListener("resize", () => {
  updateSurfaceBounds();
  applyCanvasTransform();
});

function t(key, values = {}) {
  const value = translations[currentLanguage]?.[key] || translations.en[key] || key;
  return Object.entries(values).reduce((text, [name, replacement]) => text.replace(`\${${name}}`, replacement), value);
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("appTitle");
  brandName.textContent = t("appTitle");
  brandSub.textContent = t("brandSub");
  dropTitle.textContent = t("dropTitle");
  panelTitle.textContent = t("panelTitle");
  docSubtitle.textContent = t("docSubtitle");
  shareText.textContent = t("share");
  commentsTitle.textContent = t("comments");
  placeholderProduct.textContent = t("placeholderProduct");
  placeholderTitle.textContent = t("placeholderTitle");
  placeholderCopy.textContent = t("placeholderCopy");
  languageText.textContent = currentLanguage === "zh" ? "EN" : "\u4e2d";
  languageBtn.title = currentLanguage === "zh" ? "English" : "\u4e2d\u6587";
  languageBtn.setAttribute("aria-label", currentLanguage === "zh" ? "Switch to English" : "\u5207\u6362\u5230\u4e2d\u6587");
  updateToolLabels();
  updateCollapseButtons();
  applyTheme();
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
  const nextIcon = currentTheme === "dark" ? "sun" : "moon";
  themeBtn.replaceChildren(createIconPlaceholder(nextIcon));
  themeBtn.title = currentTheme === "dark" ? t("themeLight") : t("themeDark");
  themeBtn.setAttribute("aria-label", themeBtn.title);
  renderLucideIcons();
}

function updateToolLabels() {
  const selectTool = document.querySelector('[data-tool="select"]');
  const markTool = document.querySelector('[data-tool="mark"]');
  const textTool = document.querySelector('[data-tool="text"]');
  selectTool.title = t("selectTool");
  selectTool.setAttribute("aria-label", t("selectTool"));
  markTool.title = t("markTool");
  markTool.setAttribute("aria-label", t("markTool"));
  if (textTool) {
    textTool.title = t("textTool");
    textTool.setAttribute("aria-label", t("textTool"));
  }
  undoBtn.title = t("undo");
  undoBtn.setAttribute("aria-label", t("undo"));
  clearBtn.title = t("clear");
  clearBtn.setAttribute("aria-label", t("clear"));
  updateCanvasMenu();
}

function setCurrentTool(tool) {
  currentTool = tool;
  tools.forEach((item) => item.classList.toggle("active", item.dataset.tool === tool));
  canvasMenu.querySelectorAll("[data-menu-tool]").forEach((item) => item.classList.toggle("active", item.dataset.menuTool === tool));
}

function createCanvasMenu() {
  const menu = document.createElement("div");
  menu.className = "canvas-menu";
  menu.setAttribute("role", "menu");
  document.body.append(menu);
  return menu;
}

function createAnnotationNotice() {
  const notice = document.createElement("div");
  notice.className = "annotation-notice";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  document.body.append(notice);
  return notice;
}

function hasOpenAnnotationEditor() {
  return !!pageStack.querySelector(".annotation-editor");
}

function getCurrentEditorAnnotationId() {
  if (editingAnnotationId) return editingAnnotationId;
  return annotations.find((annotation) => annotation.draft)?.id || null;
}

function focusCurrentAnnotationEditor() {
  const annotationId = getCurrentEditorAnnotationId();
  if (annotationId) focusAnnotationInput(annotationId);
}

function showUnsavedAnnotationNotice() {
  annotationNotice.textContent = t("unsavedAnnotation");
  annotationNotice.classList.add("open");

  window.clearTimeout(annotationNoticeTimer);
  annotationNoticeTimer = window.setTimeout(() => {
    annotationNotice.classList.remove("open");
  }, 1800);
}

function updateCanvasMenu() {
  const items = [
    ["select", "mouse-pointer-2", t("selectTool")],
    ["mark", "message-square-text", t("markTool")],
  ];

  canvasMenu.replaceChildren(
    ...items.map(([tool, icon, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.menuTool = tool;
      button.classList.toggle("active", currentTool === tool);
      button.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
      button.addEventListener("click", () => {
        setCurrentTool(tool);
        hideCanvasMenu();
      });
      return button;
    }),
  );
  renderLucideIcons();
}

function updateAnnotationContextMenu(annotationId) {
  const items = [
    ["edit", "pencil", t("editAnnotation")],
    ["delete", "trash-2", t("deleteAnnotation")],
  ];

  canvasMenu.replaceChildren(
    ...items.map(([action, icon, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.annotationAction = action;
      if (action === "delete") button.classList.add("danger");
      button.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
      button.addEventListener("click", () => {
        if (action === "edit") openAnnotationEditor(annotationId);
        if (action === "delete") deleteAnnotation(annotationId);
        hideCanvasMenu();
      });
      return button;
    }),
  );
  renderLucideIcons();
}

function showCanvasMenu(clientX, clientY) {
  updateCanvasMenu();
  positionCanvasMenu(clientX, clientY);
}

function showAnnotationContextMenu(clientX, clientY, annotationId) {
  updateAnnotationContextMenu(annotationId);
  positionCanvasMenu(clientX, clientY);
}

function positionCanvasMenu(clientX, clientY) {
  canvasMenu.classList.add("open");
  const rect = canvasMenu.getBoundingClientRect();
  const x = Math.min(clientX, window.innerWidth - rect.width - 8);
  const y = Math.min(clientY, window.innerHeight - rect.height - 8);
  canvasMenu.style.left = `${Math.max(8, x)}px`;
  canvasMenu.style.top = `${Math.max(8, y)}px`;
}

function hideCanvasMenu() {
  canvasMenu.classList.remove("open");
}

function beginPan(event) {
  isPanning = true;
  lastPanPoint = { x: event.clientX, y: event.clientY };
  canvasViewport.classList.add("dragging");
  canvasViewport.setPointerCapture(event.pointerId);
}

function endPan(event) {
  if (activePointer != null && canvasViewport.hasPointerCapture?.(activePointer)) {
    canvasViewport.releasePointerCapture(activePointer);
  }
  isPanning = false;
  activePointer = null;
  lastPanPoint = null;
  canvasViewport.classList.remove("dragging");
  dragStart = null;
}

function centerCanvas() {
  updateSurfaceBounds();
  const viewport = canvasViewport.getBoundingClientRect();
  const stack = pageStack.getBoundingClientRect();
  const surface = canvasSurface.getBoundingClientRect();
  const stackX = stack.left - surface.left;
  const stackY = stack.top - surface.top;
  pan.x = viewport.width / 2 - (stackX + stack.width / 2) * zoom;
  pan.y = 34 - stackY * zoom;
  applyCanvasTransform();
}

function updateSurfaceBounds() {
  const minWidth = matchMedia("(max-width: 560px)").matches ? 2600 : 5200;
  const minHeight = matchMedia("(max-width: 560px)").matches ? 3600 : 5200;
  const requiredWidth = pageStack.offsetLeft + pageStack.offsetWidth + 2200;
  const requiredHeight = pageStack.offsetTop + pageStack.scrollHeight + 1200;
  canvasSurface.style.width = `${Math.max(minWidth, requiredWidth)}px`;
  canvasSurface.style.height = `${Math.max(minHeight, requiredHeight)}px`;
}

function zoomAt(clientX, clientY, deltaY) {
  const rect = canvasViewport.getBoundingClientRect();
  const pointerX = clientX - rect.left;
  const pointerY = clientY - rect.top;
  const oldZoom = zoom;
  const factor = Math.exp(-deltaY * 0.0012);
  zoom = clamp(zoom * factor, 0.35, 2.6);

  const worldX = (pointerX - pan.x) / oldZoom;
  const worldY = (pointerY - pan.y) / oldZoom;
  pan.x = pointerX - worldX * zoom;
  pan.y = pointerY - worldY * zoom;
  applyCanvasTransform();
}

function applyCanvasTransform() {
  canvasSurface.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  zoomReadout.textContent = `${Math.round(zoom * 100)}%`;
}

function bindResizeHandle(handle, side) {
  let startX = 0;
  let startWidth = 0;

  handle.addEventListener("pointerdown", (event) => {
    if (matchMedia("(max-width: 980px)").matches || isPanelCollapsed(side)) return;

    startX = event.clientX;
    startWidth = getPanelWidth(side);
    handle.classList.add("dragging");
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add("resizing-panels");
  });

  handle.addEventListener("pointermove", (event) => {
    if (!handle.classList.contains("dragging")) return;

    const delta = event.clientX - startX;
    const nextWidth = side === "left" ? startWidth + delta : startWidth - delta;
    setPanelWidth(side, nextWidth);
  });

  handle.addEventListener("pointerup", (event) => endResize(handle, event.pointerId));
  handle.addEventListener("pointercancel", (event) => endResize(handle, event.pointerId));
  handle.addEventListener("dblclick", () => {
    setPanelWidth(side, side === "left" ? 272 : 320);
    saveLayout();
  });
}

function bindCollapseButton(button, side) {
  button.addEventListener("pointerdown", (event) => event.stopPropagation());
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    setPanelCollapsed(side, !isPanelCollapsed(side));
    saveLayout();
  });
}

function setPanelCollapsed(side, collapsed) {
  app.classList.toggle(`${side}-collapsed`, collapsed);
  updateCollapseButtons();
  updateSurfaceBounds();
  applyCanvasTransform();
}

function isPanelCollapsed(side) {
  return app.classList.contains(`${side}-collapsed`);
}

function updateCollapseButtons() {
  const leftCollapsed = isPanelCollapsed("left");
  const rightCollapsed = isPanelCollapsed("right");

  leftCollapseBtn.setAttribute("aria-label", leftCollapsed ? t("expandLeft") : t("collapseLeft"));
  leftCollapseBtn.title = leftCollapsed ? t("expandLeft") : t("collapseLeft");
  leftCollapseBtn.replaceChildren(createIconPlaceholder(leftCollapsed ? "panel-left-open" : "panel-left-close"));

  rightCollapseBtn.setAttribute("aria-label", rightCollapsed ? t("expandRight") : t("collapseRight"));
  rightCollapseBtn.title = rightCollapsed ? t("expandRight") : t("collapseRight");
  rightCollapseBtn.replaceChildren(createIconPlaceholder(rightCollapsed ? "panel-right-open" : "panel-right-close"));

  renderLucideIcons();
}

function createIconPlaceholder(name) {
  const icon = document.createElement("i");
  icon.dataset.lucide = name;
  return icon;
}

function endResize(handle, pointerId) {
  if (!handle.classList.contains("dragging")) return;

  if (handle.hasPointerCapture?.(pointerId)) {
    handle.releasePointerCapture(pointerId);
  }
  handle.classList.remove("dragging");
  document.body.classList.remove("resizing-panels");
  saveLayout();
}

function getPanelWidth(side) {
  const property = side === "left" ? "--left-width" : "--right-width";
  return Number.parseFloat(getComputedStyle(app).getPropertyValue(property)) || (side === "left" ? 272 : 320);
}

function setPanelWidth(side, width) {
  const property = side === "left" ? "--left-width" : "--right-width";
  const maxWidth = Math.max(220, Math.floor(window.innerWidth * 0.42));
  const nextWidth = clamp(width, 180, maxWidth);
  app.style.setProperty(property, `${nextWidth}px`);
  updateSurfaceBounds();
}

function restoreLayout() {
  try {
    const layout = JSON.parse(localStorage.getItem(layoutStorageKey) || "{}");
    if (layout.leftWidth) app.style.setProperty("--left-width", `${layout.leftWidth}px`);
    if (layout.rightWidth) app.style.setProperty("--right-width", `${layout.rightWidth}px`);
    app.classList.toggle("left-collapsed", Boolean(layout.leftCollapsed));
    app.classList.toggle("right-collapsed", Boolean(layout.rightCollapsed));
    updateCollapseButtons();
  } catch {
    localStorage.removeItem(layoutStorageKey);
  }
}

function saveLayout() {
  localStorage.setItem(
    layoutStorageKey,
    JSON.stringify({
      leftWidth: getPanelWidth("left"),
      rightWidth: getPanelWidth("right"),
      leftCollapsed: isPanelCollapsed("left"),
      rightCollapsed: isPanelCollapsed("right"),
    }),
  );
}

function renderLucideIcons() {
  globalThis.lucide?.createIcons({
    attrs: {
      "aria-hidden": "true",
    },
  });
}

function setShareText(text) {
  shareText.textContent = text;
}

function getPagePoint(event, page) {
  const rect = page.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  };
}

function addAnnotation(annotation) {
  annotation.id ||= crypto.randomUUID?.() || `annotation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  annotation.color ||= defaultAnnotationColor;
  annotations.push(annotation);
  renderAnnotations();
  return annotation;
}

function renderAnnotations() {
  pageStack.querySelectorAll(".overlay").forEach((overlay) => {
    overlay.replaceChildren();
    overlay.setAttribute("viewBox", "0 0 100 100");
    overlay.setAttribute("preserveAspectRatio", "none");
  });
  pageStack.querySelectorAll(".annotation-layer").forEach((layer) => layer.replaceChildren());

  commentList.replaceChildren();
  let renderedCommentCount = 0;

  annotations.forEach((annotation) => {
    const page = pageStack.querySelector(`.doc-page[data-page-id="${annotation.pageId}"]`);
    if (!page) return;

    const layer = getAnnotationLayer(page);
    if (annotation.type === "mark") drawMark(layer, annotation);
    if (annotation.type === "text") drawTextNote(layer, annotation);
    if (!annotation.draft) {
      addComment(annotation);
      renderedCommentCount += 1;
    }
  });

  commentCount.textContent = String(renderedCommentCount);
}

function getAnnotationLayer(page) {
  let layer = page.querySelector(".annotation-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "annotation-layer";
    page.append(layer);
  }
  return layer;
}

function drawMark(layer, annotation) {
  const box = document.createElement("div");
  box.className = "annotation-ui mark-box";
  if (annotation.preview) box.classList.add("previewing");
  if (isAnnotationEditing(annotation)) box.classList.add("editing");
  box.dataset.annotationId = annotation.id;
  box.style.left = `${annotation.x}%`;
  box.style.top = `${annotation.y}%`;
  box.style.width = `${annotation.width}%`;
  box.style.height = `${annotation.height}%`;
  box.style.setProperty("--annotation-color", getAnnotationColor(annotation));

  if (annotation.preview) {
    layer.append(box);
    return;
  }

  if (hasAnnotationArrow(annotation)) {
    layer.append(createAnnotationArrow(annotation));
  }

  const handle = document.createElement("button");
  handle.className = "resize-corner";
  handle.type = "button";
  handle.setAttribute("aria-label", "\u8c03\u6574\u6807\u6ce8\u5927\u5c0f");
  const arrowHandle = document.createElement("button");
  arrowHandle.className = "arrow-anchor";
  arrowHandle.type = "button";
  arrowHandle.setAttribute("aria-label", currentLanguage === "zh" ? "\u62d6\u62fd\u7ed8\u5236\u6307\u793a\u7bad\u5934" : "Drag to draw pointer arrow");
  bindAnnotationResize(handle, annotation);
  bindAnnotationArrow(arrowHandle, annotation);
  bindMarkMove(box, annotation);
  bindAnnotationEdit(box, annotation);

  box.append(arrowHandle, handle);
  if (!shouldShowAnnotationEditor(annotation)) {
    box.append(createAnnotationTooltip(annotation));
  }
  layer.append(box);
  if (shouldShowAnnotationEditor(annotation)) {
    layer.append(createAnnotationEditor("mark-input", "mark-editor", annotation));
  }
  renderLucideIcons();
}

function updateDragPreview(event, page) {
  const end = getPagePoint(event, page);
  const x = Math.min(dragStart.x, end.x);
  const y = Math.min(dragStart.y, end.y);
  const width = Math.abs(end.x - dragStart.x);
  const height = Math.abs(end.y - dragStart.y);

  dragPreview.x = x;
  dragPreview.y = y;
  dragPreview.width = width;
  dragPreview.height = height;

  const box = pageStack.querySelector(`[data-annotation-id="${dragPreview.id}"]`);
  if (!box) return;

  box.style.left = `${x}%`;
  box.style.top = `${y}%`;
  box.style.width = `${width}%`;
  box.style.height = `${height}%`;
}

function hasAnnotationArrow(annotation) {
  return Number.isFinite(annotation.arrowX) && Number.isFinite(annotation.arrowY);
}

function createAnnotationArrow(annotation) {
  const svg = createSvg("svg", {
    class: "annotation-arrow",
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
  });
  svg.dataset.annotationId = annotation.id;
  svg.style.setProperty("--annotation-color", getAnnotationColor(annotation));

  const markerId = `arrow-head-${annotation.id}`;
  const defs = createSvg("defs");
  const marker = createSvg("marker", {
    id: markerId,
    markerWidth: "7",
    markerHeight: "7",
    refX: "6",
    refY: "3.5",
    orient: "auto",
    markerUnits: "strokeWidth",
  });
  const head = createSvg("path", { d: "M0,0 L7,3.5 L0,7 Z", fill: "currentColor" });
  marker.append(head);
  defs.append(marker);

  const line = createSvg("line", {
    x1: annotation.x,
    y1: annotation.y,
    x2: annotation.arrowX,
    y2: annotation.arrowY,
    "marker-end": `url(#${markerId})`,
  });
  svg.append(defs, line);
  return svg;
}

function updateAnnotationArrow(annotation) {
  const arrow = pageStack.querySelector(`.annotation-arrow[data-annotation-id="${annotation.id}"] line`);
  if (!arrow) return;

  arrow.setAttribute("x1", annotation.x);
  arrow.setAttribute("y1", annotation.y);
  arrow.setAttribute("x2", annotation.arrowX);
  arrow.setAttribute("y2", annotation.arrowY);
}

function drawTextNote(layer, annotation) {
  const note = document.createElement("div");
  note.className = "annotation-ui text-note";
  if (isAnnotationEditing(annotation)) note.classList.add("editing");
  note.dataset.annotationId = annotation.id;
  note.style.left = `${annotation.x}%`;
  note.style.top = `${annotation.y}%`;

  const dot = document.createElement("span");
  dot.className = "text-dot";
  note.style.setProperty("--annotation-color", getAnnotationColor(annotation));
  bindAnnotationEdit(note, annotation);

  note.append(dot);
  if (!shouldShowAnnotationEditor(annotation)) {
    note.append(createAnnotationTooltip(annotation));
  }
  layer.append(note);
  if (shouldShowAnnotationEditor(annotation)) {
    layer.append(createAnnotationEditor("text-input", "text-editor", annotation));
  }
  renderLucideIcons();
}

function shouldShowAnnotationEditor(annotation) {
  return annotation.draft || isAnnotationEditing(annotation);
}

function isAnnotationEditing(annotation) {
  return editingAnnotationId === annotation.id;
}

function createAnnotationTooltip(annotation) {
  const tooltip = document.createElement("div");
  tooltip.className = "annotation-tooltip";

  const text = document.createElement("p");
  text.textContent = annotation.text || t(`${annotation.type}Comment`);
  tooltip.append(text);

  if (hasReferenceImages(annotation)) {
    const image = document.createElement("img");
    image.className = "tooltip-reference";
    image.src = annotation.images[0];
    image.alt = currentLanguage === "zh" ? "\u53c2\u8003\u56fe" : "Reference image";
    tooltip.append(image);
  }

  return tooltip;
}

function createAnnotationEditor(inputClassName, editorClassName, annotation) {
  const editor = document.createElement("div");
  editor.className = `annotation-editor ${editorClassName}`;
  editor.dataset.annotationId = annotation.id;
  editor.style.setProperty("--annotation-color", getAnnotationColor(annotation));
  positionAnnotationEditor(editor, annotation);

  const saveButton = document.createElement("button");
  saveButton.className = "save-annotation";
  saveButton.type = "button";
  saveButton.setAttribute("aria-label", currentLanguage === "zh" ? "\u4fdd\u5b58\u6279\u6ce8" : "Save annotation");
  saveButton.append(createIconPlaceholder("check"));

  const colorRow = document.createElement("div");
  colorRow.className = "annotation-colors";
  annotationColors.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.className = "annotation-color";
    swatch.type = "button";
    swatch.style.setProperty("--swatch-color", color);
    swatch.classList.toggle("active", getAnnotationColor(annotation) === color);
    swatch.setAttribute("aria-label", currentLanguage === "zh" ? "\u4fee\u6539\u6279\u6ce8\u989c\u8272" : "Change annotation color");
    swatch.addEventListener("click", () => {
      annotation.color = color;
      editor.style.setProperty("--annotation-color", color);
      getAnnotationVisualElement(annotation.id)?.style.setProperty("--annotation-color", color);
      colorRow.querySelectorAll(".annotation-color").forEach((item) => item.classList.toggle("active", item === swatch));
    });
    colorRow.append(swatch);
  });

  const input = document.createElement("textarea");
  input.className = inputClassName;
  input.rows = 1;
  input.placeholder = t("inputPlaceholder");
  input.value = annotation.text || "";
  const inputRow = document.createElement("div");
  inputRow.className = "annotation-input-row";
  const body = document.createElement("div");
  body.className = "editor-body";
  const references = createReferenceList(annotation);
  const updateSaveState = () => {
    saveButton.classList.toggle("visible", input.value.trim().length > 0 || hasReferenceImages(annotation));
  };

  editor.addEventListener("pointerdown", (event) => event.stopPropagation());
  saveButton.addEventListener("click", () => commitAnnotation(annotation.id, input.value));
  input.addEventListener("input", updateSaveState);
  input.addEventListener("paste", (event) => handleAnnotationPaste(event, annotation, references, updateSaveState));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commitAnnotation(annotation.id, input.value);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelAnnotation(annotation.id);
    }
  });

  inputRow.append(input, saveButton);
  body.append(colorRow, inputRow, references);
  editor.append(body);
  updateSaveState();
  return editor;
}

function positionAnnotationEditor(editor, annotation) {
  editor.style.top = `${annotation.y}%`;

  if (annotation.type === "mark") {
    const openToLeft = annotation.x + annotation.width > 70;
    editor.classList.toggle("flipped", openToLeft);
    editor.style.left = openToLeft ? `calc(${annotation.x}% - 10px)` : `calc(${annotation.x + annotation.width}% + 10px)`;
    return;
  }

  editor.style.left = `calc(${annotation.x}% + 14px)`;
}

function getAnnotationVisualElement(annotationId) {
  return pageStack.querySelector(`.annotation-ui[data-annotation-id="${annotationId}"]`);
}

function createReferenceList(annotation) {
  const list = document.createElement("div");
  list.className = "reference-list";
  (annotation.images || []).forEach((src) => {
    const image = document.createElement("img");
    image.className = "reference-image";
    image.src = src;
    image.alt = currentLanguage === "zh" ? "\u53c2\u8003\u56fe" : "Reference image";
    list.append(image);
  });
  return list;
}

function handleAnnotationPaste(event, annotation, references, onChange) {
  const imageItems = [...event.clipboardData?.items || []].filter((item) => item.type.startsWith("image/"));
  if (!imageItems.length) return;

  event.preventDefault();
  annotation.images ||= [];

  imageItems.forEach((item) => {
    const file = item.getAsFile();
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      annotation.images.push(src);
      const image = document.createElement("img");
      image.className = "reference-image";
      image.src = src;
      image.alt = currentLanguage === "zh" ? "\u53c2\u8003\u56fe" : "Reference image";
      references.append(image);
      onChange?.();
      if (!annotation.draft) saveAnnotations();
    };
    reader.readAsDataURL(file);
  });
}

function getAnnotationColor(annotation) {
  return annotation.color || defaultAnnotationColor;
}

function focusAnnotationInput(annotationId) {
  requestAnimationFrame(() => {
    const input = pageStack.querySelector(`[data-annotation-id="${annotationId}"] textarea`);
    input?.focus();
    input?.select();
  });
}

function openAnnotationEditor(annotationId) {
  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation || annotation.preview) return;

  editingAnnotationId = annotationId;
  renderAnnotations();
  focusAnnotationInput(annotationId);
}

function commitAnnotation(annotationId, value) {
  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation) return;

  const text = value.trim();
  if (!text && !hasReferenceImages(annotation)) {
    cancelAnnotation(annotationId);
    return;
  }

  annotation.text = text;
  annotation.draft = false;
  editingAnnotationId = null;
  saveAnnotations();
  renderAnnotations();
  highlightAnnotation(annotationId);
}

function cancelAnnotation(annotationId) {
  const index = annotations.findIndex((item) => item.id === annotationId);
  if (index === -1) return;

  if (!annotations[index].draft) {
    editingAnnotationId = null;
    renderAnnotations();
    return;
  }

  annotations.splice(index, 1);
  if (editingAnnotationId === annotationId) editingAnnotationId = null;
  saveAnnotations();
  renderAnnotations();
}

function deleteAnnotation(annotationId) {
  const index = annotations.findIndex((item) => item.id === annotationId);
  if (index === -1) return;

  annotations.splice(index, 1);
  if (editingAnnotationId === annotationId) editingAnnotationId = null;
  pendingRegionPreviewIds.delete(annotationId);
  saveAnnotations();
  renderAnnotations();
}

function removeEmptyDraftAnnotations() {
  const before = annotations.length;
  annotations = annotations.filter((annotation) => !annotation.draft || annotation.text?.trim() || hasReferenceImages(annotation));
  if (annotations.length !== before) {
    if (!annotations.some((annotation) => annotation.id === editingAnnotationId)) editingAnnotationId = null;
    saveAnnotations();
    renderAnnotations();
  }
}

function hasReferenceImages(annotation) {
  return Array.isArray(annotation.images) && annotation.images.length > 0;
}

function bindMarkMove(box, annotation) {
  box.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".annotation-editor, .resize-corner, .arrow-anchor")) return;
    if (event.detail > 1) return;

    event.preventDefault();
    event.stopPropagation();

    const page = box.closest(".doc-page");
    const start = getPagePoint(event, page);
    const startX = annotation.x;
    const startY = annotation.y;
    box.classList.add("moving");

    const move = (moveEvent) => {
      const next = getPagePoint(moveEvent, page);
      annotation.x = clamp(startX + next.x - start.x, 0, 100 - annotation.width);
      annotation.y = clamp(startY + next.y - start.y, 0, 100 - annotation.height);
      box.style.left = `${annotation.x}%`;
      box.style.top = `${annotation.y}%`;
      updateAnnotationArrow(annotation);
      scheduleRegionPreviewRefresh(annotation.id);
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      box.classList.remove("moving");
      if (!annotation.draft) saveAnnotations();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  });
}

function bindAnnotationEdit(element, annotation) {
  element.addEventListener("dblclick", (event) => {
    if (event.target.closest(".annotation-editor, .resize-corner, .arrow-anchor")) return;
    event.preventDefault();
    event.stopPropagation();
    openAnnotationEditor(annotation.id);
  });
}

function bindAnnotationArrow(handle, annotation) {
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const page = handle.closest(".doc-page");
    if (!page) return;

    handle.setPointerCapture?.(event.pointerId);
    const layer = getAnnotationLayer(page);
    if (!hasAnnotationArrow(annotation)) {
      annotation.arrowX = annotation.x;
      annotation.arrowY = annotation.y;
      layer.prepend(createAnnotationArrow(annotation));
    }

    const move = (moveEvent) => {
      const next = getPagePoint(moveEvent, page);
      annotation.arrowX = clamp(next.x, 0, 100);
      annotation.arrowY = clamp(next.y, 0, 100);
      updateAnnotationArrow(annotation);
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      handle.releasePointerCapture?.(event.pointerId);
      if (!annotation.draft) saveAnnotations();
    };

    move(event);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  });
}

function bindAnnotationResize(handle, annotation) {
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const page = handle.closest(".doc-page");
    const start = getPagePoint(event, page);
    const startWidth = annotation.width;
    const startHeight = annotation.height;
    const box = handle.closest(".mark-box");
    box.classList.add("resizing");

    const move = (moveEvent) => {
      const next = getPagePoint(moveEvent, page);
      annotation.width = clamp(startWidth + next.x - start.x, 4, 100 - annotation.x);
      annotation.height = clamp(startHeight + next.y - start.y, 3, 100 - annotation.y);
      box.style.width = `${annotation.width}%`;
      box.style.height = `${annotation.height}%`;
      scheduleRegionPreviewRefresh(annotation.id);
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      box.classList.remove("resizing");
      if (!annotation.draft) saveAnnotations();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  });
}

function createSvg(name, attributes = {}) {
  const element = document.createElementNS(svgNS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function addComment(annotation) {
  const article = document.createElement("article");
  article.className = "comment";
  article.dataset.annotationId = annotation.id;
  article.tabIndex = 0;
  article.style.setProperty("--annotation-color", getAnnotationColor(annotation));

  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = "PK";

  const body = document.createElement("div");
  body.className = "comment-body";

  const title = document.createElement("strong");
  title.textContent = `${t(`${annotation.type}Tool`)} \u00b7 ${t("page", { page: annotation.pageId })}`;

  const text = document.createElement("p");
  text.textContent = annotation.text || t(`${annotation.type}Comment`);

  const time = document.createElement("time");
  time.textContent = currentLanguage === "zh" ? "\u521a\u521a" : "Just now";

  body.append(title, text);
  if (annotation.type === "mark") {
    const regionPreview = createCommentRegionPreview(annotation);
    if (regionPreview) body.append(regionPreview);
  }
  if (hasReferenceImages(annotation)) body.append(createCommentReferences(annotation));
  body.append(time);
  article.append(avatar, body);
  commentList.prepend(article);
}

function createCommentRegionPreview(annotation) {
  const src = createAnnotationRegionImage(annotation);
  if (!src) return null;

  const button = document.createElement("button");
  button.className = "comment-region-preview";
  button.type = "button";
  button.setAttribute("aria-label", currentLanguage === "zh" ? "\u67e5\u770b\u77e9\u5f62\u533a\u57df\u622a\u56fe" : "View marked region");

  const image = document.createElement("img");
  image.src = src;
  image.alt = currentLanguage === "zh" ? "\u77e9\u5f62\u533a\u57df\u622a\u56fe" : "Marked region preview";

  button.append(image);
  button.addEventListener("pointerenter", (event) => showCommentImagePreview(image.src, event.currentTarget));
  button.addEventListener("pointermove", (event) => positionCommentImagePreview(event.currentTarget));
  button.addEventListener("pointerleave", hideCommentImagePreview);
  button.addEventListener("focus", (event) => showCommentImagePreview(image.src, event.currentTarget));
  button.addEventListener("blur", hideCommentImagePreview);
  return button;
}

function createAnnotationRegionImage(annotation) {
  if (annotation.type !== "mark" || annotation.preview) return "";

  const page = pageStack.querySelector(`.doc-page[data-page-id="${annotation.pageId}"]`);
  const canvas = page?.querySelector("canvas");
  if (!canvas?.width || !canvas?.height || !annotation.width || !annotation.height) return "";

  const sx = clamp((annotation.x / 100) * canvas.width, 0, canvas.width);
  const sy = clamp((annotation.y / 100) * canvas.height, 0, canvas.height);
  const sw = clamp((annotation.width / 100) * canvas.width, 1, canvas.width - sx);
  const sh = clamp((annotation.height / 100) * canvas.height, 1, canvas.height - sy);
  const maxWidth = 420;
  const scale = Math.min(1, maxWidth / sw);
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(sw * scale));
  output.height = Math.max(1, Math.round(sh * scale));

  const context = output.getContext("2d");
  context.drawImage(canvas, sx, sy, sw, sh, 0, 0, output.width, output.height);
  return output.toDataURL("image/jpeg", 0.82);
}

function scheduleRegionPreviewRefresh(annotationId) {
  pendingRegionPreviewIds.add(annotationId);
  if (regionPreviewFrame) return;

  regionPreviewFrame = requestAnimationFrame(() => {
    regionPreviewFrame = null;
    const ids = [...pendingRegionPreviewIds];
    pendingRegionPreviewIds.clear();
    ids.forEach(refreshCommentRegionPreview);
  });
}

function refreshCommentRegionPreview(annotationId) {
  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation || annotation.draft) return;

  const image = commentList.querySelector(`[data-annotation-id="${annotationId}"] .comment-region-preview img`);
  if (!image) return;

  const src = createAnnotationRegionImage(annotation);
  if (src) image.src = src;
}

function createCommentReferences(annotation) {
  const list = document.createElement("div");
  list.className = "comment-reference-list";

  annotation.images.forEach((src, index) => {
    const button = document.createElement("button");
    button.className = "comment-reference-thumb";
    button.type = "button";
    button.setAttribute(
      "aria-label",
      currentLanguage === "zh" ? `\u67e5\u770b\u53c2\u8003\u56fe ${index + 1}` : `View reference image ${index + 1}`,
    );

    const image = document.createElement("img");
    image.src = src;
    image.alt = currentLanguage === "zh" ? "\u53c2\u8003\u56fe" : "Reference image";

    button.append(image);
    button.addEventListener("pointerenter", (event) => showCommentImagePreview(src, event.currentTarget));
    button.addEventListener("pointermove", (event) => positionCommentImagePreview(event.currentTarget));
    button.addEventListener("pointerleave", hideCommentImagePreview);
    button.addEventListener("focus", (event) => showCommentImagePreview(src, event.currentTarget));
    button.addEventListener("blur", hideCommentImagePreview);
    list.append(button);
  });

  return list;
}

function createCommentImagePreview() {
  const preview = document.createElement("div");
  preview.className = "comment-image-preview";

  const image = document.createElement("img");
  image.alt = currentLanguage === "zh" ? "\u53c2\u8003\u56fe\u9884\u89c8" : "Reference image preview";
  preview.append(image);
  document.body.append(preview);
  return preview;
}

function showCommentImagePreview(src, anchor) {
  const image = commentImagePreview.querySelector("img");
  image.src = src;
  image.alt = currentLanguage === "zh" ? "\u53c2\u8003\u56fe\u9884\u89c8" : "Reference image preview";
  commentImagePreview.classList.add("open");
  positionCommentImagePreview(anchor);
}

function positionCommentImagePreview(anchor) {
  const rect = anchor.getBoundingClientRect();
  const previewWidth = Math.min(320, window.innerWidth - 24);
  const previewHeight = 240;
  const x = clamp(rect.right + 10, 12, window.innerWidth - previewWidth - 12);
  const y = clamp(rect.top, 12, window.innerHeight - previewHeight - 12);

  commentImagePreview.style.left = `${x}px`;
  commentImagePreview.style.top = `${y}px`;
  commentImagePreview.style.width = `${previewWidth}px`;
}

function hideCommentImagePreview() {
  commentImagePreview.classList.remove("open");
}

function focusAnnotationFromComment(annotationId) {
  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation) return;

  const page = pageStack.querySelector(`.doc-page[data-page-id="${annotation.pageId}"]`);
  const target = pageStack.querySelector(`[data-annotation-id="${annotationId}"]`);
  if (!page || !target) return;

  const pageX = pageStack.offsetLeft + page.offsetLeft;
  const pageY = pageStack.offsetTop + page.offsetTop;
  const x = annotation.type === "mark" ? annotation.x + annotation.width / 2 : annotation.x;
  const y = annotation.type === "mark" ? annotation.y + annotation.height / 2 : annotation.y;
  const worldX = pageX + (x / 100) * page.offsetWidth;
  const worldY = pageY + (y / 100) * page.offsetHeight;
  const viewport = canvasViewport.getBoundingClientRect();

  pan.x = viewport.width / 2 - worldX * zoom;
  pan.y = viewport.height / 2 - worldY * zoom;
  applyCanvasTransform();

  highlightAnnotation(annotationId);
}

function setAnnotationBreathing(annotationId, active) {
  const target = pageStack.querySelector(`.annotation-ui[data-annotation-id="${annotationId}"]`);
  target?.classList.toggle("breathing", active);
}

function highlightAnnotation(annotationId) {
  pageStack.querySelectorAll(".annotation-ui.focused").forEach((item) => item.classList.remove("focused"));
  commentList.querySelectorAll(".comment.active").forEach((item) => item.classList.remove("active"));

  const target = pageStack.querySelector(`[data-annotation-id="${annotationId}"]`);
  const comment = commentList.querySelector(`[data-annotation-id="${annotationId}"]`);
  target?.classList.add("focused");
  comment?.classList.add("active");

  setTimeout(() => {
    target?.classList.remove("focused");
    comment?.classList.remove("active");
  }, 1000);
}

async function loadFile(file) {
  currentDocumentKey = getDocumentKey(file);
  try {
    localStorage.setItem(lastDocumentKey, currentDocumentKey);
  } catch {}
  storeDocumentFile(currentDocumentKey, file).catch(() => {});
  docTitle.textContent = file.name;
  fileName.textContent = file.name;
  fileMeta.textContent = `${formatBytes(file.size)} \u00b7 \u672c\u5730\u9884\u89c8`;
  await restoreAnnotationsForCurrentDocument();
  resetPages();

  if (file.type.startsWith("image/")) {
    await renderImage(file);
    return;
  }

  if (file.type === "application/pdf") await renderPdf(file);
}

function resetPages() {
  pageStack.replaceChildren();
  renderAnnotations();
}

function createPage(pageId, width, height) {
  const page = document.createElement("div");
  page.className = "doc-page";
  page.dataset.pageId = String(pageId);
  page.style.aspectRatio = `${width} / ${height}`;
  page.style.minHeight = "0";

  const canvas = document.createElement("canvas");
  const overlay = createSvg("svg", { class: "overlay", "aria-label": "Annotations" });
  const annotationLayer = document.createElement("div");
  annotationLayer.className = "annotation-layer";
  const badge = document.createElement("span");
  badge.className = "page-badge";
  badge.textContent = `Page ${pageId}`;

  page.append(canvas, overlay, annotationLayer, badge);
  pageStack.append(page);
  return { page, canvas };
}

function renderImage(file) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const { canvas } = createPage(1, image.naturalWidth, image.naturalHeight);
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
      fileMeta.textContent = `${formatBytes(file.size)} \u00b7 image \u00b7 \u672c\u5730\u9884\u89c8`;
      renderAnnotations();
      centerCanvas();
      resolve();
    };
    image.src = URL.createObjectURL(file);
  });
}

async function renderPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const pdfPage = await pdf.getPage(pageNumber);
    const viewport = pdfPage.getViewport({ scale: 1.6 });
    const { canvas } = createPage(pageNumber, viewport.width, viewport.height);
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pdfPage.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  }

  fileMeta.textContent = `${pdf.numPages} pages \u00b7 \u672c\u5730\u9884\u89c8`;
  renderAnnotations();
  centerCanvas();
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function initializeDocument() {
  if (await loadFixtureFromQuery()) return;

  const restored = await restoreLastDocumentFile();
  if (!restored) {
    await restoreAnnotationsForCurrentDocument();
    renderAnnotations();
  }
}

function getDocumentKey(file) {
  return `${file.name}:${file.size}:${file.lastModified || 0}`;
}

async function restoreAnnotationsForCurrentDocument() {
  let restoredAnnotations = null;

  const record = await readAnnotationSnapshot(currentDocumentKey).catch(() => null);
  if (Array.isArray(record?.annotations)) {
    restoredAnnotations = record.annotations;
  }

  if (!restoredAnnotations) {
    try {
      const stored = localStorage.getItem(`${storagePrefix}${currentDocumentKey}`);
      restoredAnnotations = stored ? JSON.parse(stored) : [];
    } catch {
      restoredAnnotations = [];
    }
  }

  try {
    annotations = restoredAnnotations.filter(isSupportedAnnotation).map(normalizeAnnotation);
  } catch {
    annotations = [];
  }
}

function isSupportedAnnotation(annotation) {
  return annotation?.type === "mark" || annotation?.type === "text";
}

function normalizeAnnotation(annotation) {
  return {
    ...annotation,
    color: annotation.color || defaultAnnotationColor,
  };
}

function saveAnnotations() {
  const snapshot = annotations.filter((annotation) => !annotation.draft && (annotation.text?.trim() || hasReferenceImages(annotation)));
  try {
    localStorage.setItem(lastDocumentKey, currentDocumentKey);
    localStorage.setItem(`${storagePrefix}${currentDocumentKey}`, JSON.stringify(snapshot));
  } catch {}
  storeAnnotationSnapshot(currentDocumentKey, snapshot).catch(() => {});
}

async function loadFixtureFromQuery() {
  const fixture = new URLSearchParams(location.search).get("fixture");
  if (!fixture) return false;

  const response = await fetch(fixture);
  const blob = await response.blob();
  const name = fixture.split("/").pop() || "fixture.pdf";
  const type = name.toLowerCase().endsWith(".pdf") ? "application/pdf" : blob.type;
  await loadFile(new File([blob], name, { type }));
  return true;
}

async function restoreLastDocumentFile() {
  const documentKey = localStorage.getItem(lastDocumentKey);
  if (!documentKey || documentKey === defaultDocumentKey) return false;

  const record = await readDocumentFile(documentKey).catch(() => null);
  if (!record?.file) return false;

  await loadFile(record.file);
  return true;
}

function openFilesDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(fileDatabaseName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(fileStoreName, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withFileStore(mode, callback) {
  const database = await openFilesDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(fileStoreName, mode);
    const store = transaction.objectStore(fileStoreName);
    const result = callback(store);

    transaction.oncomplete = () => {
      database.close();
      resolve(result?.result);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

function storeDocumentFile(key, file) {
  return withFileStore("readwrite", (store) =>
    store.put({
      key,
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      savedAt: Date.now(),
    }),
  );
}

function readDocumentFile(key) {
  return withFileStore("readonly", (store) => store.get(key));
}

function getAnnotationRecordKey(documentKey) {
  return `annotations:${documentKey}`;
}

function storeAnnotationSnapshot(documentKey, snapshot) {
  return withFileStore("readwrite", (store) =>
    store.put({
      key: getAnnotationRecordKey(documentKey),
      annotations: snapshot,
      savedAt: Date.now(),
      type: "annotations",
    }),
  );
}

function readAnnotationSnapshot(documentKey) {
  return withFileStore("readonly", (store) => store.get(getAnnotationRecordKey(documentKey)));
}



