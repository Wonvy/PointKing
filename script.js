import * as pdfjs from "./vendor/pdfjs/pdf.min.mjs";

const app = document.querySelector(".app");
const canvasViewport = document.querySelector("#canvasViewport");
const canvasSurface = document.querySelector("#canvasSurface");
const emptyState = document.querySelector("#emptyState");
const pageStack = document.querySelector("#pageStack");
const leftResizeHandle = document.querySelector("#leftResizeHandle");
const rightResizeHandle = document.querySelector("#rightResizeHandle");
const leftCollapseBtn = document.querySelector("#leftCollapseBtn");
const rightCollapseBtn = document.querySelector("#rightCollapseBtn");
const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const docTitle = document.querySelector("#docTitle");
const documentList = document.querySelector("#documentList");
const fileName = document.querySelector("#fileName");
const fileMeta = document.querySelector("#fileMeta");
const tools = document.querySelectorAll(".tool[data-tool]");
const magnifierBtn = document.querySelector("#magnifierBtn");
const undoBtn = document.querySelector("#undoBtn");
const clearBtn = document.querySelector("#clearBtn");
const shareBtn = document.querySelector("#shareBtn");
const shareText = document.querySelector("#shareText");
const mobileFileBtn = document.querySelector("#mobileFileBtn");
const mobileFileText = document.querySelector("#mobileFileText");
const newDocumentBtn = document.querySelector("#newDocumentBtn");
const mobileZoomControl = document.querySelector("#mobileZoomControl");
const mobileZoomSlider = document.querySelector("#mobileZoomSlider");
const zoomReadout = document.querySelector("#zoomReadout");
const statusFileName = document.querySelector("#statusFileName");
const statusFileMeta = document.querySelector("#statusFileMeta");
const statusCommentCount = document.querySelector("#statusCommentCount");
const statusZoom = document.querySelector("#statusZoom");
const statusZoomSlider = document.querySelector("#statusZoomSlider");
const detailToggleBtn = document.querySelector("#detailToggleBtn");
const commentList = document.querySelector("#commentList");
const commentCount = document.querySelector("#commentCount");
const commentSearch = document.querySelector("#commentSearch");
const commentFilterTabs = document.querySelector("#commentFilterTabs");
const brandName = document.querySelector("#brandName");
const brandSub = document.querySelector("#brandSub");
const dropTitle = document.querySelector("#dropTitle");
const panelTitle = document.querySelector("#panelTitle");
const docSubtitle = document.querySelector("#docSubtitle");
const languageBtn = document.querySelector("#languageBtn");
const languageText = document.querySelector("#languageText");
const themeBtn = document.querySelector("#themeBtn");
const placeholderTitle = document.querySelector("#placeholderTitle");
const placeholderCopy = document.querySelector("#placeholderCopy");
const placeholderFileBtn = document.querySelector("#placeholderFileBtn");
const placeholderPasteBtn = document.querySelector("#placeholderPasteBtn");
const commentsTitle = document.querySelector("#commentsTitle");
const canvasMenu = createCanvasMenu();
const annotationNotice = createAnnotationNotice();
const magnifierLens = createMagnifierLens();
const confirmDialog = createConfirmDialog();
const renameDialog = createRenameDialog();
let commentImagePreview;

const translations = {
  zh: {
    appTitle: "PointKing",
    brandSub: "",
    dropTitle: "\u62d6\u5165\u6587\u4ef6",
    chooseFile: "\u9009\u62e9\u6587\u4ef6",
    newDocument: "\u65b0\u5efa",
    blankDocument: "\u65b0\u5efa\u753b\u5e03",
    blankMeta: "\u7a7a\u767d\u753b\u5e03",
    panelTitle: "\u6587\u4ef6",
    docSubtitle: "",
    share: "\u5bfc\u51fa",
    copied: "\u5bfc\u51fa\u529f\u80fd\u5f85\u6dfb\u52a0",
    ready: "\u5df2\u5c31\u7eea",
    comments: "\u6279\u6ce8",
    placeholderTitle: "\u6dfb\u52a0\u6587\u4ef6",
    placeholderCopy: "\u5bfc\u5165\u6587\u4ef6\u6216\u7c98\u8d34\u56fe\u7247\u5f00\u59cb\u6279\u6ce8\u3002",
    markTool: "\u6279\u6ce8",
    magnifierTool: "\u653e\u5927\u955c",
    selectTool: "\u9009\u62e9",
    textTool: "\u6587\u5b57",
    undo: "\u64a4\u9500",
    clear: "\u6e05\u7a7a",
    inputPlaceholder: "\u8f93\u5165\u610f\u89c1",
    suggestionTab: "\u5efa\u8bae",
    editTextTab: "\u4fee\u6539\u6587\u672c",
    deleteTab: "\u5220\u9664",
    editTextPlaceholder: "\u8f93\u5165\u9700\u8981\u66ff\u6362\u7684\u6587\u672c",
    deletePlaceholder: "\u8f93\u5165\u9700\u8981\u5220\u9664\u7684\u5185\u5bb9\u6216\u8bf4\u660e",
    deleteFallback: "\u5220\u9664\u6b64\u533a\u57df\u5185\u5bb9",
    renameDocument: "\u91cd\u547d\u540d",
    renameDocumentPrompt: "\u8f93\u5165\u65b0\u6587\u6863\u540d\u79f0",
    searchAnnotations: "\u641c\u7d22\u6279\u6ce8",
    filterAll: "\u5168\u90e8",
    confirmClearTitle: "\u5220\u9664\u5168\u90e8\u6279\u6ce8\uff1f",
    confirmClearBody: "\u6b64\u64cd\u4f5c\u4f1a\u5220\u9664\u53f3\u4fa7\u5217\u8868\u548c\u753b\u5e03\u4e0a\u7684\u6240\u6709\u6279\u6ce8\uff0c\u65e0\u6cd5\u64a4\u56de\u3002",
    confirmDeleteDocumentTitle: "\u5220\u9664\u6587\u6863\uff1f",
    confirmDeleteDocumentBody: "\u5220\u9664\u300c${name}\u300d\u540e\uff0c\u6587\u4ef6\u548c\u5b83\u7684\u6279\u6ce8\u90fd\u4f1a\u4ece\u5de5\u4f5c\u53f0\u79fb\u9664\u3002",
    confirmDeleteDocumentsTitle: "\u5220\u9664 ${count} \u4e2a\u6587\u6863\uff1f",
    confirmDeleteDocumentsBody: "\u5220\u9664\u540e\uff0c\u8fd9\u4e9b\u6587\u4ef6\u548c\u5b83\u4eec\u7684\u6279\u6ce8\u90fd\u4f1a\u4ece\u5de5\u4f5c\u53f0\u79fb\u9664\u3002",
    confirmDeletePageTitle: "\u5220\u9664\u753b\u677f\uff1f",
    confirmDeletePageBody: "\u5220\u9664 Page ${page} \u540e\uff0c\u8fd9\u4e00\u9875\u4e0a\u7684\u6279\u6ce8\u4e5f\u4f1a\u4e00\u8d77\u79fb\u9664\u3002",
    cancel: "\u53d6\u6d88",
    confirmDelete: "\u5220\u9664",
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
    detailCallouts: "\u663e\u793a\u8be6\u7ec6\u6279\u6ce8",
    pasteClipboard: "\u7c98\u8d34\u526a\u8d34\u677f",
    pasteReading: "\u6b63\u5728\u8bfb\u53d6\u526a\u8d34\u677f\u2026\u2026\u5982\u679c\u6ca1\u6709\u53cd\u5e94\uff0c\u8bf7\u76f4\u63a5\u6309 Ctrl+V \u7c98\u8d34\u56fe\u7247\u3002",
    pasteImageHint: "\u6d4f\u89c8\u5668\u4e0d\u5141\u8bb8\u6309\u94ae\u8bfb\u53d6\u526a\u8d34\u677f\u56fe\u7247\uff0c\u8bf7\u6309 Ctrl+V \u7c98\u8d34\u3002",
    pasteNoImage: "\u526a\u8d34\u677f\u91cc\u6ca1\u6709\u53ef\u7c98\u8d34\u7684\u56fe\u7247",
    pastedImage: "\u5df2\u7c98\u8d34\u56fe\u7247",
    submitShortcut: "\u63d0\u4ea4\u65b9\u5f0f",
    enterSubmit: "Enter \u63d0\u4ea4",
    ctrlEnterSubmit: "Ctrl+Enter \u63d0\u4ea4",
  },
  en: {
    appTitle: "PointKing",
    brandSub: "",
    dropTitle: "Drop file",
    chooseFile: "Choose file",
    newDocument: "New",
    blankDocument: "New board",
    blankMeta: "Blank board",
    panelTitle: "Files",
    docSubtitle: "",
    share: "Export",
    copied: "Export coming soon",
    ready: "Ready",
    comments: "Comments",
    placeholderTitle: "Add a file",
    placeholderCopy: "Import a file or paste an image to start reviewing.",
    markTool: "Annotate",
    magnifierTool: "Magnifier",
    selectTool: "Select",
    textTool: "Text",
    undo: "Undo",
    clear: "Clear",
    inputPlaceholder: "Type feedback",
    suggestionTab: "Suggestion",
    editTextTab: "Edit text",
    deleteTab: "Delete",
    editTextPlaceholder: "Type replacement text",
    deletePlaceholder: "Describe the content to remove",
    deleteFallback: "Remove this selected content",
    renameDocument: "Rename",
    renameDocumentPrompt: "Enter a new document name",
    searchAnnotations: "Search annotations",
    filterAll: "All",
    confirmClearTitle: "Delete all annotations?",
    confirmClearBody: "This removes every annotation from the list and canvas. This action cannot be undone.",
    confirmDeleteDocumentTitle: "Delete document?",
    confirmDeleteDocumentBody: "Deleting \"${name}\" removes the file and its annotations from this workspace.",
    confirmDeleteDocumentsTitle: "Delete ${count} documents?",
    confirmDeleteDocumentsBody: "This removes these files and their annotations from this workspace.",
    confirmDeletePageTitle: "Delete board?",
    confirmDeletePageBody: "Deleting Page ${page} also removes annotations on that page.",
    cancel: "Cancel",
    confirmDelete: "Delete",
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
    detailCallouts: "Show annotation details",
    pasteClipboard: "Paste clipboard",
    pasteReading: "Reading the clipboard... If nothing happens, press Ctrl+V to paste an image.",
    pasteImageHint: "This browser cannot read clipboard images from the button. Press Ctrl+V to paste.",
    pasteNoImage: "No image found in the clipboard",
    pastedImage: "Image pasted",
    submitShortcut: "Submit shortcut",
    enterSubmit: "Enter to submit",
    ctrlEnterSubmit: "Ctrl+Enter to submit",
  },
};

const svgNS = "http://www.w3.org/2000/svg";
const storagePrefix = "pointking.annotations.";
const lastDocumentKey = "pointking.lastDocument";
const defaultDocumentKey = "demo:homepage-review.pdf";
const documentCatalogStorageKey = "pointking.documents";
const fileDatabaseName = "pointking.files";
const fileStoreName = "documents";
const layoutStorageKey = "pointking.layout";
const languageStorageKey = "pointking.language";
const themeStorageKey = "pointking.theme";
const magnifierScaleStorageKey = "pointking.magnifierScale";
const detailCalloutsStorageKey = "pointking.detailCallouts";
const submitModeStorageKey = "pointking.submitMode";
const defaultAnnotationColor = "#6e7cff";
const annotationColors = ["#6e7cff", "#00c2a8", "#ff6b6b", "#f5a524", "#8b5cf6"];
const annotationIntentColors = {
  suggestion: "#00c2a8",
  editText: "#6e7cff",
  deleteContent: "#ff6b6b",
};
const commentFilterOptions = ["all", "suggestion", "editText", "deleteContent"];
const commentImagePreviewDelay = 450;

let currentTool = "select";
let currentLanguage = localStorage.getItem(languageStorageKey) || "zh";
let currentTheme = localStorage.getItem(themeStorageKey) || "dark";
let detailCalloutsVisible = localStorage.getItem(detailCalloutsStorageKey) === "true";
let submitMode = localStorage.getItem(submitModeStorageKey) === "ctrlEnter" ? "ctrlEnter" : "enter";
let currentDocumentKey = null;
let documentCatalog = loadDocumentCatalog();
let selectedDocumentKeys = new Set();
let lastSelectedDocumentKey = null;
let deletedPageIds = new Set();
let annotations = [];
let dragStart = null;
let dragEndPoint = null;
let dragPreview = null;
let activePointer = null;
let pan = { x: 0, y: 0 };
let zoom = 1;
let isPanning = false;
let lastPanPoint = null;
let spacePanActive = false;
let pinchState = null;
let editingAnnotationId = null;
let regionPreviewFrame = null;
let annotationNoticeTimer = null;
let placeholderPasteFeedbackTimer = null;
let lastPointAnnotationTriggerAt = 0;
let lastCanvasPointClick = null;
let magnifierEnabled = false;
let magnifierTimer = null;
let magnifierActive = false;
let magnifierWasShown = false;
let magnifierPointerId = null;
let magnifierPage = null;
let magnifierLastClient = null;
let magnifierScale = getStoredMagnifierScale();
let commentSearchQuery = "";
let commentFilterIntent = "all";
let commentImagePreviewTimer = null;
let mobilePanelsInitialized = false;
let mobileAnnotationDock = null;
let creatingBlankDocument = false;
const pendingRegionPreviewIds = new Set();
const collapsedCommentGroups = new Set();
const activeCanvasPointers = new Map();

pdfjs.GlobalWorkerOptions.workerSrc =
  "./vendor/pdfjs/pdf.worker.min.mjs";

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
syncMobilePanelState();
renderCommentFilterTabs();
renderLucideIcons();
syncMobileViewportGeometry();
setCurrentTool(currentTool);
syncDetailToggleState();
activateMobileAnnotationTool();

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

magnifierBtn.addEventListener("click", () => {
  setMagnifierEnabled(!magnifierEnabled);
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
  closeMobilePanelsFromOutside(event);
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !isEditableTarget(event.target) && !isMobileLayout() && !hasOpenAnnotationEditor()) {
    event.preventDefault();
    spacePanActive = true;
    canvasViewport.classList.add("space-panning");
    return;
  }

  if (handleMagnifierScaleShortcut(event)) return;

  if (handleToolShortcut(event)) return;

  if (handleDragKeyboardNudge(event)) return;

  if (event.key === "Escape") {
    hideCanvasMenu();
    closeConfirmDialog();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code !== "Space") return;
  spacePanActive = false;
  canvasViewport.classList.remove("space-panning");
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

document.addEventListener("paste", (event) => {
  if (isEditableTarget(event.target) || event.target.closest?.(".annotation-editor")) return;

  const imageFile = getClipboardImageFile(event);
  if (!imageFile) return;

  event.preventDefault();
  addClipboardImageToBoard(imageFile);
});

mobileFileBtn.addEventListener("click", () => {
  fileInput.click();
  if (isMobileLayout()) setPanelCollapsed("left", true, { persist: true });
});

newDocumentBtn.addEventListener("click", createNewBlankDocument);
placeholderFileBtn.addEventListener("click", () => fileInput.click());
placeholderPasteBtn.addEventListener("click", async () => {
  showPlaceholderPasteFeedback(t("pasteReading"), 3600);
  const result = await loadImageFromClipboard();
  if (result === "pasted") {
    showAnnotationNotice(t("pastedImage"));
    showPlaceholderPasteFeedback(t("pastedImage"), 1600);
    return;
  }
  if (result === "empty") {
    showAnnotationNotice(t("pasteNoImage"));
    showPlaceholderPasteFeedback(t("pasteNoImage"), 2600);
    return;
  }
  showAnnotationNotice(t("pasteImageHint"), 2600);
  showPlaceholderPasteFeedback(t("pasteImageHint"), 3600);
});

mobileZoomSlider.addEventListener("input", () => {
  const nextZoom = Number(mobileZoomSlider.value) / 100;
  const rect = canvasViewport.getBoundingClientRect();
  zoomTo(rect.left + rect.width / 2, rect.top + rect.height / 2, nextZoom);
});

mobileZoomControl.addEventListener("pointerdown", (event) => event.stopPropagation());

statusZoomSlider.addEventListener("input", () => {
  const nextZoom = Number(statusZoomSlider.value) / 100;
  const rect = canvasViewport.getBoundingClientRect();
  zoomTo(rect.left + rect.width / 2, rect.top + rect.height / 2, nextZoom);
});

detailToggleBtn.addEventListener("click", () => {
  detailCalloutsVisible = !detailCalloutsVisible;
  localStorage.setItem(detailCalloutsStorageKey, String(detailCalloutsVisible));
  syncDetailToggleState();
  renderAnnotations();
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
  if (isMobileLayout()) event.preventDefault();

  activeCanvasPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
  canvasViewport.setPointerCapture?.(event.pointerId);
  if (isMobileLayout() && activeCanvasPointers.size >= 2) {
    event.preventDefault();
    event.stopPropagation();
    beginPinchZoom();
    return;
  }

  const page = event.target.closest(".doc-page");
  activePointer = event.pointerId;

  if (spacePanActive || !page || event.button === 1 || event.altKey || event.shiftKey) {
    event.preventDefault();
    beginPan(event);
    return;
  }

  startMagnifierHold(event, page);

  if (hasOpenAnnotationEditor()) {
    if (!isMobileLayout()) {
      event.preventDefault();
      event.stopPropagation();
      const annotationId = getCurrentEditorAnnotationId();
      if (annotationId) cancelAnnotation(annotationId);
      dragStart = null;
      dragEndPoint = null;
      dragPreview = null;
      return;
    }

    if (currentTool === "mark" && moveEmptyDraftAnnotationToPointer(event, page)) {
      event.preventDefault();
      event.stopPropagation();
      dragStart = null;
      dragEndPoint = null;
      dragPreview = null;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    showUnsavedAnnotationNotice();
    focusCurrentAnnotationEditor();
    dragStart = null;
    dragEndPoint = null;
    dragPreview = null;
    return;
  }

  if (currentTool === "select") {
    removeEmptyDraftAnnotations();
    dragStart = null;
    dragEndPoint = null;
    beginPan(event);
    return;
  }

  dragStart = getPagePoint(event, page);
  dragEndPoint = dragStart;

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

  dragStart = null;
  dragEndPoint = null;
});

canvasViewport.addEventListener("pointermove", (event) => {
  if (activeCanvasPointers.has(event.pointerId)) {
    activeCanvasPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
  }

  if (pinchState) {
    event.preventDefault();
    updatePinchZoom();
    return;
  }

  if (event.pointerId === magnifierPointerId) {
    magnifierLastClient = { clientX: event.clientX, clientY: event.clientY };
    updateMagnifier(event);
  }

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

canvasViewport.addEventListener(
  "pointerup",
  (event) => {
    if (maybeCreatePointAnnotationFromPointerUp(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  { capture: true },
);

canvasViewport.addEventListener("pointerup", (event) => {
  if (canvasViewport.hasPointerCapture?.(event.pointerId)) {
    canvasViewport.releasePointerCapture(event.pointerId);
  }
  activeCanvasPointers.delete(event.pointerId);
  if (pinchState) {
    endPinchZoom();
    return;
  }

  if (event.pointerId === magnifierPointerId) {
    stopMagnifier();
  }

  if (isPanning) {
    endPan(event);
    return;
  }

  const page = event.target.closest(".doc-page");
  if (!dragStart || currentTool !== "mark") {
    dragStart = null;
    dragEndPoint = null;
    dragPreview = null;
    return;
  }

  const targetPage = page || pageStack.querySelector(`.doc-page[data-page-id="${dragPreview?.pageId}"]`);
  if (!targetPage || !dragPreview) {
    dragStart = null;
    dragEndPoint = null;
    dragPreview = null;
    return;
  }

  const end = dragEndPoint || getPagePoint(event, targetPage);
  const distance = Math.hypot(end.x - dragStart.x, end.y - dragStart.y);
  if (distance > 2) {
    dragPreview.preview = false;
    dragPreview.width = Math.max(4, dragPreview.width);
    dragPreview.height = Math.max(3, dragPreview.height);
    renderAnnotations();
    focusAnnotationInput(dragPreview.id);
  } else if (!isMobileLayout()) {
    annotations = annotations.filter((annotation) => annotation.id !== dragPreview.id);
    renderAnnotations();
  } else {
    dragPreview.type = "text";
    dragPreview.preview = false;
    delete dragPreview.width;
    delete dragPreview.height;
    renderAnnotations();
    focusAnnotationInput(dragPreview.id);
  }
  dragStart = null;
  dragEndPoint = null;
  dragPreview = null;
});

canvasViewport.addEventListener("pointercancel", (event) => {
  if (canvasViewport.hasPointerCapture?.(event.pointerId)) {
    canvasViewport.releasePointerCapture(event.pointerId);
  }
  activeCanvasPointers.delete(event.pointerId);
  if (pinchState) endPinchZoom();
  if (event.pointerId === magnifierPointerId) stopMagnifier();
  dragStart = null;
  dragEndPoint = null;
  dragPreview = null;
  endPan(event);
});

canvasViewport.addEventListener("dblclick", (event) => {
  const page = getCanvasEventPage(event);
  if (!isMobileLayout() && page && !event.target.closest(".annotation-editor, .annotation-ui")) {
    event.preventDefault();
    event.stopPropagation();
    createPointAnnotationFromDoubleClickEvent(event, page);
    return;
  }

  if (!isMobileLayout() || event.target.closest(".doc-page, .annotation-editor")) return;
  event.preventDefault();
  resetCanvasView();
});

canvasViewport.addEventListener("click", (event) => {
  const page = getCanvasEventPage(event);
  if (isMobileLayout() || event.detail < 2 || !page || event.target.closest(".annotation-editor, .annotation-ui")) return;
  event.preventDefault();
  event.stopPropagation();
  createPointAnnotationFromDoubleClickEvent(event, page);
});

undoBtn.addEventListener("click", () => {
  annotations.pop();
  saveAnnotations();
  renderAnnotations();
});

clearBtn.addEventListener("click", () => {
  showConfirmDialog({
    title: t("confirmClearTitle"),
    body: t("confirmClearBody"),
    confirmLabel: t("confirmDelete"),
    onConfirm: () => {
      annotations = [];
      saveAnnotations();
      renderAnnotations();
    },
  });
});

commentSearch.addEventListener("input", () => {
  commentSearchQuery = commentSearch.value.trim().toLowerCase();
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

  setAnnotationFocusMask(comment.dataset.annotationId, true);
  ensureAnnotationVisible(comment.dataset.annotationId);
  setLinkedCommentActive(comment.dataset.annotationId, true);
});

commentList.addEventListener("mouseout", (event) => {
  const comment = event.target.closest("[data-annotation-id]");
  if (!comment || comment.contains(event.relatedTarget)) return;

  setAnnotationFocusMask(comment.dataset.annotationId, false);
  setLinkedCommentActive(comment.dataset.annotationId, false);
});

shareBtn.addEventListener("click", async () => {
  setShareText(currentLanguage === "zh" ? "\u751f\u6210\u4e2d" : "Exporting");
  try {
    await exportStaticBoard();
    setShareText(currentLanguage === "zh" ? "\u5df2\u5bfc\u51fa" : "Exported");
  } catch {
    setShareText(currentLanguage === "zh" ? "\u5bfc\u51fa\u5931\u8d25" : "Export failed");
  }
  setTimeout(() => setShareText(t("share")), 1400);
});

window.addEventListener("resize", () => {
  updateSurfaceBounds();
  applyCanvasTransform();
  syncMobilePanelState();
  syncMobileViewportGeometry();
  if (hasOpenAnnotationEditor()) renderAnnotations();
});

window.addEventListener("pageshow", () => {
  if (isMobileLayout()) requestAnimationFrame(resetCanvasView);
});

window.visualViewport?.addEventListener("resize", syncMobileViewportGeometry);

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
  mobileFileText.textContent = t("chooseFile");
  mobileFileBtn.title = t("chooseFile");
  mobileFileBtn.setAttribute("aria-label", t("chooseFile"));
  newDocumentBtn.textContent = t("newDocument");
  newDocumentBtn.title = t("newDocument");
  newDocumentBtn.setAttribute("aria-label", t("newDocument"));
  panelTitle.textContent = t("panelTitle");
  docSubtitle.textContent = t("docSubtitle");
  shareText.textContent = t("share");
  commentsTitle.textContent = t("comments");
  placeholderTitle.textContent = t("placeholderTitle");
  placeholderCopy.classList.remove("feedback");
  placeholderCopy.textContent = t("placeholderCopy");
  commentSearch.placeholder = t("searchAnnotations");
  commentSearch.setAttribute("aria-label", t("searchAnnotations"));
  languageText.textContent = currentLanguage === "zh" ? "EN" : "\u4e2d";
  languageBtn.title = currentLanguage === "zh" ? "English" : "\u4e2d\u6587";
  languageBtn.setAttribute("aria-label", currentLanguage === "zh" ? "Switch to English" : "\u5207\u6362\u5230\u4e2d\u6587");
  updateToolLabels();
  renderDocumentList();
  renderCommentFilterTabs();
  updateCollapseButtons();
  applyTheme();
}

function setFileMetaText(text) {
  const nextText = text || "";
  fileMeta.textContent = nextText;
  if (statusFileMeta) statusFileMeta.textContent = nextText;
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
  magnifierBtn.title = t("magnifierTool");
  magnifierBtn.setAttribute("aria-label", t("magnifierTool"));
  detailToggleBtn.title = t("detailCallouts");
  detailToggleBtn.setAttribute("aria-label", t("detailCallouts"));
  updateCanvasMenu();
}

function setCurrentTool(tool) {
  currentTool = tool;
  canvasViewport.dataset.tool = tool;
  tools.forEach((item) => item.classList.toggle("active", item.dataset.tool === tool));
  canvasMenu.querySelectorAll("[data-menu-tool]").forEach((item) => item.classList.toggle("active", item.dataset.menuTool === tool));
  if (tool === "select") stopMagnifier();
}

function activateMobileAnnotationTool() {
  if (isMobileLayout()) setCurrentTool("mark");
}

function setMagnifierEnabled(enabled) {
  magnifierEnabled = enabled;
  magnifierBtn.classList.toggle("active", enabled);
  magnifierBtn.setAttribute("aria-pressed", String(enabled));
  if (!enabled) stopMagnifier();
}

function syncDetailToggleState() {
  app.classList.toggle("details-visible", detailCalloutsVisible);
  detailToggleBtn.classList.toggle("active", detailCalloutsVisible);
  detailToggleBtn.setAttribute("aria-pressed", String(detailCalloutsVisible));
}

function handleToolShortcut(event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return false;
  if (isEditableTarget(event.target) || hasOpenAnnotationEditor()) return false;

  const key = event.key.toLowerCase();
  if (key === "t") {
    event.preventDefault();
    setCurrentTool("mark");
    return true;
  }

  if (key === "v") {
    event.preventDefault();
    setCurrentTool("select");
    return true;
  }

  if (key === "z") {
    event.preventDefault();
    setMagnifierEnabled(!magnifierEnabled);
    return true;
  }

  return false;
}

function startMagnifierHold(event, page) {
  if (!magnifierEnabled || currentTool === "select" || event.button !== 0) return;

  window.clearTimeout(magnifierTimer);
  magnifierActive = false;
  magnifierWasShown = false;
  magnifierPointerId = event.pointerId;
  magnifierPage = page;
  magnifierLastClient = { clientX: event.clientX, clientY: event.clientY };
  magnifierTimer = window.setTimeout(() => {
    magnifierActive = true;
    magnifierWasShown = true;
    magnifierLens.classList.add("open");
    updateMagnifier(magnifierLastClient || event);
  }, 260);
}

function updateMagnifier(event) {
  if (!magnifierEnabled || !magnifierActive || !magnifierPage) return;

  const page = magnifierPage;
  const source = page.querySelector("canvas");
  const lensCanvas = magnifierLens.querySelector("canvas");
  if (!source || !lensCanvas) return;

  const pageRect = page.getBoundingClientRect();
  const xRatio = clamp((event.clientX - pageRect.left) / pageRect.width, 0, 1);
  const yRatio = clamp((event.clientY - pageRect.top) / pageRect.height, 0, 1);
  const sx = xRatio * source.width;
  const sy = yRatio * source.height;
  const sample = Math.max(18, lensCanvas.width / magnifierScale);
  const sw = Math.min(sample, source.width);
  const sh = Math.min(sample, source.height);
  const sourceX = clamp(sx - sw / 2, 0, source.width - sw);
  const sourceY = clamp(sy - sh / 2, 0, source.height - sh);

  const context = lensCanvas.getContext("2d");
  context.clearRect(0, 0, lensCanvas.width, lensCanvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, sourceX, sourceY, sw, sh, 0, 0, lensCanvas.width, lensCanvas.height);

  const size = 180;
  magnifierLens.style.left = `${Math.min(window.innerWidth - size - 12, event.clientX + 18)}px`;
  magnifierLens.style.top = `${Math.max(12, event.clientY - size - 18)}px`;
  magnifierLens.dataset.scale = `${magnifierScale}x`;
}

function beginAnnotationOperationMagnifier(event, page) {
  if (!magnifierEnabled || !page || event.button !== 0) return;

  window.clearTimeout(magnifierTimer);
  magnifierTimer = null;
  magnifierActive = true;
  magnifierWasShown = true;
  magnifierPointerId = event.pointerId;
  magnifierPage = page;
  magnifierLens.classList.add("open");
  updateAnnotationOperationMagnifier(event);
}

function updateAnnotationOperationMagnifier(event) {
  if (!magnifierEnabled || !magnifierActive || !magnifierPage) return;
  magnifierLastClient = { clientX: event.clientX, clientY: event.clientY };
  updateMagnifier(magnifierLastClient);
}

function handleMagnifierScaleShortcut(event) {
  if (magnifierPointerId === null || isEditableTarget(event.target) || hasOpenAnnotationEditor()) return false;
  const numericScale = Number(event.key);
  let nextScale = null;

  if (Number.isInteger(numericScale) && numericScale >= 1 && numericScale <= 4) {
    nextScale = numericScale;
  } else if (event.key === "-" || event.code === "Minus" || event.code === "NumpadSubtract") {
    nextScale = magnifierScale - 1;
  } else if (event.key === "+" || event.code === "NumpadAdd") {
    nextScale = magnifierScale + 1;
  }

  if (nextScale === null) return false;

  event.preventDefault();
  setMagnifierScale(nextScale);
  if (magnifierActive && magnifierLastClient) updateMagnifier(magnifierLastClient);
  return true;
}

function getStoredMagnifierScale() {
  const stored = Number(localStorage.getItem(magnifierScaleStorageKey));
  return Number.isFinite(stored) ? clamp(Math.round(stored), 1, 4) : 2;
}

function setMagnifierScale(scale) {
  magnifierScale = clamp(Math.round(scale), 1, 4);
  try {
    localStorage.setItem(magnifierScaleStorageKey, String(magnifierScale));
  } catch {}
}

function stopMagnifier() {
  window.clearTimeout(magnifierTimer);
  magnifierTimer = null;
  magnifierActive = false;
  magnifierPointerId = null;
  magnifierPage = null;
  magnifierLastClient = null;
  magnifierLens.classList.remove("open");
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

function createMagnifierLens() {
  const lens = document.createElement("div");
  lens.className = "magnifier-lens";
  const canvas = document.createElement("canvas");
  canvas.width = 180;
  canvas.height = 180;
  lens.append(canvas);
  document.body.append(lens);
  return lens;
}

function createConfirmDialog() {
  const overlay = document.createElement("div");
  overlay.className = "confirm-modal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog";

  const title = document.createElement("strong");
  title.className = "confirm-title";

  const body = document.createElement("p");
  body.className = "confirm-body";

  const actions = document.createElement("div");
  actions.className = "confirm-actions";

  const cancel = document.createElement("button");
  cancel.className = "confirm-cancel";
  cancel.type = "button";

  const confirm = document.createElement("button");
  confirm.className = "confirm-delete";
  confirm.type = "button";

  actions.append(cancel, confirm);
  dialog.append(title, body, actions);
  overlay.append(dialog);
  document.body.append(overlay);

  overlay.addEventListener("pointerdown", (event) => {
    if (event.target === overlay) closeConfirmDialog();
  });
  cancel.addEventListener("click", closeConfirmDialog);

  return { overlay, title, body, cancel, confirm };
}

function createRenameDialog() {
  const overlay = document.createElement("div");
  overlay.className = "confirm-modal rename-modal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog rename-dialog";

  const title = document.createElement("strong");
  title.className = "confirm-title";

  const input = document.createElement("input");
  input.className = "rename-input";
  input.type = "text";
  input.autocomplete = "off";

  const actions = document.createElement("div");
  actions.className = "confirm-actions";

  const cancel = document.createElement("button");
  cancel.className = "confirm-cancel";
  cancel.type = "button";

  const confirm = document.createElement("button");
  confirm.className = "confirm-rename";
  confirm.type = "button";

  actions.append(cancel, confirm);
  dialog.append(title, input, actions);
  overlay.append(dialog);
  document.body.append(overlay);

  overlay.addEventListener("pointerdown", (event) => {
    if (event.target === overlay) closeRenameDialog();
  });
  cancel.addEventListener("click", closeRenameDialog);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeRenameDialog();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      confirm.click();
    }
  });

  return { overlay, title, input, cancel, confirm };
}

function showConfirmDialog({ title, body, confirmLabel, onConfirm }) {
  confirmDialog.title.textContent = title;
  confirmDialog.body.textContent = body;
  confirmDialog.cancel.textContent = t("cancel");
  confirmDialog.confirm.textContent = confirmLabel;
  confirmDialog.confirm.onclick = () => {
    closeConfirmDialog();
    onConfirm?.();
  };
  confirmDialog.overlay.classList.add("open");
  confirmDialog.confirm.focus();
}

function closeConfirmDialog() {
  confirmDialog.overlay.classList.remove("open");
  confirmDialog.confirm.onclick = null;
}

function showRenameDialog({ title, value, confirmLabel, onConfirm }) {
  renameDialog.title.textContent = title;
  renameDialog.input.value = value;
  renameDialog.cancel.textContent = t("cancel");
  renameDialog.confirm.textContent = confirmLabel;
  renameDialog.confirm.onclick = () => {
    const nextValue = renameDialog.input.value.trim();
    closeRenameDialog();
    onConfirm?.(nextValue);
  };
  renameDialog.overlay.classList.add("open");
  requestAnimationFrame(() => {
    renameDialog.input.focus();
    renameDialog.input.select();
  });
}

function closeRenameDialog() {
  renameDialog.overlay.classList.remove("open");
  renameDialog.confirm.onclick = null;
}

function hasOpenAnnotationEditor() {
  return !!document.querySelector(".annotation-editor");
}

function getCurrentEditorAnnotationId() {
  if (editingAnnotationId) return editingAnnotationId;
  return annotations.find((annotation) => annotation.draft)?.id || null;
}

function focusCurrentAnnotationEditor() {
  const annotationId = getCurrentEditorAnnotationId();
  if (annotationId) focusAnnotationInput(annotationId);
}

function moveEmptyDraftAnnotationToPointer(event, page) {
  const annotation = annotations.find((item) => item.draft);
  if (!annotation || !isDraftEditorEmpty(annotation.id)) return false;

  const point = getPagePoint(event, page);
  annotation.pageId = page.dataset.pageId;
  annotation.preview = false;

  if (annotation.type === "mark" && Number.isFinite(annotation.width) && Number.isFinite(annotation.height)) {
    annotation.width = Math.max(4, annotation.width || 18);
    annotation.height = Math.max(3, annotation.height || 12);
    annotation.x = clamp(point.x - annotation.width / 2, 0, 100 - annotation.width);
    annotation.y = clamp(point.y - annotation.height / 2, 0, 100 - annotation.height);
  } else {
    annotation.type = "text";
    delete annotation.width;
    delete annotation.height;
    annotation.x = clamp(point.x, 0, 100);
    annotation.y = clamp(point.y, 0, 100);
  }

  renderAnnotations();
  focusAnnotationInput(annotation.id);
  return true;
}

function isDraftEditorEmpty(annotationId) {
  const input = getAnnotationEditor(annotationId)?.querySelector("textarea");
  const annotation = annotations.find((item) => item.id === annotationId);
  return !input?.value.trim() && !hasReferenceImages(annotation);
}

function showUnsavedAnnotationNotice() {
  showAnnotationNotice(t("unsavedAnnotation"));
}

function showAnnotationNotice(message, duration = 1800) {
  annotationNotice.textContent = message;
  annotationNotice.classList.add("open");

  window.clearTimeout(annotationNoticeTimer);
  annotationNoticeTimer = window.setTimeout(() => {
    annotationNotice.classList.remove("open");
  }, duration);
}

function showPlaceholderPasteFeedback(message, duration = 3000) {
  placeholderCopy.textContent = message;
  placeholderCopy.classList.add("feedback");

  window.clearTimeout(placeholderPasteFeedbackTimer);
  placeholderPasteFeedbackTimer = window.setTimeout(() => {
    placeholderCopy.classList.remove("feedback");
    placeholderCopy.textContent = t("placeholderCopy");
  }, duration);
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

function updateDocumentContextMenu(documentKeys) {
  const keys = normalizeDocumentSelection(documentKeys);
  const items = [];
  if (keys.length === 1) items.push(["rename", "pencil", t("renameDocument")]);
  items.push(["delete", "trash-2", t("deleteAnnotation")]);

  canvasMenu.replaceChildren(
    ...items.map(([action, icon, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.documentAction = action;
      if (action === "delete") button.classList.add("danger");
      button.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
      button.addEventListener("click", () => {
        if (action === "rename") renameDocumentByKey(keys[0]);
        if (action === "delete") confirmDeleteDocuments(keys);
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

function showDocumentContextMenu(clientX, clientY, documentKeys) {
  updateDocumentContextMenu(documentKeys);
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

function beginPinchZoom() {
  cancelTransientCanvasAction();
  stopMagnifier();
  if (isPanning) {
    isPanning = false;
    activePointer = null;
    lastPanPoint = null;
    canvasViewport.classList.remove("dragging");
  }

  const points = getPinchPoints();
  if (!points) return;

  pinchState = {
    distance: getTouchDistance(points),
    center: getTouchCenter(points),
    zoom,
  };
}

function updatePinchZoom() {
  const points = getPinchPoints();
  if (!points || !pinchState?.distance) return;

  const distance = getTouchDistance(points);
  const center = getTouchCenter(points);
  const previousCenter = pinchState.center || center;
  zoomTo(center.clientX, center.clientY, pinchState.zoom * (distance / pinchState.distance));
  pan.x += center.clientX - previousCenter.clientX;
  pan.y += center.clientY - previousCenter.clientY;
  pinchState.center = center;
  applyCanvasTransform();
}

function endPinchZoom() {
  if (activeCanvasPointers.size >= 2) {
    const points = getPinchPoints();
    if (points) {
      pinchState = {
        distance: getTouchDistance(points),
        center: getTouchCenter(points),
        zoom,
      };
      return;
    }
  }

  pinchState = null;
}

function getPinchPoints() {
  const points = [...activeCanvasPointers.values()].slice(0, 2);
  return points.length === 2 ? points : null;
}

function getTouchDistance([first, second]) {
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function getTouchCenter([first, second]) {
  return {
    clientX: (first.clientX + second.clientX) / 2,
    clientY: (first.clientY + second.clientY) / 2,
  };
}

function cancelTransientCanvasAction() {
  if (dragPreview?.preview) {
    annotations = annotations.filter((annotation) => annotation.id !== dragPreview.id);
    renderAnnotations();
  }
  dragStart = null;
  dragEndPoint = null;
  dragPreview = null;
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

function resetCanvasView() {
  updateSurfaceBounds();
  zoom = isMobileLayout() ? getMobileDefaultZoom() : 1;
  centerCanvas();
}

function getMobileDefaultZoom() {
  const viewport = canvasViewport.getBoundingClientRect();
  const stack = pageStack.getBoundingClientRect();
  if (!viewport.width || !stack.width) return 1;
  return clamp((viewport.width - 28) / stack.width, 0.35, 1);
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
  const factor = Math.exp(-deltaY * 0.0012);
  zoomTo(clientX, clientY, zoom * factor);
}

function zoomTo(clientX, clientY, nextZoom) {
  const rect = canvasViewport.getBoundingClientRect();
  const pointerX = clientX - rect.left;
  const pointerY = clientY - rect.top;
  const oldZoom = zoom;
  zoom = clamp(nextZoom, 0.35, 2.6);

  const worldX = (pointerX - pan.x) / oldZoom;
  const worldY = (pointerY - pan.y) / oldZoom;
  pan.x = pointerX - worldX * zoom;
  pan.y = pointerY - worldY * zoom;
  applyCanvasTransform();
}

function applyCanvasTransform() {
  canvasSurface.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  canvasSurface.style.setProperty("--inverse-zoom", String(1 / zoom));
  canvasSurface.style.setProperty("--editor-offset-y", `${-10 / zoom}px`);
  const zoomText = `${Math.round(zoom * 100)}%`;
  zoomReadout.textContent = zoomText;
  statusZoom.textContent = zoomText;
  syncMobileZoomSlider();
}

function syncMobileZoomSlider() {
  const value = String(Math.round(zoom * 100));
  if (mobileZoomSlider) mobileZoomSlider.value = value;
  if (statusZoomSlider) statusZoomSlider.value = value;
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
    const willCollapse = !isPanelCollapsed(side);
    if (isMobileLayout() && !willCollapse) {
      setPanelCollapsed(side === "left" ? "right" : "left", true, { persist: false });
    }
    setPanelCollapsed(side, willCollapse, { persist: true });
  });
}

function setPanelCollapsed(side, collapsed, options = {}) {
  app.classList.toggle(`${side}-collapsed`, collapsed);
  updateCollapseButtons();
  updateSurfaceBounds();
  applyCanvasTransform();
  syncMobilePanelState();
  if (options.persist) saveLayout();
}

function isPanelCollapsed(side) {
  return app.classList.contains(`${side}-collapsed`);
}

function updateCollapseButtons() {
  const leftCollapsed = isPanelCollapsed("left");
  const rightCollapsed = isPanelCollapsed("right");

  leftCollapseBtn.setAttribute("aria-label", leftCollapsed ? t("expandLeft") : t("collapseLeft"));
  leftCollapseBtn.title = leftCollapsed ? t("expandLeft") : t("collapseLeft");
  leftCollapseBtn.replaceChildren(createIconPlaceholder(leftCollapsed ? "chevron-right" : "chevron-left"));

  rightCollapseBtn.setAttribute("aria-label", rightCollapsed ? t("expandRight") : t("collapseRight"));
  rightCollapseBtn.title = rightCollapsed ? t("expandRight") : t("collapseRight");
  rightCollapseBtn.replaceChildren(createIconPlaceholder(rightCollapsed ? "chevron-left" : "chevron-right"));

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
    syncMobilePanelState();
  } catch {
    localStorage.removeItem(layoutStorageKey);
  }
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 560px)").matches;
}

function isEditableTarget(target) {
  return Boolean(target?.closest?.("input, textarea, [contenteditable='true']"));
}

function syncMobilePanelState() {
  if (!isMobileLayout()) {
    app.classList.remove("mobile-panel-open");
    document.documentElement.classList.remove("mobile-panel-open");
    mobilePanelsInitialized = false;
    return;
  }

  if (!mobilePanelsInitialized) {
    app.classList.add("left-collapsed", "right-collapsed");
    mobilePanelsInitialized = true;
    updateCollapseButtons();
  }

  if (!isPanelCollapsed("left") && !isPanelCollapsed("right")) {
    app.classList.add("left-collapsed");
    updateCollapseButtons();
  }

  const open = !isPanelCollapsed("left") || !isPanelCollapsed("right");
  app.classList.toggle("mobile-panel-open", open);
  document.documentElement.classList.toggle("mobile-panel-open", open);
}

function closeMobilePanelsFromOutside(event) {
  if (!isMobileLayout() || !app.classList.contains("mobile-panel-open")) return;
  if (event.target.closest(".rail, .comments, .collapse-toggle, .mobile-file-btn, .annotation-editor, .canvas-menu")) return;

  setPanelCollapsed("left", true, { persist: true });
  setPanelCollapsed("right", true, { persist: true });
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
  annotation.createdAt ||= Date.now();
  annotation.updatedAt ||= annotation.createdAt;
  annotations.push(annotation);
  renderAnnotations();
  return annotation;
}

function createPointAnnotationFromDoubleClickEvent(event, page) {
  const now = Date.now();
  if (now - lastPointAnnotationTriggerAt < 320) return;
  lastPointAnnotationTriggerAt = now;
  lastCanvasPointClick = null;

  if (isPanning) endPan(event);
  stopMagnifier();
  dragStart = null;
  dragEndPoint = null;
  dragPreview = null;
  setCurrentTool("mark");
  createTextAnnotationAtEvent(event, page);
}

function maybeCreatePointAnnotationFromPointerUp(event) {
  if (isMobileLayout() || event.button !== 0 || event.target.closest(".annotation-editor, .annotation-ui")) return false;

  const page = getCanvasEventPage(event);
  if (!page) {
    lastCanvasPointClick = null;
    return false;
  }

  const now = Date.now();
  const previous = lastCanvasPointClick;
  lastCanvasPointClick = {
    time: now,
    x: event.clientX,
    y: event.clientY,
    pageId: page.dataset.pageId,
  };

  if (!previous || previous.pageId !== page.dataset.pageId) return false;

  const elapsed = now - previous.time;
  const distance = Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
  if (elapsed > 460 || distance > 10) return false;

  createPointAnnotationFromDoubleClickEvent(event, page);
  return true;
}

function getCanvasEventPage(event) {
  const directPage = event.target.closest?.(".doc-page");
  if (directPage) return directPage;

  return [...pageStack.querySelectorAll(".doc-page")].find((page) => {
    const rect = page.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }) || null;
}

function createTextAnnotationAtEvent(event, page) {
  removeEmptyDraftAnnotations();
  const point = getPagePoint(event, page);
  const annotation = addAnnotation({
    type: "text",
    pageId: page.dataset.pageId,
    x: clamp(point.x, 0, 100),
    y: clamp(point.y, 0, 100),
    text: "",
    draft: true,
  });
  focusAnnotationInput(annotation.id);
}

function renderAnnotations() {
  clearMobileAnnotationDock();
  pageStack.querySelectorAll(".overlay").forEach((overlay) => {
    overlay.replaceChildren();
    overlay.setAttribute("viewBox", "0 0 100 100");
    overlay.setAttribute("preserveAspectRatio", "none");
  });
  pageStack.querySelectorAll(".annotation-layer").forEach((layer) => layer.replaceChildren());

  commentList.replaceChildren();
  let renderedCommentCount = 0;
  const groupedComments = new Map();
  const annotationOrder = getAnnotationOrderMap();

  annotations.forEach((annotation) => {
    const page = pageStack.querySelector(`.doc-page[data-page-id="${annotation.pageId}"]`);
    if (!page) return;

    const layer = getAnnotationLayer(page);
    annotation.renderIndex = annotationOrder.get(annotation.id) || "";
    if (annotation.type === "mark") drawMark(layer, annotation);
    if (annotation.type === "text") drawTextNote(layer, annotation);
    if (!annotation.draft && matchesCommentFilters(annotation)) {
      if (!groupedComments.has(annotation.pageId)) groupedComments.set(annotation.pageId, []);
      groupedComments.get(annotation.pageId).push(annotation);
      renderedCommentCount += 1;
    }
  });

  renderCommentGroups(groupedComments);
  commentCount.textContent = `(${renderedCommentCount})`;
  statusCommentCount.textContent = String(renderedCommentCount);
  renderLucideIcons();
}

function getAnnotationOrderMap() {
  return new Map(
    annotations
      .filter(isPersistableAnnotation)
      .slice()
      .sort((first, second) => {
        const pageDelta = Number(first.pageId) - Number(second.pageId);
        if (pageDelta) return pageDelta;
        return getAnnotationUpdatedAt(first) - getAnnotationUpdatedAt(second);
      })
      .map((annotation, index) => [annotation.id, index + 1]),
  );
}

function renderCommentFilterTabs() {
  commentFilterTabs.replaceChildren();
  commentFilterOptions.forEach((intent) => {
    const button = document.createElement("button");
    button.className = "comment-filter-tab";
    button.type = "button";
    button.dataset.filterIntent = intent;
    button.classList.toggle("active", commentFilterIntent === intent);
    button.textContent = intent === "all" ? t("filterAll") : getIntentLabelByKey(intent);
    button.addEventListener("click", () => {
      commentFilterIntent = intent;
      renderCommentFilterTabs();
      renderAnnotations();
    });
    commentFilterTabs.append(button);
  });
}

function matchesCommentFilters(annotation) {
  if (commentFilterIntent !== "all" && getAnnotationIntent(annotation) !== commentFilterIntent) return false;
  if (!commentSearchQuery) return true;

  return [
    annotation.text,
    getAnnotationFallbackText(annotation),
    getAnnotationIntentLabel(annotation),
    t("page", { page: annotation.pageId }),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(commentSearchQuery));
}

function getIntentLabelByKey(intent) {
  const labels = {
    suggestion: t("suggestionTab"),
    editText: t("editTextTab"),
    deleteContent: t("deleteTab"),
  };
  return labels[intent] || intent;
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
  box.classList.add(`intent-${getAnnotationIntent(annotation)}`);
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

  const resizeHandles = ["top-left", "bottom-right"].map((corner) => {
    const handle = document.createElement("button");
    handle.className = `resize-corner resize-corner-${corner}`;
    handle.type = "button";
    handle.dataset.resizeCorner = corner;
    handle.setAttribute("aria-label", "\u8c03\u6574\u6807\u6ce8\u5927\u5c0f");
    bindAnnotationResize(handle, annotation, corner);
    return handle;
  });
  const arrowHandles = ["top", "right", "bottom", "left"].map((side) => {
    const arrowHandle = document.createElement("button");
    arrowHandle.className = `arrow-anchor arrow-anchor-${side}`;
    arrowHandle.type = "button";
    arrowHandle.dataset.arrowAnchor = side;
    arrowHandle.setAttribute("aria-label", currentLanguage === "zh" ? "\u62d6\u62fd\u7ed8\u5236\u6307\u793a\u7bad\u5934" : "Drag to draw pointer arrow");
    bindAnnotationArrow(arrowHandle, annotation, side);
    return arrowHandle;
  });
  bindMarkMove(box, annotation);
  bindAnnotationEdit(box, annotation);
  bindAnnotationHover(box, annotation);

  box.append(...arrowHandles, ...resizeHandles);
  if (!shouldShowAnnotationEditor(annotation)) {
    box.append(createAnnotationTooltip(annotation));
  }
  box.append(createAnnotationIndexBadge(annotation));
  layer.append(box);
  if (shouldShowAnnotationEditor(annotation)) {
    appendAnnotationEditor(layer, createAnnotationEditor("mark-input", "mark-editor", annotation));
  }
  drawAnnotationDetailCallout(layer, annotation);
  renderLucideIcons();
}

function updateDragPreview(event, page) {
  const end = getPagePoint(event, page);
  updateDragPreviewFromPoint(end);
}

function updateDragPreviewFromPoint(end) {
  if (!dragStart || !dragPreview) return;
  dragEndPoint = {
    x: clamp(end.x, 0, 100),
    y: clamp(end.y, 0, 100),
  };
  const x = Math.min(dragStart.x, dragEndPoint.x);
  const y = Math.min(dragStart.y, dragEndPoint.y);
  const width = Math.abs(dragEndPoint.x - dragStart.x);
  const height = Math.abs(dragEndPoint.y - dragStart.y);

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

function handleDragKeyboardNudge(event) {
  if (!magnifierEnabled || !dragPreview || !dragStart || currentTool !== "mark") return false;

  const deltas = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  };
  const delta = deltas[event.key];
  if (!delta) return false;

  event.preventDefault();
  event.stopPropagation();

  const step = event.shiftKey ? 1 : event.altKey ? 0.1 : 0.25;
  const current = dragEndPoint || dragStart;
  const next = {
    x: clamp(current.x + delta[0] * step, 0, 100),
    y: clamp(current.y + delta[1] * step, 0, 100),
  };
  updateDragPreviewFromPoint(next);
  updateMagnifierForPagePoint(next);
  return true;
}

function updateMagnifierForPagePoint(point) {
  if (!magnifierActive || !dragPreview) return;

  const page = pageStack.querySelector(`.doc-page[data-page-id="${dragPreview.pageId}"]`);
  if (!page) return;

  const rect = page.getBoundingClientRect();
  const clientPoint = {
    clientX: rect.left + (point.x / 100) * rect.width,
    clientY: rect.top + (point.y / 100) * rect.height,
  };
  magnifierLastClient = clientPoint;
  updateMagnifier(clientPoint);
}

function hasAnnotationArrow(annotation) {
  return Number.isFinite(annotation.arrowX) && Number.isFinite(annotation.arrowY);
}

function getArrowStartPoint(annotation) {
  const side = annotation.arrowAnchor || "top";
  if (side === "right") return { x: annotation.x + annotation.width, y: annotation.y + annotation.height / 2 };
  if (side === "bottom") return { x: annotation.x + annotation.width / 2, y: annotation.y + annotation.height };
  if (side === "left") return { x: annotation.x, y: annotation.y + annotation.height / 2 };
  return { x: annotation.x + annotation.width / 2, y: annotation.y };
}

function createAnnotationArrow(annotation) {
  const svg = createSvg("svg", {
    class: "annotation-arrow",
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
  });
  svg.dataset.annotationId = annotation.id;
  svg.style.setProperty("--annotation-color", getAnnotationColor(annotation));
  svg.style.setProperty("--arrow-width", getAnnotationArrowWidth(annotation));

  const markerId = `arrow-head-${annotation.id}`;
  const defs = createSvg("defs");
  const marker = createSvg("marker", {
    id: markerId,
    markerWidth: "10",
    markerHeight: "10",
    refX: "9",
    refY: "5",
    orient: "auto",
    markerUnits: "strokeWidth",
  });
  const head = createSvg("path", { d: "M0,0 L10,5 L0,10 Z", fill: "currentColor" });
  marker.append(head);
  defs.append(marker);
  const start = getArrowStartPoint(annotation);

  const lineAttributes = {
    x1: start.x,
    y1: start.y,
    x2: annotation.arrowX,
    y2: annotation.arrowY,
  };
  const hitLine = createSvg("line", {
    ...lineAttributes,
    class: "arrow-hit",
  });
  const line = createSvg("line", {
    ...lineAttributes,
    class: "arrow-line",
    "marker-end": `url(#${markerId})`,
  });
  const endpoint = createSvg("circle", {
    class: "arrow-endpoint",
    cx: annotation.arrowX,
    cy: annotation.arrowY,
    r: "1.3",
  });
  svg.append(defs, hitLine, line, endpoint);
  bindAnnotationArrowEdit(svg, annotation);
  return svg;
}

function updateAnnotationArrow(annotation) {
  const arrow = pageStack.querySelector(`.annotation-arrow[data-annotation-id="${annotation.id}"]`);
  if (!arrow) return;

  const start = getArrowStartPoint(annotation);
  arrow.style.setProperty("--arrow-width", getAnnotationArrowWidth(annotation));
  arrow.querySelectorAll("line").forEach((line) => {
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", annotation.arrowX);
    line.setAttribute("y2", annotation.arrowY);
  });
  const endpoint = arrow.querySelector(".arrow-endpoint");
  endpoint?.setAttribute("cx", annotation.arrowX);
  endpoint?.setAttribute("cy", annotation.arrowY);
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
  dot.append(createAnnotationIndexBadge(annotation));
  note.style.setProperty("--annotation-color", getAnnotationColor(annotation));
  bindMarkMove(note, annotation);
  bindAnnotationEdit(note, annotation);
  bindAnnotationHover(note, annotation);

  note.append(dot);
  if (!shouldShowAnnotationEditor(annotation)) {
    note.append(createAnnotationTooltip(annotation));
  }
  layer.append(note);
  if (shouldShowAnnotationEditor(annotation)) {
    appendAnnotationEditor(layer, createAnnotationEditor("text-input", "text-editor", annotation));
  }
  drawAnnotationDetailCallout(layer, annotation);
  renderLucideIcons();
}

function createAnnotationIndexBadge(annotation) {
  const badge = document.createElement("span");
  badge.className = "annotation-index-badge";
  badge.textContent = annotation.renderIndex ? String(annotation.renderIndex) : "";
  return badge;
}

function drawAnnotationDetailCallout(layer, annotation) {
  if (!detailCalloutsVisible || annotation.draft || annotation.preview || !isPersistableAnnotation(annotation)) return;

  const side = getAnnotationDetailSide(annotation);
  const anchor = getAnnotationDetailAnchor(annotation, side);
  const color = getAnnotationColor(annotation);
  const calloutY = clamp(anchor.y, 5, 95);
  const endX = side === "left" ? -9 : 109;
  const controlX = side === "left" ? -4 : 104;
  const line = createSvg("svg", {
    class: "annotation-detail-line",
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
    "aria-hidden": "true",
  });
  line.style.setProperty("--annotation-color", color);
  line.append(
    createSvg("path", {
      d: `M ${anchor.x} ${anchor.y} C ${controlX} ${anchor.y}, ${controlX} ${calloutY}, ${endX} ${calloutY}`,
      class: "detail-line-path",
    }),
  );

  const callout = document.createElement("div");
  callout.className = "annotation-detail-callout";
  callout.classList.add(`detail-${side}`);
  callout.dataset.annotationId = annotation.id;
  if (side === "left") {
    callout.style.right = "110%";
  } else {
    callout.style.left = "110%";
  }
  callout.style.top = `${calloutY}%`;
  callout.style.setProperty("--annotation-color", color);

  const title = document.createElement("strong");
  title.textContent = getAnnotationIntentLabel(annotation);
  const text = document.createElement("p");
  text.textContent = annotation.text || getAnnotationFallbackText(annotation);
  callout.append(title, text);

  layer.append(line, callout);
}

function getAnnotationDetailSide(annotation) {
  const centerX = annotation.type === "mark" ? annotation.x + annotation.width / 2 : annotation.x;
  return centerX < 50 ? "left" : "right";
}

function getAnnotationDetailAnchor(annotation, side) {
  if (annotation.type === "mark") {
    return {
      x: side === "left" ? annotation.x : annotation.x + annotation.width,
      y: annotation.y + annotation.height / 2,
    };
  }

  return {
    x: annotation.x,
    y: annotation.y,
  };
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
  text.textContent = annotation.text || getAnnotationFallbackText(annotation);
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
  editor.classList.toggle("mobile-docked", isMobileLayout());
  editor.dataset.annotationId = annotation.id;
  editor.style.setProperty("--annotation-color", getAnnotationColor(annotation));
  positionAnnotationEditor(editor, annotation);
  let activeEditorMode = getAnnotationIntent(annotation);

  const saveButton = document.createElement("button");
  saveButton.className = "save-annotation";
  saveButton.type = "button";
  saveButton.setAttribute("aria-label", currentLanguage === "zh" ? "\u4fdd\u5b58\u6279\u6ce8" : "Save annotation");
  saveButton.append(createIconPlaceholder("check"));

  const saveGroup = document.createElement("div");
  saveGroup.className = "save-annotation-group";
  const shortcutButton = document.createElement("button");
  shortcutButton.className = "save-shortcut-toggle";
  shortcutButton.type = "button";
  shortcutButton.title = t("submitShortcut");
  shortcutButton.setAttribute("aria-label", t("submitShortcut"));
  shortcutButton.setAttribute("aria-expanded", "false");
  shortcutButton.append(createIconPlaceholder("chevron-up"));
  const shortcutMenu = createSubmitShortcutMenu(() => {
    shortcutMenu.classList.remove("open");
    shortcutButton.setAttribute("aria-expanded", "false");
    input.focus();
  });
  saveGroup.append(saveButton, shortcutButton, shortcutMenu);

  const pasteButton = document.createElement("button");
  pasteButton.className = "paste-annotation";
  pasteButton.type = "button";
  pasteButton.title = t("pasteClipboard");
  pasteButton.setAttribute("aria-label", t("pasteClipboard"));
  pasteButton.append(createIconPlaceholder("clipboard-paste"));

  const closeButton = document.createElement("button");
  closeButton.className = "close-annotation";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", currentLanguage === "zh" ? "\u5173\u95ed\u6279\u6ce8" : "Close annotation");
  closeButton.append(createIconPlaceholder("x"));

  const tabs = document.createElement("div");
  tabs.className = "annotation-tabs";
  const tabItems = [
    ["suggestion", t("suggestionTab"), t("inputPlaceholder")],
    ["editText", t("editTextTab"), t("editTextPlaceholder")],
    ["deleteContent", t("deleteTab"), t("deletePlaceholder")],
  ];

  const activeTabItem = tabItems.find(([mode]) => mode === activeEditorMode) || tabItems[0];
  let hoverModeTimer = null;
  const cancelHoverModeTimer = () => {
    window.clearTimeout(hoverModeTimer);
    hoverModeTimer = null;
  };
  const scheduleHoverEditorMode = (mode, placeholder, tab) => {
    cancelHoverModeTimer();
    hoverModeTimer = window.setTimeout(() => {
      activateEditorMode(mode, placeholder, tab);
      hoverModeTimer = null;
    }, 250);
  };
  const activateEditorMode = (mode, placeholder, tab, { focusInput = false } = {}) => {
    if (activeEditorMode === mode) return;
    activeEditorMode = mode;
    input.placeholder = placeholder;
    tabs.querySelectorAll(".annotation-tab").forEach((item) => item.classList.toggle("active", item === tab));
    previewAnnotationIntent(annotation.id, activeEditorMode);
    updateSaveState();
    if (focusInput) input.focus();
  };

  tabItems.forEach(([mode, label, placeholder]) => {
    const tab = document.createElement("button");
    tab.className = "annotation-tab";
    tab.type = "button";
    tab.dataset.editorMode = mode;
    const dot = document.createElement("span");
    dot.className = "annotation-tab-dot";
    const text = document.createElement("span");
    text.textContent = label;
    tab.append(dot, text);
    tab.classList.toggle("active", mode === activeTabItem[0]);
    if (mode === "editText") tab.classList.add("edit");
    if (mode === "deleteContent") tab.classList.add("danger");
    tab.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      scheduleHoverEditorMode(mode, placeholder, tab);
    });
    tab.addEventListener("pointerleave", cancelHoverModeTimer);
    tab.addEventListener("focus", () => {
      cancelHoverModeTimer();
      activateEditorMode(mode, placeholder, tab);
    });
    tab.addEventListener("click", () => {
      cancelHoverModeTimer();
      activateEditorMode(mode, placeholder, tab, { focusInput: true });
    });
    tabs.append(tab);
  });
  tabs.append(closeButton);

  const input = document.createElement("textarea");
  input.className = inputClassName;
  input.rows = 2;
  input.placeholder = activeTabItem[2];
  input.value = annotation.text || "";
  let previousInputValue = input.value;
  const inputRow = document.createElement("div");
  inputRow.className = "annotation-input-row";
  const inputActions = document.createElement("div");
  inputActions.className = "annotation-input-actions";
  const inlineReferences = createInlineReferenceList(annotation, input.value);
  const body = document.createElement("div");
  body.className = "editor-body";
  const references = createReferenceList(annotation);
  const resizeInput = () => autoResizeAnnotationInput(input);
  const updateSaveState = () => {
    resizeInput();
    renderInlineReferenceList(inlineReferences, annotation, input.value);
    const canSave = activeEditorMode === "deleteContent" || input.value.trim().length > 0 || hasReferenceImages(annotation);
    saveButton.classList.toggle("visible", canSave);
    saveGroup.classList.toggle("visible", canSave);
  };

  editor.addEventListener("pointerdown", (event) => event.stopPropagation());
  saveButton.addEventListener("click", () => commitAnnotation(annotation.id, input.value, activeEditorMode));
  shortcutButton.addEventListener("click", (event) => {
    event.preventDefault();
    const open = !shortcutMenu.classList.contains("open");
    shortcutMenu.classList.toggle("open", open);
    shortcutButton.setAttribute("aria-expanded", String(open));
  });
  pasteButton.addEventListener("click", () => pasteClipboardIntoAnnotation(input, annotation, references, inlineReferences, updateSaveState));
  closeButton.addEventListener("click", () => cancelAnnotation(annotation.id));
  input.addEventListener("input", () => {
    updateImageAnchorsForTextChange(annotation, previousInputValue, input.value);
    previousInputValue = input.value;
    updateSaveState();
  });
  input.addEventListener("scroll", () => {
    inlineReferences.scrollTop = input.scrollTop;
  });
  input.addEventListener("paste", (event) => handleAnnotationPaste(event, annotation, references, inlineReferences, updateSaveState));
  input.addEventListener("keydown", (event) => {
    if (handleAnnotationSubmitKey(event, input, updateSaveState)) {
      commitAnnotation(annotation.id, input.value, activeEditorMode);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelAnnotation(annotation.id);
    }
  });

  inputActions.append(pasteButton, saveGroup);
  inputRow.append(inlineReferences, input, inputActions);
  body.append(tabs, inputRow, references);
  editor.append(body);
  updateSaveState();
  return editor;
}

function positionAnnotationEditor(editor, annotation) {
  if (isMobileLayout()) {
    editor.classList.remove("flipped");
    editor.style.left = "";
    editor.style.top = "";
    return;
  }

  const page = pageStack.querySelector(`.doc-page[data-page-id="${annotation.pageId}"]`);
  if (!page) return;

  const pageRect = page.getBoundingClientRect();
  const viewportRect = canvasViewport.getBoundingClientRect();
  if (!pageRect.width || !pageRect.height || !viewportRect.width || !viewportRect.height) return;

  const editorWidth = parseFloat(getComputedStyle(editor).width) || 280;
  const editorHeight = editor.getBoundingClientRect().height || 112;
  const viewportPadding = 12;
  const editorGap = 10;
  const editorWidthPct = (editorWidth / pageRect.width) * 100;
  const editorHeightPct = (editorHeight / pageRect.height) * 100;
  const gapPct = (editorGap / pageRect.width) * 100;
  const minLeft = ((viewportRect.left + viewportPadding - pageRect.left) / pageRect.width) * 100;
  const maxLeft = ((viewportRect.right - viewportPadding - editorWidth - pageRect.left) / pageRect.width) * 100;
  const minTop = ((viewportRect.top + viewportPadding - pageRect.top) / pageRect.height) * 100;
  const maxTop = ((viewportRect.bottom - viewportPadding - editorHeight - pageRect.top) / pageRect.height) * 100;
  const clampToVisible = (value, min, max) => (max < min ? min : clamp(value, min, max));

  editor.classList.remove("flipped");
  if (annotation.type === "mark") {
    const markerLeftClient = pageRect.left + (annotation.x / 100) * pageRect.width;
    const markerRightClient = pageRect.left + ((annotation.x + annotation.width) / 100) * pageRect.width;
    const rightSpace = viewportRect.right - viewportPadding - markerRightClient;
    const leftSpace = markerLeftClient - viewportRect.left - viewportPadding;
    const openToLeft = rightSpace < editorWidth + editorGap && leftSpace > rightSpace;
    const desiredLeft = openToLeft
      ? annotation.x - gapPct - editorWidthPct
      : annotation.x + annotation.width + gapPct;
    editor.style.left = `${clampToVisible(desiredLeft, minLeft, maxLeft)}%`;
    editor.style.top = `${clampToVisible(annotation.y, minTop, maxTop)}%`;
    return;
  }

  const desiredTextLeft = annotation.x + ((14 / pageRect.width) * 100);
  editor.style.left = `${clampToVisible(desiredTextLeft, minLeft, maxLeft)}%`;
  editor.style.top = `${clampToVisible(annotation.y, minTop, maxTop)}%`;
}

function syncAnnotationEditorPosition(annotation) {
  const editor = getAnnotationEditor(annotation.id);
  if (editor) positionAnnotationEditor(editor, annotation);
}

function appendAnnotationEditor(layer, editor) {
  if (isMobileLayout()) {
    ensureMobileAnnotationDock().append(editor);
    return;
  }

  layer.append(editor);
  const annotation = annotations.find((item) => item.id === editor.dataset.annotationId);
  if (annotation) requestAnimationFrame(() => positionAnnotationEditor(editor, annotation));
}

function ensureMobileAnnotationDock() {
  if (mobileAnnotationDock?.isConnected) return mobileAnnotationDock;

  mobileAnnotationDock = document.createElement("div");
  mobileAnnotationDock.className = "mobile-annotation-dock";
  app.insertBefore(mobileAnnotationDock, mobileZoomControl);
  syncMobileViewportGeometry();
  return mobileAnnotationDock;
}

function clearMobileAnnotationDock() {
  mobileAnnotationDock?.replaceChildren();
}

function getAnnotationEditor(annotationId) {
  return document.querySelector(`.annotation-editor[data-annotation-id="${annotationId}"]`);
}

function createSubmitShortcutMenu(onSelect) {
  const menu = document.createElement("div");
  menu.className = "save-shortcut-menu";
  menu.setAttribute("role", "menu");

  [
    ["enter", t("enterSubmit")],
    ["ctrlEnter", t("ctrlEnterSubmit")],
  ].forEach(([mode, label]) => {
    const item = document.createElement("button");
    item.type = "button";
    item.dataset.submitMode = mode;
    item.classList.toggle("active", submitMode === mode);
    item.textContent = label;
    item.addEventListener("click", () => {
      submitMode = mode;
      localStorage.setItem(submitModeStorageKey, submitMode);
      menu.querySelectorAll("button").forEach((button) => {
        button.classList.toggle("active", button.dataset.submitMode === submitMode);
      });
      onSelect?.();
    });
    menu.append(item);
  });

  return menu;
}

function handleAnnotationSubmitKey(event, input, onChange) {
  if (event.key !== "Enter") return false;

  const withModifier = event.ctrlKey || event.metaKey;
  if (submitMode === "enter") {
    event.preventDefault();
    if (withModifier) {
      insertTextAtCursor(input, "\n");
      onChange?.();
      return false;
    }
    return true;
  }

  if (withModifier) {
    event.preventDefault();
    return true;
  }

  return false;
}

function getAnnotationVisualElement(annotationId) {
  return pageStack.querySelector(`.annotation-ui[data-annotation-id="${annotationId}"]`);
}

function createReferenceList(annotation) {
  const list = document.createElement("div");
  list.className = "reference-list";
  syncReferenceListLayout(list, annotation);
  (annotation.images || []).forEach((src, index) => list.append(createReferenceImage(src, index, "reference-image")));
  return list;
}

function createInlineReferenceList(annotation, text = "") {
  const list = document.createElement("div");
  list.className = "inline-reference-list";
  renderInlineReferenceList(list, annotation, text);
  return list;
}

function renderInlineReferenceList(list, annotation, text = "") {
  list.replaceChildren();
  const images = annotation.images || [];
  if (!text && !images.length) return;

  const anchors = getAnnotationImageAnchors(annotation, text);
  let cursor = 0;
  anchors.forEach(({ index, offset }) => {
    if (offset > cursor) list.append(document.createTextNode(text.slice(cursor, offset)));
    if (images[index]) list.append(createReferenceImage(images[index], index, "inline-reference-image"));
    cursor = offset;
  });
  if (cursor < text.length) list.append(document.createTextNode(text.slice(cursor)));
}

function getAnnotationImageAnchors(annotation, text = "") {
  const images = annotation.images || [];
  const anchors = Array.isArray(annotation.imageAnchors) ? annotation.imageAnchors : [];
  return images
    .map((_, index) => ({
      index,
      offset: clamp(Number(anchors[index] ?? text.length), 0, text.length),
    }))
    .sort((a, b) => a.offset - b.offset || a.index - b.index);
}

function updateImageAnchorsForTextChange(annotation, previousText, nextText) {
  if (!Array.isArray(annotation.imageAnchors) || annotation.imageAnchors.length === 0) return;
  let prefix = 0;
  const maxPrefix = Math.min(previousText.length, nextText.length);
  while (prefix < maxPrefix && previousText[prefix] === nextText[prefix]) prefix += 1;

  let previousSuffix = previousText.length;
  let nextSuffix = nextText.length;
  while (previousSuffix > prefix && nextSuffix > prefix && previousText[previousSuffix - 1] === nextText[nextSuffix - 1]) {
    previousSuffix -= 1;
    nextSuffix -= 1;
  }

  const delta = (nextSuffix - prefix) - (previousSuffix - prefix);
  annotation.imageAnchors = annotation.imageAnchors.map((offset) => {
    const safeOffset = Number(offset || 0);
    if (safeOffset <= prefix) return clamp(safeOffset, 0, nextText.length);
    if (safeOffset >= previousSuffix) return clamp(safeOffset + delta, 0, nextText.length);
    return clamp(prefix, 0, nextText.length);
  });
}

function createReferenceImage(src, index, className) {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.dataset.referenceIndex = String(index);
  image.alt = currentLanguage === "zh" ? "\u53c2\u8003\u56fe" : "Reference image";
  bindReferenceImageHighlight(image);
  return image;
}

function bindReferenceImageHighlight(image) {
  image.addEventListener("pointerenter", () => setReferenceImageHighlight(image, true));
  image.addEventListener("pointerleave", () => setReferenceImageHighlight(image, false));
  image.addEventListener("focus", () => setReferenceImageHighlight(image, true));
  image.addEventListener("blur", () => setReferenceImageHighlight(image, false));
}

function setReferenceImageHighlight(image, active) {
  const editor = image.closest(".annotation-editor");
  const index = image.dataset.referenceIndex;
  if (!editor || index == null) return;

  editor.querySelectorAll(`[data-reference-index="${CSS.escape(index)}"]`).forEach((item) => {
    item.classList.toggle("reference-highlighted", active);
  });
}

function syncReferenceListLayout(list, annotation) {
  list.classList.toggle("compact", (annotation.images || []).length > 2);
}

function autoResizeAnnotationInput(input) {
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight}px`;
}

function handleAnnotationPaste(event, annotation, references, inlineReferences, onChange) {
  const imageItems = [...event.clipboardData?.items || []].filter((item) => item.type.startsWith("image/"));
  if (!imageItems.length) return;

  event.preventDefault();
  const anchorOffset = getActiveAnnotationInputOffset(inlineReferences);

  imageItems.forEach((item) => {
    const file = item.getAsFile();
    if (file) addReferenceImageFile(file, annotation, references, inlineReferences, onChange, anchorOffset);
  });
}

async function pasteClipboardIntoAnnotation(input, annotation, references, inlineReferences, onChange) {
  let handled = false;
  const anchorOffset = input.selectionStart ?? input.value.length;

  try {
    if (navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          addReferenceImageFile(blob, annotation, references, inlineReferences, onChange, anchorOffset);
          handled = true;
        }

        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          if (text) {
            insertTextAtCursor(input, text);
            handled = true;
          }
        }
      }
    }

    if (!handled && navigator.clipboard?.readText) {
      const text = await navigator.clipboard.readText();
      if (text) {
        insertTextAtCursor(input, text);
        handled = true;
      }
    }
  } catch {
    input.focus();
    return;
  }

  if (handled) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }
}

function insertTextAtCursor(input, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = `${input.value.slice(0, start)}${text}${input.value.slice(end)}`;
  const nextPosition = start + text.length;
  input.setSelectionRange(nextPosition, nextPosition);
}

function getActiveAnnotationInputOffset(inlineReferences) {
  const input = inlineReferences.closest(".annotation-input-row")?.querySelector("textarea");
  return input?.selectionStart ?? input?.value.length ?? 0;
}

function getClipboardImageFile(event) {
  const item = [...event.clipboardData?.items || []].find((entry) => entry.type.startsWith("image/"));
  const blob = item?.getAsFile();
  if (!blob) return null;

  const extension = blob.type.split("/")[1] || "png";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return new File([blob], `clipboard-image-${timestamp}.${extension}`, {
    type: blob.type || "image/png",
    lastModified: Date.now(),
  });
}

async function loadImageFromClipboard() {
  try {
    if (!navigator.clipboard?.read) return "unsupported";

    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith("image/"));
      if (!imageType) continue;

      const blob = await item.getType(imageType);
      const extension = imageType.split("/")[1] || "png";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await addClipboardImageToBoard(
        new File([blob], `clipboard-image-${timestamp}.${extension}`, {
          type: imageType,
          lastModified: Date.now(),
        }),
      );
      return "pasted";
    }
    return "empty";
  } catch {
    return "unsupported";
  }
}

function addReferenceImageFile(file, annotation, references, inlineReferences, onChange, anchorOffset = null) {
  annotation.images ||= [];
  annotation.imageAnchors ||= [];
  const reader = new FileReader();
  reader.onload = () => {
    const src = String(reader.result);
    annotation.images.push(src);
    const index = annotation.images.length - 1;
    const input = inlineReferences.closest(".annotation-input-row")?.querySelector("textarea");
    const textLength = input?.value.length ?? annotation.text?.length ?? 0;
    annotation.imageAnchors[index] = clamp(Number(anchorOffset ?? textLength), 0, textLength);
    syncReferenceListLayout(references, annotation);
    references.append(createReferenceImage(src, index, "reference-image"));
    renderInlineReferenceList(inlineReferences, annotation, input?.value || annotation.text || "");
    onChange?.();
    if (!annotation.draft) {
      touchAnnotation(annotation);
      saveAnnotations();
      renderAnnotations();
    }
  };
  reader.readAsDataURL(file);
}

function getAnnotationColor(annotation) {
  return getAnnotationIntentColor(getAnnotationIntent(annotation), annotation.color);
}

function getAnnotationIntentColor(intent, fallback = defaultAnnotationColor) {
  return annotationIntentColors[intent] || fallback || defaultAnnotationColor;
}

function getAnnotationIntent(annotation) {
  return annotation.intent || "suggestion";
}

function previewAnnotationIntent(annotationId, intent) {
  const color = getAnnotationIntentColor(intent);
  const editor = getAnnotationEditor(annotationId);
  const visual = getAnnotationVisualElement(annotationId);
  const arrow = pageStack.querySelector(`.annotation-arrow[data-annotation-id="${annotationId}"]`);

  editor?.style.setProperty("--annotation-color", color);
  visual?.style.setProperty("--annotation-color", color);
  arrow?.style.setProperty("--annotation-color", color);

  if (visual?.classList.contains("mark-box")) {
    visual.classList.remove("intent-suggestion", "intent-editText", "intent-deleteContent");
    visual.classList.add(`intent-${intent}`);
  }
}

function getAnnotationIntentLabel(annotation) {
  const labels = {
    suggestion: t("suggestionTab"),
    editText: t("editTextTab"),
    deleteContent: t("deleteTab"),
  };
  return labels[getAnnotationIntent(annotation)] || labels.suggestion;
}

function getAnnotationFallbackText(annotation) {
  if (getAnnotationIntent(annotation) === "deleteContent") return t("deleteFallback");
  if (getAnnotationIntent(annotation) === "editText") return t("editTextPlaceholder");
  return t(`${annotation.type}Comment`);
}

function getAnnotationUpdatedAt(annotation) {
  return Number(annotation.updatedAt || annotation.createdAt || 0);
}

function touchAnnotation(annotation) {
  const now = Date.now();
  annotation.createdAt ||= now;
  annotation.updatedAt = now;
}

function getAnnotationArrowWidth(annotation) {
  return `${annotation.arrowWidth || 0.75}px`;
}

function focusAnnotationInput(annotationId) {
  requestAnimationFrame(() => {
    const input = getAnnotationEditor(annotationId)?.querySelector("textarea");
    try {
      input?.focus({ preventScroll: true });
    } catch {
      input?.focus();
    }
    input?.select();
    resetDocumentScroll();
  });
}

function syncMobileViewportGeometry() {
  if (!isMobileLayout()) {
    document.documentElement.style.removeProperty("--mobile-visual-offset-top");
    document.documentElement.style.removeProperty("--mobile-visual-bottom-inset");
    return;
  }

  const viewport = window.visualViewport;
  const offsetTop = Math.max(0, viewport?.offsetTop || 0);
  const viewportHeight = viewport?.height || window.innerHeight;
  const bottomInset = Math.max(0, window.innerHeight - offsetTop - viewportHeight);

  document.documentElement.style.setProperty("--mobile-visual-offset-top", `${offsetTop}px`);
  document.documentElement.style.setProperty("--mobile-visual-bottom-inset", `${bottomInset}px`);
  resetDocumentScroll();
}

function resetDocumentScroll() {
  if (!isMobileLayout()) return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function openAnnotationEditor(annotationId) {
  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation || annotation.preview) return;

  editingAnnotationId = annotationId;
  renderAnnotations();
  focusAnnotationInput(annotationId);
}

function commitAnnotation(annotationId, value, intent = "suggestion") {
  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation) return;

  const text = value.trim();
  if (intent !== "deleteContent" && !text && !hasReferenceImages(annotation)) {
    cancelAnnotation(annotationId);
    return;
  }

  annotation.text = text;
  annotation.intent = intent;
  annotation.color = getAnnotationIntentColor(intent);
  touchAnnotation(annotation);
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
  return Array.isArray(annotation?.images) && annotation.images.length > 0;
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
    let moved = false;
    box.classList.add("moving");
    beginAnnotationOperationMagnifier(event, page);

    const move = (moveEvent) => {
      const next = getPagePoint(moveEvent, page);
      updateAnnotationOperationMagnifier(moveEvent);
      if (Math.hypot(next.x - start.x, next.y - start.y) > 0.2) moved = true;
      if (annotation.type === "mark") {
        annotation.x = clamp(startX + next.x - start.x, 0, 100 - annotation.width);
        annotation.y = clamp(startY + next.y - start.y, 0, 100 - annotation.height);
      } else {
        annotation.x = clamp(startX + next.x - start.x, 0, 100);
        annotation.y = clamp(startY + next.y - start.y, 0, 100);
      }
      box.style.left = `${annotation.x}%`;
      box.style.top = `${annotation.y}%`;
      updateAnnotationArrow(annotation);
      syncAnnotationEditorPosition(annotation);
      if (annotation.type === "mark") scheduleRegionPreviewRefresh(annotation.id);
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      box.classList.remove("moving");
      stopMagnifier();
      if (moved && !annotation.draft) {
        touchAnnotation(annotation);
        saveAnnotations();
        renderAnnotations();
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  });
}

function bindAnnotationEdit(element, annotation) {
  element.addEventListener(
    "pointerdown",
    (event) => {
      if (event.detail < 2 || event.target.closest(".annotation-editor, .resize-corner, .arrow-anchor")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openAnnotationEditor(annotation.id);
    },
    { capture: true },
  );

  element.addEventListener("dblclick", (event) => {
    if (event.target.closest(".annotation-editor, .resize-corner, .arrow-anchor")) return;
    event.preventDefault();
    event.stopPropagation();
    openAnnotationEditor(annotation.id);
  });
}

function bindAnnotationHover(element, annotation) {
  element.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    setLinkedCommentActive(annotation.id, true);
    ensureCommentVisible(annotation.id);
  });

  element.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    setLinkedCommentActive(annotation.id, false);
  });
}

function bindAnnotationArrow(handle, annotation, side) {
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const page = handle.closest(".doc-page");
    if (!page) return;

    handle.setPointerCapture?.(event.pointerId);
    const layer = getAnnotationLayer(page);
    annotation.arrowAnchor = side;
    if (!hasAnnotationArrow(annotation)) {
      const start = getArrowStartPoint(annotation);
      annotation.arrowX = start.x;
      annotation.arrowY = start.y;
      layer.prepend(createAnnotationArrow(annotation));
    } else {
      updateAnnotationArrow(annotation);
    }

    beginAnnotationOperationMagnifier(event, page);

    const move = (moveEvent) => {
      const next = getPagePoint(moveEvent, page);
      updateAnnotationOperationMagnifier(moveEvent);
      annotation.arrowX = clamp(next.x, 0, 100);
      annotation.arrowY = clamp(next.y, 0, 100);
      updateAnnotationArrow(annotation);
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      handle.releasePointerCapture?.(event.pointerId);
      stopMagnifier();
      if (!annotation.draft) {
        touchAnnotation(annotation);
        saveAnnotations();
        renderAnnotations();
      }
    };

    move(event);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  });
}

function bindAnnotationArrowEdit(arrow, annotation) {
  const hitTargets = [arrow.querySelector(".arrow-hit"), arrow.querySelector(".arrow-endpoint")].filter(Boolean);

  hitTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => arrow.classList.add("hovered"));
    target.addEventListener("pointerleave", () => arrow.classList.remove("hovered"));
    target.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        const current = annotation.arrowWidth || 0.75;
        annotation.arrowWidth = clamp(current + (event.deltaY < 0 ? 0.15 : -0.15), 0.45, 2.4);
        updateAnnotationArrow(annotation);
        if (!annotation.draft) {
          touchAnnotation(annotation);
          saveAnnotations();
          renderAnnotations();
        }
      },
      { passive: false },
    );

    target.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const page = arrow.closest(".doc-page");
      if (!page) return;

      arrow.classList.add("dragging", "hovered");
      target.setPointerCapture?.(event.pointerId);
      beginAnnotationOperationMagnifier(event, page);

      const move = (moveEvent) => {
        const next = getPagePoint(moveEvent, page);
        updateAnnotationOperationMagnifier(moveEvent);
        annotation.arrowX = clamp(next.x, 0, 100);
        annotation.arrowY = clamp(next.y, 0, 100);
        updateAnnotationArrow(annotation);
      };

      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
        target.releasePointerCapture?.(event.pointerId);
        arrow.classList.remove("dragging");
        stopMagnifier();
        if (!target.matches(":hover")) arrow.classList.remove("hovered");
        if (!annotation.draft) {
          touchAnnotation(annotation);
          saveAnnotations();
          renderAnnotations();
        }
      };

      move(event);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    });
  });
}

function bindAnnotationResize(handle, annotation, corner = "bottom-right") {
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const page = handle.closest(".doc-page");
    const start = getPagePoint(event, page);
    const startX = annotation.x;
    const startY = annotation.y;
    const startWidth = annotation.width;
    const startHeight = annotation.height;
    const fixedRight = startX + startWidth;
    const fixedBottom = startY + startHeight;
    const box = handle.closest(".mark-box");
    box.classList.add("resizing");
    beginAnnotationOperationMagnifier(event, page);

    const move = (moveEvent) => {
      const next = getPagePoint(moveEvent, page);
      updateAnnotationOperationMagnifier(moveEvent);
      if (corner === "top-left") {
        const nextX = clamp(startX + next.x - start.x, 0, fixedRight - 4);
        const nextY = clamp(startY + next.y - start.y, 0, fixedBottom - 3);
        annotation.x = nextX;
        annotation.y = nextY;
        annotation.width = fixedRight - nextX;
        annotation.height = fixedBottom - nextY;
        box.style.left = `${annotation.x}%`;
        box.style.top = `${annotation.y}%`;
      } else {
        annotation.width = clamp(startWidth + next.x - start.x, 4, 100 - annotation.x);
        annotation.height = clamp(startHeight + next.y - start.y, 3, 100 - annotation.y);
      }
      box.style.width = `${annotation.width}%`;
      box.style.height = `${annotation.height}%`;
      updateAnnotationArrow(annotation);
      syncAnnotationEditorPosition(annotation);
      scheduleRegionPreviewRefresh(annotation.id);
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      box.classList.remove("resizing");
      stopMagnifier();
      if (!annotation.draft) {
        touchAnnotation(annotation);
        saveAnnotations();
        renderAnnotations();
      }
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

function renderCommentGroups(groupedComments) {
  [...groupedComments.entries()]
    .sort(([pageA], [pageB]) => Number(pageA) - Number(pageB))
    .forEach(([pageId, pageAnnotations]) => {
      const group = createCommentGroup(pageId, pageAnnotations.length);
      const items = group.querySelector(".comment-page-items");
      pageAnnotations
        .slice()
        .sort((first, second) => getAnnotationUpdatedAt(first) - getAnnotationUpdatedAt(second))
        .forEach((annotation) => addComment(annotation, items));
      commentList.append(group);
    });
}

function createCommentGroup(pageId, count) {
  const group = document.createElement("section");
  group.className = "comment-page-group";
  group.dataset.pageId = pageId;
  group.classList.toggle("collapsed", collapsedCommentGroups.has(pageId));

  const header = document.createElement("button");
  header.className = "comment-page-header";
  header.type = "button";
  header.setAttribute("aria-expanded", String(!collapsedCommentGroups.has(pageId)));

  const title = document.createElement("span");
  title.className = "comment-page-title";
  title.append(createIconPlaceholder("chevron-down"), document.createTextNode(t("page", { page: pageId })));

  const badge = document.createElement("span");
  badge.className = "comment-page-count";
  badge.textContent = String(count);

  const items = document.createElement("div");
  items.className = "comment-page-items";

  header.append(title, badge);
  header.addEventListener("click", () => {
    const collapsed = !group.classList.contains("collapsed");
    group.classList.toggle("collapsed", collapsed);
    header.setAttribute("aria-expanded", String(!collapsed));
    if (collapsed) collapsedCommentGroups.add(pageId);
    else collapsedCommentGroups.delete(pageId);
  });

  group.append(header, items);
  return group;
}

function addComment(annotation, container = commentList) {
  const article = document.createElement("article");
  article.className = "comment";
  article.dataset.annotationId = annotation.id;
  article.tabIndex = 0;
  article.style.setProperty("--annotation-color", getAnnotationColor(annotation));

  if (annotation.renderIndex) {
    const indexBadge = document.createElement("span");
    indexBadge.className = "comment-index-badge";
    indexBadge.textContent = String(annotation.renderIndex);
    article.append(indexBadge);
  }

  const body = document.createElement("div");
  body.className = "comment-body";

  const title = document.createElement("strong");
  title.className = "comment-title";
  const titleMeta = document.createElement("span");
  titleMeta.className = "comment-title-meta";
  const titleIntent = document.createElement("span");
  titleIntent.textContent = getAnnotationIntentLabel(annotation);
  const time = document.createElement("time");
  time.className = "comment-title-time";
  time.textContent = currentLanguage === "zh" ? "\u521a\u521a" : "Just now";
  titleMeta.append(titleIntent, time);
  const titlePage = document.createElement("span");
  titlePage.className = "comment-title-page";
  titlePage.textContent = t("page", { page: annotation.pageId });
  title.append(titleMeta, titlePage);

  const text = document.createElement("p");
  text.textContent = annotation.text || getAnnotationFallbackText(annotation);

  body.append(title, text);
  if (annotation.type === "mark") {
    const regionPreview = createCommentRegionPreview(annotation);
    if (regionPreview) body.append(regionPreview);
  }
  if (hasReferenceImages(annotation)) body.append(createCommentReferences(annotation));
  article.append(body);
  container.append(article);
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
  button.addEventListener("pointerenter", (event) => queueCommentImagePreview(image.src, event.currentTarget));
  button.addEventListener("pointermove", (event) => positionCommentImagePreview(event.currentTarget));
  button.addEventListener("pointerleave", hideCommentImagePreview);
  button.addEventListener("focus", (event) => queueCommentImagePreview(image.src, event.currentTarget));
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
    button.addEventListener("pointerenter", (event) => queueCommentImagePreview(src, event.currentTarget));
    button.addEventListener("pointermove", (event) => positionCommentImagePreview(event.currentTarget));
    button.addEventListener("pointerleave", hideCommentImagePreview);
    button.addEventListener("focus", (event) => queueCommentImagePreview(src, event.currentTarget));
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

function queueCommentImagePreview(src, anchor) {
  window.clearTimeout(commentImagePreviewTimer);
  positionCommentImagePreview(anchor);
  commentImagePreviewTimer = window.setTimeout(() => {
    showCommentImagePreview(src, anchor);
  }, commentImagePreviewDelay);
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
  window.clearTimeout(commentImagePreviewTimer);
  commentImagePreviewTimer = null;
  commentImagePreview.classList.remove("open");
}

async function exportStaticBoard() {
  const pages = [...pageStack.querySelectorAll(".doc-page")]
    .map((page) => {
      const canvas = page.querySelector("canvas");
      if (!canvas?.width || !canvas?.height) return null;
      return {
        id: page.dataset.pageId,
        width: canvas.width,
        height: canvas.height,
        image: canvas.toDataURL("image/png"),
      };
    })
    .filter(Boolean);

  const exportedAnnotations = annotations
    .filter((annotation) => !annotation.draft && isPersistableAnnotation(annotation))
    .map((annotation) => ({
      ...annotation,
      color: getAnnotationColor(annotation),
      intentLabel: getAnnotationIntentLabel(annotation),
      fallbackText: getAnnotationFallbackText(annotation),
      regionImage: annotation.type === "mark" ? createAnnotationRegionImage(annotation) : "",
    }));

  const payload = {
    title: docTitle.textContent || t("appTitle"),
    subtitle: docSubtitle.textContent || "",
    exportedAt: new Date().toLocaleString(currentLanguage === "zh" ? "zh-CN" : "en"),
    pages,
    annotations: exportedAnnotations,
  };

  const html = createStaticBoardHtml(payload);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(payload.title || "pointking-review")}-annotations.html`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createStaticBoardHtml(payload) {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="${currentLanguage === "zh" ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(payload.title)} - PointKing</title>
<style>
:root{color-scheme:dark;--bg:#08090c;--panel:#101116;--panel-2:#151720;--line:rgba(255,255,255,.1);--text:#f5f5f7;--muted:#8f96a3;--accent:#6e7cff;--danger:#ff6b6b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:"Microsoft YaHei",Arial,sans-serif;font-size:14px}
.shell{display:grid;grid-template-columns:minmax(0,1fr)340px;height:100vh;overflow:hidden}.stage{overflow:auto;padding:28px;background:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px),#090a10;background-size:32px 32px}.top{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;margin:-28px -28px 24px;padding:14px 20px;border-bottom:1px solid var(--line);background:rgba(8,9,12,.9);backdrop-filter:blur(16px)}h1{margin:0;font-size:14px}.meta{color:var(--muted);font-size:12px}.pages{display:grid;gap:28px;justify-items:center}.page{position:relative;width:min(920px,100%);background:white;box-shadow:0 20px 60px rgba(0,0,0,.34)}.page>img{display:block;width:100%;height:auto}.badge{position:absolute;left:0;bottom:calc(100% + 5px);padding:3px 7px;border:1px solid var(--line);border-radius:6px;background:rgba(16,17,22,.94);color:var(--muted);font-size:11px;font-weight:700}.mark,.dot,.arrow{position:absolute}.mark{border:2px solid var(--c);background:transparent}.mark.delete{background:color-mix(in srgb,var(--c) 16%,transparent)}.dot{width:14px;height:14px;border:2px solid #fff;border-radius:99px;background:var(--c);transform:translate(-50%,-50%);box-shadow:0 2px 8px rgba(0,0,0,.3)}.arrow{inset:0;pointer-events:none;color:var(--c);overflow:visible}.arrow line{stroke:currentColor;stroke-width:var(--w);stroke-linecap:round;vector-effect:non-scaling-stroke}.tooltip{position:absolute;left:50%;bottom:calc(100% + 8px);display:none;max-width:230px;transform:translateX(-50%);padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:rgba(16,17,22,.96);box-shadow:0 12px 32px rgba(0,0,0,.3);color:var(--text);font-size:12px;line-height:1.45}.mark:hover .tooltip,.dot-wrap:hover .tooltip{display:block}.dot-wrap{position:absolute}.side{min-width:0;border-left:1px solid var(--line);background:var(--panel);padding:16px;overflow:auto}.side-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:12px}.side h2{margin:0;font-size:14px}.count{color:var(--muted);font-size:12px}.group{display:grid;gap:8px;margin-bottom:12px}.group-title{display:flex;justify-content:space-between;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel-2);font-weight:700;font-size:12px}.card{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;padding:10px;border:1px solid var(--line);border-left:2px solid var(--c);border-radius:8px;background:rgba(255,255,255,.025);cursor:pointer}.card:hover,.card.active{background:color-mix(in srgb,var(--c) 14%,transparent);border-color:color-mix(in srgb,var(--c) 58%,var(--line))}.avatar{display:grid;width:28px;height:28px;place-items:center;border-radius:7px;background:color-mix(in srgb,var(--c) 22%,transparent);color:#fff;font-size:11px;font-weight:800}.card strong{display:block;margin-bottom:4px;font-size:12px}.card p{margin:0 0 7px;color:#c7ccd5;font-size:12px;line-height:1.45}.thumb{display:block;width:100%;max-height:96px;object-fit:cover;border:1px solid color-mix(in srgb,var(--c) 56%,var(--line));border-radius:7px;background:#fff}.refs{display:flex;gap:6px;flex-wrap:wrap}.refs img{width:56px;height:42px;object-fit:cover;border-radius:6px;border:1px solid var(--line)}.preview{position:fixed;z-index:20;display:none;max-width:min(520px,80vw);max-height:70vh;border:1px solid var(--line);border-radius:8px;background:var(--panel);box-shadow:0 20px 60px rgba(0,0,0,.5);padding:6px}.preview.open{display:block}.preview img{display:block;max-width:100%;max-height:calc(70vh - 12px);border-radius:5px}@media(max-width:900px){.shell{grid-template-columns:1fr}.side{height:42vh;border-left:0;border-top:1px solid var(--line)}}
</style>
</head>
<body>
<div class="shell">
  <main class="stage">
    <header class="top"><div><h1>${escapeHtml(payload.title)}</h1><div class="meta">${escapeHtml(payload.subtitle)}</div></div><div class="meta">${escapeHtml(payload.exportedAt)}</div></header>
    <section class="pages" id="pages"></section>
  </main>
  <aside class="side"><div class="side-head"><h2>${currentLanguage === "zh" ? "批注" : "Annotations"}</h2><span class="count" id="count"></span></div><div id="comments"></div></aside>
</div>
<div class="preview" id="preview"><img alt=""></div>
<script>
const data=${json};
const pages=document.querySelector("#pages"),comments=document.querySelector("#comments"),count=document.querySelector("#count"),preview=document.querySelector("#preview"),previewImg=preview.querySelector("img");
const byPage=new Map(data.pages.map(p=>[String(p.id),p]));
function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function label(a){return a.intentLabel+" · "+(document.documentElement.lang.startsWith("zh")?"第 "+a.pageId+" 页":"Page "+a.pageId)}
data.pages.forEach(p=>{const el=document.createElement("section");el.className="page";el.id="page-"+p.id;el.style.aspectRatio=p.width+"/"+p.height;el.innerHTML='<span class="badge">Page '+esc(p.id)+'</span><img src="'+p.image+'" alt="Page '+esc(p.id)+'">';pages.append(el)});
data.annotations.forEach(a=>{const page=document.querySelector("#page-"+CSS.escape(String(a.pageId)));if(!page)return;const c=a.color||"#6e7cff";if(a.type==="mark"){const el=document.createElement("div");el.className="mark "+(a.intent==="deleteContent"?"delete":"");el.style.cssText="--c:"+c+";left:"+a.x+"%;top:"+a.y+"%;width:"+a.width+"%;height:"+a.height+"%";el.dataset.id=a.id;el.innerHTML='<div class="tooltip">'+esc(a.text||a.fallbackText)+'</div>';page.append(el)}else{const wrap=document.createElement("div");wrap.className="dot-wrap";wrap.style.cssText="left:"+a.x+"%;top:"+a.y+"%";wrap.dataset.id=a.id;wrap.innerHTML='<span class="dot" style="--c:'+c+'"></span><div class="tooltip">'+esc(a.text||a.fallbackText)+'</div>';page.append(wrap)}if(Number.isFinite(a.arrowX)&&Number.isFinite(a.arrowY)){const start=a.arrowAnchor==="right"?[a.x+a.width,a.y+a.height/2]:a.arrowAnchor==="bottom"?[a.x+a.width/2,a.y+a.height]:a.arrowAnchor==="left"?[a.x,a.y+a.height/2]:[a.x+a.width/2,a.y];const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.classList.add("arrow");svg.style.setProperty("--c",c);svg.style.setProperty("--w",(a.arrowWidth||.75)+"px");svg.setAttribute("viewBox","0 0 100 100");svg.setAttribute("preserveAspectRatio","none");svg.innerHTML='<defs><marker id="m-'+a.id+'" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L10,5 L0,10 Z" fill="currentColor"/></marker></defs><line x1="'+start[0]+'" y1="'+start[1]+'" x2="'+a.arrowX+'" y2="'+a.arrowY+'" marker-end="url(#m-'+a.id+')"/>';page.append(svg)}});
const groups=new Map();data.annotations.forEach(a=>{if(!groups.has(String(a.pageId)))groups.set(String(a.pageId),[]);groups.get(String(a.pageId)).push(a)});count.textContent=data.annotations.length;[...groups.entries()].sort((a,b)=>Number(a[0])-Number(b[0])).forEach(([pageId,items])=>{const g=document.createElement("section");g.className="group";g.innerHTML='<div class="group-title"><span>'+(document.documentElement.lang.startsWith("zh")?"第 "+esc(pageId)+" 页":"Page "+esc(pageId))+'</span><span>'+items.length+'</span></div>';items.sort((a,b)=>(a.updatedAt||0)-(b.updatedAt||0)).forEach(a=>{const card=document.createElement("article");card.className="card";card.dataset.id=a.id;card.style.setProperty("--c",a.color||"#6e7cff");card.innerHTML='<span class="avatar">PK</span><div><strong>'+esc(label(a))+'</strong><p>'+esc(a.text||a.fallbackText)+'</p>'+(a.regionImage?'<img class="thumb" src="'+a.regionImage+'" alt="">':"")+(a.images?.length?'<div class="refs">'+a.images.map(src=>'<img src="'+src+'" alt="">').join("")+'</div>':"")+'</div>';g.append(card)});comments.append(g)});
comments.addEventListener("click",e=>{const card=e.target.closest(".card");if(!card)return;document.querySelectorAll(".card.active").forEach(c=>c.classList.remove("active"));card.classList.add("active");const mark=document.querySelector('[data-id="'+CSS.escape(card.dataset.id)+'"]');mark?.scrollIntoView({block:"center",inline:"center",behavior:"smooth"})});
document.addEventListener("mouseover",e=>{const img=e.target.closest(".thumb,.refs img");if(!img)return;previewImg.src=img.src;preview.classList.add("open")});
document.addEventListener("mousemove",e=>{if(!preview.classList.contains("open"))return;preview.style.left=Math.min(innerWidth-540,e.clientX+14)+"px";preview.style.top=Math.max(12,Math.min(innerHeight-360,e.clientY+14))+"px"});
document.addEventListener("mouseout",e=>{if(e.target.closest(".thumb,.refs img"))preview.classList.remove("open")});
</script>
</body>
</html>`;
}

function sanitizeFilename(name) {
  return String(name).replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "pointking-review";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function focusAnnotationFromComment(annotationId) {
  fitAnnotationPageInViewport(annotationId, { force: true });
}

function ensureAnnotationVisible(annotationId) {
  const target = pageStack.querySelector(`.annotation-ui[data-annotation-id="${annotationId}"]`);
  if (!target) return;

  const targetRect = target.getBoundingClientRect();
  const viewportRect = canvasViewport.getBoundingClientRect();
  const margin = 64;
  const visible =
    targetRect.right >= viewportRect.left + margin &&
    targetRect.left <= viewportRect.right - margin &&
    targetRect.bottom >= viewportRect.top + margin &&
    targetRect.top <= viewportRect.bottom - margin;

  if (!visible) fitAnnotationPageInViewport(annotationId);
}

function fitAnnotationPageInViewport(annotationId, options = {}) {
  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation) return false;

  const page = pageStack.querySelector(`.doc-page[data-page-id="${annotation.pageId}"]`);
  if (!page) return false;

  const pageX = pageStack.offsetLeft + page.offsetLeft;
  const pageY = pageStack.offsetTop + page.offsetTop;
  const viewport = canvasViewport.getBoundingClientRect();
  const padding = Math.min(96, Math.max(32, Math.min(viewport.width, viewport.height) * 0.08));
  const fitWidth = (viewport.width - padding * 2) / page.offsetWidth;
  const fitHeight = (viewport.height - padding * 2) / page.offsetHeight;
  const nextZoom = clamp(Math.min(fitWidth, fitHeight), 0.35, 2.6);
  const worldX = pageX + page.offsetWidth / 2;
  const worldY = pageY + page.offsetHeight / 2;

  zoom = nextZoom;
  pan.x = viewport.width / 2 - worldX * zoom;
  pan.y = viewport.height / 2 - worldY * zoom;
  applyCanvasTransform();
  if (options.force) highlightAnnotation(annotationId);
  return true;
}

function setLinkedCommentActive(annotationId, active) {
  const comment = commentList.querySelector(`[data-annotation-id="${annotationId}"]`);
  comment?.classList.toggle("active", active);
}

function ensureCommentVisible(annotationId) {
  const comment = commentList.querySelector(`[data-annotation-id="${annotationId}"]`);
  if (!comment) return;

  comment.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

function setAnnotationFocusMask(annotationId, active) {
  clearAnnotationFocusMasks();
  if (!active) return;

  const annotation = annotations.find((item) => item.id === annotationId);
  if (!annotation || annotation.draft || annotation.preview) return;

  const page = pageStack.querySelector(`.doc-page[data-page-id="${annotation.pageId}"]`);
  const overlay = page?.querySelector(".overlay");
  if (!overlay) return;

  overlay.append(createAnnotationFocusMask(annotation));
}

function clearAnnotationFocusMasks() {
  pageStack.querySelectorAll(".annotation-focus-mask").forEach((item) => item.remove());
}

function createAnnotationFocusMask(annotation) {
  const id = `annotation-mask-${annotation.id}`;
  const group = createSvg("g", { class: "annotation-focus-mask" });
  const defs = createSvg("defs");
  const mask = createSvg("mask", { id, maskUnits: "userSpaceOnUse" });
  mask.append(createSvg("rect", { x: "0", y: "0", width: "100", height: "100", fill: "white" }));

  if (annotation.type === "mark") {
    const inset = 0.35;
    mask.append(
      createSvg("rect", {
        x: String(clamp(annotation.x - inset, 0, 100)),
        y: String(clamp(annotation.y - inset, 0, 100)),
        width: String(clamp(annotation.width + inset * 2, 0, 100)),
        height: String(clamp(annotation.height + inset * 2, 0, 100)),
        fill: "black",
      }),
    );
  } else {
    mask.append(createSvg("circle", { cx: String(annotation.x), cy: String(annotation.y), r: "3.4", fill: "black" }));
  }

  defs.append(mask);
  group.append(defs);
  group.append(createSvg("rect", { x: "0", y: "0", width: "100", height: "100", class: "annotation-focus-dim", mask: `url(#${id})` }));
  return group;
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

async function loadFile(file, options = {}) {
  const shouldStoreFile = options.store !== false;
  currentDocumentKey = getDocumentKey(file);
  deletedPageIds = await readDeletedPageIds(currentDocumentKey);
  try {
    localStorage.setItem(lastDocumentKey, currentDocumentKey);
  } catch {}
  if (shouldStoreFile) await storeDocumentFile(currentDocumentKey, file).catch(() => {});
  upsertDocumentRecord({
    key: currentDocumentKey,
    kind: "file",
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    updatedAt: Date.now(),
  });
  docTitle.textContent = file.name;
  fileName.textContent = file.name;
  statusFileName.textContent = file.name;
  setFileMetaText(`${formatBytes(file.size)} \u00b7 \u672c\u5730\u9884\u89c8`);
  await restoreAnnotationsForCurrentDocument();
  resetPages();

  if (file.type.startsWith("image/")) {
    await renderImage(file);
    await appendStoredExtraPages(currentDocumentKey);
    updateCurrentDocumentPageMeta();
    updateCurrentDocumentThumbnail();
    if (!hasDocumentPages()) renderEmptyDocumentState();
    activateMobileAnnotationTool();
    renderDocumentList();
    return;
  }

  if (file.type === "application/pdf") {
    await renderPdf(file);
    await appendStoredExtraPages(currentDocumentKey);
    updateCurrentDocumentPageMeta();
    updateCurrentDocumentThumbnail();
    if (!hasDocumentPages()) renderEmptyDocumentState();
    activateMobileAnnotationTool();
    renderDocumentList();
  }
}

function resetPages() {
  hideStartupPanel();
  pageStack.replaceChildren();
  renderAnnotations();
}

function updateCurrentDocumentThumbnail() {
  if (!currentDocumentKey) return;
  const thumbnail = createFirstPageThumbnail();
  updateDocumentRecord(currentDocumentKey, { thumbnail });
}

function createFirstPageThumbnail() {
  const source = pageStack.querySelector(".doc-page canvas");
  if (!source?.width || !source?.height) return "";

  const output = document.createElement("canvas");
  const target = 320;
  const ratio = source.width / source.height;
  output.width = ratio >= 1 ? target : Math.max(1, Math.round(target * ratio));
  output.height = ratio >= 1 ? Math.max(1, Math.round(target / ratio)) : target;
  const context = output.getContext("2d");
  context.fillStyle = "#f6f7f9";
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(source, 0, 0, output.width, output.height);
  return output.toDataURL("image/jpeg", 0.68);
}

function createPage(pageId, width, height) {
  hideStartupPanel();
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
  const badgeText = document.createElement("span");
  badgeText.textContent = `Page ${pageId}`;
  const deleteButton = document.createElement("button");
  deleteButton.className = "page-delete";
  deleteButton.type = "button";
  deleteButton.title = t("confirmDelete");
  deleteButton.setAttribute("aria-label", `${t("confirmDelete")} Page ${pageId}`);
  deleteButton.append(createIconPlaceholder("x"));
  deleteButton.addEventListener("pointerdown", (event) => event.stopPropagation());
  deleteButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    confirmDeletePage(pageId);
  });
  badge.append(badgeText, deleteButton);

  page.append(canvas, overlay, annotationLayer, badge);
  pageStack.append(page);
  return { page, canvas };
}

function renderImage(file) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (!isPageDeleted(1)) drawImageAsPage(image, 1);
      setFileMetaText(`${formatBytes(file.size)} \u00b7 image \u00b7 \u672c\u5730\u9884\u89c8`);
      renderAnnotations();
      resetCanvasView();
      resolve();
    };
    image.src = URL.createObjectURL(file);
  });
}

function renderBlankPage(pageId = 1) {
  if (isPageDeleted(pageId)) return;

  const width = 1200;
  const height = 1600;
  const { canvas } = createPage(pageId, width, height);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#e5e7eb";
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawImageAsPage(image, pageId) {
  if (isPageDeleted(pageId)) return null;
  const { canvas } = createPage(pageId, image.naturalWidth, image.naturalHeight);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext("2d").drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  return canvas;
}

function hasDocumentPages() {
  return pageStack.querySelector(".doc-page") != null;
}

function getNextPageId() {
  const ids = [...pageStack.querySelectorAll(".doc-page")]
    .map((page) => Number(page.dataset.pageId))
    .filter(Number.isFinite);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function updateCurrentDocumentPageMeta(extraText = "") {
  const pageCount = pageStack.querySelectorAll(".doc-page").length;
  const currentRecord = documentCatalog.find((item) => item.key === currentDocumentKey);
  if (currentRecord?.kind === "blank") {
    setFileMetaText(getBlankDocumentMetaText(currentRecord, pageCount, extraText));
    updateDocumentRecord(currentDocumentKey, { pageCount });
    return;
  }
  if (!pageCount) {
    setFileMetaText(`0 pages \u00b7 \u672c\u5730\u9884\u89c8`);
    if (currentDocumentKey) updateDocumentRecord(currentDocumentKey, { pageCount: 0 });
    return;
  }
  const suffix = extraText ? ` \u00b7 ${extraText}` : "";
  setFileMetaText(`${pageCount} pages${suffix} \u00b7 \u672c\u5730\u9884\u89c8`);
  if (currentDocumentKey) {
    updateDocumentRecord(currentDocumentKey, { pageCount });
  }
}

function confirmDeletePage(pageId) {
  showConfirmDialog({
    title: t("confirmDeletePageTitle"),
    body: t("confirmDeletePageBody", { page: String(pageId) }),
    confirmLabel: t("confirmDelete"),
    onConfirm: () => deletePageById(pageId),
  });
}

async function deletePageById(pageId) {
  const pageKey = String(pageId);
  const page = pageStack.querySelector(`.doc-page[data-page-id="${CSS.escape(pageKey)}"]`);
  if (!page) return;

  annotations = annotations.filter((annotation) => String(annotation.pageId) !== pageKey);
  if (editingAnnotationId && !annotations.some((annotation) => annotation.id === editingAnnotationId)) {
    editingAnnotationId = null;
  }
  page.remove();
  saveAnnotations();
  await persistDeletedPage(pageKey);
  renderAnnotations();
  updateCurrentDocumentPageMeta();
  updateCurrentDocumentThumbnail();
  updateSurfaceBounds();
  if (!hasDocumentPages()) renderEmptyDocumentState();
}

async function addClipboardImageToBoard(file) {
  if (!hasDocumentPages()) {
    if (currentDocumentKey && documentCatalog.some((item) => item.key === currentDocumentKey && item.kind === "blank")) {
      hideStartupPanel();
      await appendImagePage(file, { persist: true });
      return;
    }

    await loadFile(file);
    return;
  }

  await appendImagePage(file, { persist: true });
}

function appendImagePage(file, options = {}) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = async () => {
      const pageId = options.pageId || getNextPageId();
      const canvas = drawImageAsPage(image, pageId);
      if (options.persist && canvas) await persistExtraImagePage(file, pageId);
      updateCurrentDocumentPageMeta(options.persist ? "\u5df2\u8ffd\u52a0\u56fe\u7247" : "");
      updateCurrentDocumentThumbnail();
      renderAnnotations();
      updateSurfaceBounds();
      if (options.focus !== false && canvas) focusPageInViewport(canvas.closest(".doc-page"));
      activateMobileAnnotationTool();
      renderDocumentList();
      resolve();
    };
    image.src = URL.createObjectURL(file);
  });
}

function focusPageInViewport(page) {
  if (!page) return;

  const viewport = canvasViewport.getBoundingClientRect();
  const pageCenterX = pageStack.offsetLeft + page.offsetLeft + page.offsetWidth / 2;
  const pageCenterY = pageStack.offsetTop + page.offsetTop + page.offsetHeight / 2;
  pan.x = viewport.width / 2 - pageCenterX * zoom;
  pan.y = viewport.height / 2 - pageCenterY * zoom;
  applyCanvasTransform();
}

async function renderPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    if (isPageDeleted(pageNumber)) continue;
    const pdfPage = await pdf.getPage(pageNumber);
    const viewport = pdfPage.getViewport({ scale: 1.6 });
    const { canvas } = createPage(pageNumber, viewport.width, viewport.height);
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pdfPage.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  }

  setFileMetaText(`${pdf.numPages} pages \u00b7 \u672c\u5730\u9884\u89c8`);
  renderAnnotations();
  resetCanvasView();
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

  renderDocumentList();
  const lastKey = localStorage.getItem(lastDocumentKey);
  if (lastKey && documentCatalog.some((item) => item.key === lastKey)) {
    const restored = await loadDocumentByKey(lastKey, { resetView: true }).catch(() => false);
    if (restored) return;
  }

  if (documentCatalog.length) {
    const restored = await loadDocumentByKey(documentCatalog[0].key, { force: true }).catch(() => false);
    if (restored) return;
  }

  await createNewBlankDocument();
}

function loadDocumentCatalog() {
  try {
    const catalog = JSON.parse(localStorage.getItem(documentCatalogStorageKey) || "[]");
    return Array.isArray(catalog) ? catalog.filter((item) => item?.key && item?.name) : [];
  } catch {
    return [];
  }
}

function saveDocumentCatalog() {
  try {
    localStorage.setItem(documentCatalogStorageKey, JSON.stringify(documentCatalog));
  } catch {}
}

function upsertDocumentRecord(record) {
  const nextRecord = {
    ...record,
    updatedAt: record.updatedAt || Date.now(),
  };
  const existingIndex = documentCatalog.findIndex((item) => item.key === nextRecord.key);
  if (existingIndex >= 0) {
    documentCatalog[existingIndex] = { ...documentCatalog[existingIndex], ...nextRecord };
  } else {
    documentCatalog.unshift(nextRecord);
  }
  documentCatalog.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  saveDocumentCatalog();
  renderDocumentList();
}

function updateDocumentRecord(key, updates) {
  const index = documentCatalog.findIndex((item) => item.key === key);
  if (index < 0) return;
  documentCatalog[index] = { ...documentCatalog[index], ...updates, updatedAt: Date.now() };
  documentCatalog.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  saveDocumentCatalog();
  renderDocumentList();
}

function renderDocumentList() {
  if (!documentList) return;

  if (!documentCatalog.length) {
    if (!documentList.querySelector(".file-empty")) {
      documentList.innerHTML = "";
      const empty = document.createElement("div");
      empty.className = "file-empty";
      empty.append(fileName, fileMeta);
      documentList.append(empty);
    }
    fileName.textContent = currentDocumentKey ? docTitle.textContent : "\u672a\u9009\u62e9\u6587\u4ef6";
    setFileMetaText(currentDocumentKey ? fileMeta.textContent : "PDF, PNG, JPG");
    return;
  }

  pruneSelectedDocumentKeys();
  documentList.innerHTML = "";
  documentCatalog.forEach((record) => {
    const button = document.createElement("div");
    button.className = "file-card";
    button.setAttribute("role", "button");
    button.setAttribute("tabindex", "0");
    button.dataset.documentKey = record.key;
    button.classList.toggle("active", record.key === currentDocumentKey);
    button.classList.toggle("selected", selectedDocumentKeys.has(record.key));
    button.setAttribute("aria-selected", selectedDocumentKeys.has(record.key) ? "true" : "false");
    button.addEventListener("click", (event) => handleDocumentCardClick(event, record.key));
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!selectedDocumentKeys.has(record.key)) {
        selectedDocumentKeys = new Set([record.key]);
        lastSelectedDocumentKey = record.key;
        renderDocumentList();
      }
      showDocumentContextMenu(event.clientX, event.clientY, Array.from(selectedDocumentKeys));
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === " ") {
        event.preventDefault();
        toggleDocumentSelection(record.key);
        return;
      }
      if (event.key !== "Enter") return;
      event.preventDefault();
      loadDocumentByKey(record.key);
    });

    const type = createDocumentThumbnail(record);

    const body = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = record.name;
    const meta = document.createElement("span");
    meta.textContent = getDocumentMetaText(record);
    body.append(title, meta);

    const deleteButton = document.createElement("span");
    deleteButton.className = "file-delete";
    deleteButton.setAttribute("role", "button");
    deleteButton.setAttribute("tabindex", "0");
    deleteButton.title = t("deleteAnnotation");
    deleteButton.setAttribute("aria-label", `${t("deleteAnnotation")} ${record.name}`);
    deleteButton.append(createIconPlaceholder("trash-2"));
    deleteButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (selectedDocumentKeys.has(record.key) && selectedDocumentKeys.size > 1) {
        confirmDeleteDocuments(Array.from(selectedDocumentKeys));
      } else {
        confirmDeleteDocument(record.key);
      }
    });
    deleteButton.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      if (selectedDocumentKeys.has(record.key) && selectedDocumentKeys.size > 1) {
        confirmDeleteDocuments(Array.from(selectedDocumentKeys));
      } else {
        confirmDeleteDocument(record.key);
      }
    });

    button.append(type, body, deleteButton);
    documentList.append(button);
  });
}

function getDocumentTypeLabel(record) {
  if (record.kind === "blank") return "NEW";
  if (record.type === "application/pdf") return "PDF";
  if (record.type?.startsWith("image/")) return "IMG";
  return "DOC";
}

function createDocumentThumbnail(record) {
  const thumb = document.createElement("span");
  thumb.className = `file-type ${record.type?.startsWith("image/") ? "image" : ""}`;
  if (record.thumbnail) {
    thumb.classList.add("has-thumbnail");
    const image = document.createElement("img");
    image.src = record.thumbnail;
    image.alt = record.name;
    thumb.addEventListener("pointerenter", (event) => queueCommentImagePreview(record.thumbnail, event.currentTarget));
    thumb.addEventListener("pointermove", (event) => positionCommentImagePreview(event.currentTarget));
    thumb.addEventListener("pointerleave", hideCommentImagePreview);
    thumb.addEventListener("focus", (event) => queueCommentImagePreview(record.thumbnail, event.currentTarget));
    thumb.addEventListener("blur", hideCommentImagePreview);
    thumb.append(image);
    return thumb;
  }

  thumb.textContent = getDocumentTypeLabel(record);
  return thumb;
}

function getDocumentMetaText(record) {
  if (record.kind === "blank") {
    return getBlankDocumentMetaText(record);
  }
  const createdText = formatDocumentCreatedAt(getDocumentCreatedAt(record));
  const size = Number(record.size || 0);
  const pages = Number(record.pageCount || 0);
  const parts = [
    createdText,
    pages ? `${pages} page${pages > 1 ? "s" : ""}` : "",
    size ? formatBytes(size) : "\u672c\u5730\u9884\u89c8",
  ].filter(Boolean);
  return parts.join(" \u00b7 ");
}

function getBlankDocumentMetaText(record = {}, pageCount = record.pageCount, extraText = "") {
  const count = Number(pageCount || 0);
  const createdText = formatDocumentCreatedAt(getDocumentCreatedAt(record));
  const parts = [
    createdText,
    `${count} page${count === 1 ? "" : "s"}`,
    extraText || t("blankMeta"),
  ].filter(Boolean);
  return parts.join(" \u00b7 ");
}

function getDocumentCreatedAt(record = {}) {
  const explicitTime = Number(record.createdAt || 0);
  if (explicitTime) return explicitTime;
  const [, keyTime] = String(record.key || "").split(":");
  const parsedTime = Number(keyTime || 0);
  return Number.isFinite(parsedTime) ? parsedTime : 0;
}

function formatDocumentCreatedAt(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString(currentLanguage === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function handleDocumentCardClick(event, key) {
  if (event.shiftKey) {
    selectDocumentRange(key);
    return;
  }

  if (event.ctrlKey || event.metaKey) {
    toggleDocumentSelection(key);
    return;
  }

  selectedDocumentKeys = new Set([key]);
  lastSelectedDocumentKey = key;
  renderDocumentList();
  loadDocumentByKey(key);
}

function toggleDocumentSelection(key) {
  if (selectedDocumentKeys.has(key)) {
    selectedDocumentKeys.delete(key);
  } else {
    selectedDocumentKeys.add(key);
  }
  lastSelectedDocumentKey = key;
  renderDocumentList();
}

function selectDocumentRange(key) {
  const currentIndex = documentCatalog.findIndex((item) => item.key === key);
  const anchorIndex = documentCatalog.findIndex((item) => item.key === lastSelectedDocumentKey);
  if (currentIndex < 0 || anchorIndex < 0) {
    selectedDocumentKeys = new Set([key]);
    lastSelectedDocumentKey = key;
    renderDocumentList();
    return;
  }

  const [start, end] = [Math.min(anchorIndex, currentIndex), Math.max(anchorIndex, currentIndex)];
  selectedDocumentKeys = new Set(documentCatalog.slice(start, end + 1).map((item) => item.key));
  renderDocumentList();
}

function pruneSelectedDocumentKeys() {
  if (!selectedDocumentKeys.size) return;
  const availableKeys = new Set(documentCatalog.map((item) => item.key));
  selectedDocumentKeys = new Set(Array.from(selectedDocumentKeys).filter((key) => availableKeys.has(key)));
  if (lastSelectedDocumentKey && !availableKeys.has(lastSelectedDocumentKey)) lastSelectedDocumentKey = null;
}

function normalizeDocumentSelection(documentKeys) {
  const keys = Array.isArray(documentKeys) ? documentKeys : [documentKeys];
  const availableKeys = new Set(documentCatalog.map((item) => item.key));
  return keys.filter((key) => key && availableKeys.has(key));
}

function renameDocumentByKey(key) {
  const record = documentCatalog.find((item) => item.key === key);
  if (!record) return;

  showRenameDialog({
    title: t("renameDocumentPrompt"),
    value: record.name,
    confirmLabel: t("renameDocument"),
    onConfirm: (nextName) => {
      if (!nextName || nextName === record.name) return;
      updateDocumentRecord(key, { name: nextName });
      if (key === currentDocumentKey) {
        docTitle.textContent = nextName;
        fileName.textContent = nextName;
        statusFileName.textContent = nextName;
      }
    },
  });
}

function confirmDeleteDocument(key) {
  confirmDeleteDocuments([key]);
}

function confirmDeleteDocuments(keys) {
  const documentKeys = normalizeDocumentSelection(keys);
  if (!documentKeys.length) return;
  const records = documentKeys.map((key) => documentCatalog.find((item) => item.key === key)).filter(Boolean);
  if (!records.length) return;
  const isSingle = records.length === 1;

  showConfirmDialog({
    title: isSingle ? t("confirmDeleteDocumentTitle") : t("confirmDeleteDocumentsTitle", { count: records.length }),
    body: isSingle ? t("confirmDeleteDocumentBody", { name: records[0].name }) : t("confirmDeleteDocumentsBody", { count: records.length }),
    confirmLabel: t("confirmDelete"),
    onConfirm: () => deleteDocumentsByKeys(documentKeys),
  });
}

async function deleteDocumentByKey(key) {
  await deleteDocumentsByKeys([key]);
}

async function deleteDocumentsByKeys(keys) {
  const documentKeys = normalizeDocumentSelection(keys);
  if (!documentKeys.length) return;
  const keySet = new Set(documentKeys);
  const wasCurrent = currentDocumentKey && keySet.has(currentDocumentKey);
  documentCatalog = documentCatalog.filter((item) => !keySet.has(item.key));
  selectedDocumentKeys = new Set();
  lastSelectedDocumentKey = null;
  saveDocumentCatalog();
  documentKeys.forEach((key) => {
    removeStoredDocument(key).catch(() => {});
    removeAnnotationSnapshot(key).catch(() => {});
  });
  try {
    documentKeys.forEach((key) => localStorage.removeItem(`${storagePrefix}${key}`));
    if (keySet.has(localStorage.getItem(lastDocumentKey))) localStorage.removeItem(lastDocumentKey);
  } catch {}

  if (!wasCurrent) {
    renderDocumentList();
    return;
  }

  const nextDocument = documentCatalog[0];
  if (nextDocument) {
    currentDocumentKey = null;
    await loadDocumentByKey(nextDocument.key, { force: true });
    return;
  }

  showStartupPage();
}

function showStartupPage() {
  currentDocumentKey = null;
  deletedPageIds = new Set();
  annotations = [];
  docTitle.textContent = t("appTitle");
  fileName.textContent = "\u672a\u9009\u62e9\u6587\u4ef6";
  setFileMetaText("PDF, PNG, JPG");
  statusFileName.textContent = "\u672a\u9009\u62e9\u6587\u4ef6";
  try {
    localStorage.removeItem(lastDocumentKey);
  } catch {}
  resetPages();
  renderStartupPanel();
  renderAnnotations();
  resetCanvasView();
  renderDocumentList();
}

function renderStartupPanel() {
  emptyState.classList.add("open");
}

function hideStartupPanel() {
  emptyState.classList.remove("open");
}

function renderEmptyDocumentState() {
  renderStartupPanel();
  renderAnnotations();
  resetCanvasView();
}

function isCurrentBlankDocumentEmpty() {
  if (!currentDocumentKey) return false;
  const record = documentCatalog.find((item) => item.key === currentDocumentKey);
  if (record?.kind !== "blank") return false;
  if (annotations.some(isPersistableAnnotation)) return false;
  if (deletedPageIds.size > 0) return false;
  const pages = pageStack.querySelectorAll(".doc-page");
  return pages.length === 0;
}

async function createNewBlankDocument() {
  if (creatingBlankDocument) return;

  if (isCurrentBlankDocumentEmpty()) {
    resetCanvasView();
    return;
  }

  creatingBlankDocument = true;
  newDocumentBtn.disabled = true;
  saveAnnotations();
  try {
    const timestamp = Date.now();
    const key = `board:${timestamp}`;
    const name = t("blankDocument");

    currentDocumentKey = key;
    deletedPageIds = new Set();
    annotations = [];
    try {
      localStorage.setItem(lastDocumentKey, currentDocumentKey);
    } catch {}
    await storeBlankDocumentRecord({ key, name, createdAt: timestamp });
    upsertDocumentRecord({ key, kind: "blank", name, pageCount: 0, createdAt: timestamp, updatedAt: timestamp });
    docTitle.textContent = name;
    fileName.textContent = name;
    statusFileName.textContent = name;
    setFileMetaText(getBlankDocumentMetaText({ key, createdAt: timestamp }, 0));
    resetPages();
    renderStartupPanel();
    renderAnnotations();
    updateCurrentDocumentThumbnail();
    resetCanvasView();
    activateMobileAnnotationTool();
  } finally {
    creatingBlankDocument = false;
    newDocumentBtn.disabled = false;
  }
}

async function loadDocumentByKey(key, options = {}) {
  if (!key) return false;
  if (key === currentDocumentKey && !options.force) return true;

  saveAnnotations();
  const record = documentCatalog.find((item) => item.key === key);
  if (!record) return false;

  if (record.kind === "blank") {
    currentDocumentKey = key;
    deletedPageIds = await readDeletedPageIds(currentDocumentKey);
    try {
      localStorage.setItem(lastDocumentKey, currentDocumentKey);
    } catch {}
    docTitle.textContent = record.name;
    fileName.textContent = record.name;
    statusFileName.textContent = record.name;
    const storedPageCount = Number(record.pageCount || 0);
    setFileMetaText(getBlankDocumentMetaText(record, storedPageCount));
    await restoreAnnotationsForCurrentDocument();
    resetPages();
    await appendStoredExtraPages(currentDocumentKey);
    updateCurrentDocumentPageMeta(t("blankMeta"));
    updateCurrentDocumentThumbnail();
    if (!hasDocumentPages()) renderEmptyDocumentState();
    renderAnnotations();
    resetCanvasView();
    activateMobileAnnotationTool();
    updateDocumentRecord(key, { updatedAt: Date.now() });
    return true;
  }

  const stored = await readDocumentFile(key).catch(() => null);
  const file = createRestoredDocumentFile(stored);
  if (!file) return false;
  await loadFile(file, { store: false });
  updateDocumentRecord(key, { name: record.name });
  docTitle.textContent = record.name;
  fileName.textContent = record.name;
  statusFileName.textContent = record.name;
  return true;
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
  const timestamp = Number(annotation.updatedAt || annotation.createdAt || Date.now());
  return {
    ...annotation,
    color: annotation.color || defaultAnnotationColor,
    createdAt: Number(annotation.createdAt || timestamp),
    updatedAt: timestamp,
    arrowAnchor: annotation.arrowAnchor || (Number.isFinite(annotation.arrowX) && Number.isFinite(annotation.arrowY) ? "top" : undefined),
    arrowWidth: annotation.arrowWidth || 0.75,
  };
}

function saveAnnotations() {
  if (!currentDocumentKey) return;

  const snapshot = annotations.filter((annotation) => !annotation.draft && isPersistableAnnotation(annotation));
  try {
    localStorage.setItem(lastDocumentKey, currentDocumentKey);
    localStorage.setItem(`${storagePrefix}${currentDocumentKey}`, JSON.stringify(snapshot));
  } catch {}
  storeAnnotationSnapshot(currentDocumentKey, snapshot).catch(() => {});
}

function isPersistableAnnotation(annotation) {
  return getAnnotationIntent(annotation) === "deleteContent" || annotation.text?.trim() || hasReferenceImages(annotation);
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
  const file = createRestoredDocumentFile(record);
  if (!file) return false;

  await loadFile(file);
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

async function storeDocumentFile(key, file) {
  const buffer = await file.arrayBuffer();
  return withFileStore("readwrite", (store) => {
    const existingRequest = store.get(key);
    existingRequest.onsuccess = () => {
      const existing = existingRequest.result || {};
      store.put({
        ...existing,
        key,
        kind: "file",
        buffer,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        savedAt: Date.now(),
      });
    };
    return existingRequest;
  });
}

async function storeBlankDocumentRecord(record) {
  return withFileStore("readwrite", (store) =>
    store.put({
      key: record.key,
      kind: "blank",
      name: record.name,
      createdAt: record.createdAt || Date.now(),
      type: "application/x-pointking-board",
      size: 0,
      pageCount: 0,
      extraPages: [],
      savedAt: Date.now(),
    }),
  );
}

async function persistExtraImagePage(file, pageId) {
  if (!currentDocumentKey) return;

  const buffer = await file.arrayBuffer();
  await withFileStore("readwrite", (store) => {
    const request = store.get(currentDocumentKey);
    request.onsuccess = () => {
      const existing = request.result || {
        key: currentDocumentKey,
        kind: "blank",
        name: docTitle.textContent || t("blankDocument"),
        type: "application/x-pointking-board",
        size: 0,
        extraPages: [],
      };
      const extraPages = Array.isArray(existing.extraPages) ? existing.extraPages : [];
      extraPages.push({
        pageId,
        buffer,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        savedAt: Date.now(),
      });
      store.put({
        ...existing,
        extraPages,
        pageCount: pageStack.querySelectorAll(".doc-page").length,
        savedAt: Date.now(),
      });
    };
    return request;
  });

  updateDocumentRecord(currentDocumentKey, {
    pageCount: pageStack.querySelectorAll(".doc-page").length,
  });
}

async function appendStoredExtraPages(documentKey) {
  const record = await readDocumentFile(documentKey).catch(() => null);
  const extraPages = Array.isArray(record?.extraPages) ? record.extraPages : [];
  for (const page of extraPages) {
    if (!page?.buffer) continue;
    const file = new File([page.buffer], page.name || "pasted-image.png", {
      type: page.type || "image/png",
      lastModified: page.lastModified || page.savedAt || Date.now(),
    });
    await appendImagePage(file, { persist: false, pageId: page.pageId, focus: false });
  }
}

function isPageDeleted(pageId) {
  return deletedPageIds.has(String(pageId));
}

async function readDeletedPageIds(documentKey) {
  const record = await readDocumentFile(documentKey).catch(() => null);
  return new Set((Array.isArray(record?.deletedPageIds) ? record.deletedPageIds : []).map(String));
}

async function persistDeletedPage(pageId) {
  if (!currentDocumentKey) return;

  deletedPageIds.add(String(pageId));
  await withFileStore("readwrite", (store) => {
    const request = store.get(currentDocumentKey);
    request.onsuccess = () => {
      const existing = request.result || {
        key: currentDocumentKey,
        kind: "blank",
        name: docTitle.textContent || t("blankDocument"),
        type: "application/x-pointking-board",
        size: 0,
      };
      store.put({
        ...existing,
        deletedPageIds: [...deletedPageIds],
        pageCount: pageStack.querySelectorAll(".doc-page").length,
        savedAt: Date.now(),
      });
    };
    return request;
  });
}

function readDocumentFile(key) {
  return withFileStore("readonly", (store) => store.get(key));
}

function removeStoredDocument(key) {
  return withFileStore("readwrite", (store) => store.delete(key));
}

function createRestoredDocumentFile(record) {
  if (!record) return null;

  if (record.buffer) {
    return new File([record.buffer], record.name || "document", {
      type: record.type || "application/octet-stream",
      lastModified: record.lastModified || record.savedAt || Date.now(),
    });
  }

  if (record.file) {
    return record.file;
  }

  return null;
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

function removeAnnotationSnapshot(documentKey) {
  return withFileStore("readwrite", (store) => store.delete(getAnnotationRecordKey(documentKey)));
}



