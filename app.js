/* global pdfjsLib, PDFLib */

const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const fontCssMap = {
  Helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  HelveticaBold: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  TimesRoman: '"Times New Roman", Times, serif',
  TimesBold: '"Times New Roman", Times, serif',
  Courier: '"Courier New", Courier, monospace',
  CourierBold: '"Courier New", Courier, monospace',
};

const fontPdfMap = {
  Helvetica: StandardFonts.Helvetica,
  HelveticaBold: StandardFonts.HelveticaBold,
  TimesRoman: StandardFonts.TimesRoman,
  TimesBold: StandardFonts.TimesBold,
  Courier: StandardFonts.Courier,
  CourierBold: StandardFonts.CourierBold,
};

const state = {
  pdfDoc: null,
  pdfBytes: null,
  pageCount: 0,
  currentPage: 1,
  previewScale: 1,
  previewWidth: 0,
  previewHeight: 0,
  ratiosReady: false,
  tool: "watermark",
  processing: false,
  type: "text",
  text: "CONFIDENTIAL",
  font: "Helvetica",
  fontSize: 42,
  fontSizeRatio: 0.08,
  color: "#6f6f6f",
  opacity: 0.2,
  rotation: -35,
  mode: "repeat",
  textAutoCenter: true,
  spacing: 318,
  spacingRatio: 0.3,
  patternOffset: { x: 0, y: 0 },
  patternOffsetRatio: { x: 0, y: 0 },
  imageBytes: null,
  imageDataUrl: null,
  imageWidth: 180,
  imageWidthRatio: 0.24,
  imageOpacity: 0.3,
  imageRotation: -15,
  imageAspect: 0.6,
  imageScope: "all",
  position: { x: 60, y: 60 },
  positionRatio: { x: 0.12, y: 0.12 },
  overlaySize: { w: 160, h: 60 },
  compressMode: "lossless",
  compressQuality: 0.75,
  compressScale: 1,
  splitMode: "all",
  splitStart: 1,
  splitEnd: 1,
  jpgQuality: 0.9,
  jpgScale: 1,
  jpgScope: "all",
  mergeFiles: [],
};

const els = {
  toolStatus: document.getElementById("toolStatus"),
  statusText: document.getElementById("statusText"),
  sourcePdfSection: document.getElementById("sourcePdfSection"),
  pdfInput: document.getElementById("pdfInput"),
  imageInput: document.getElementById("imageInput"),
  applyBtn: document.getElementById("applyBtn"),
  resetBtn: document.getElementById("resetBtn"),
  compressBtn: document.getElementById("compressBtn"),
  mergeBtn: document.getElementById("mergeBtn"),
  splitBtn: document.getElementById("splitBtn"),
  jpgBtn: document.getElementById("jpgBtn"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  pageIndicator: document.getElementById("pageIndicator"),
  previewWrap: document.getElementById("previewWrap"),
  pdfCanvas: document.getElementById("pdfCanvas"),
  patternCanvas: document.getElementById("patternCanvas"),
  watermarkOverlay: document.getElementById("watermarkOverlay"),
  wmTextOverlay: document.getElementById("wmTextOverlay"),
  wmImageOverlay: document.getElementById("wmImageOverlay"),
  emptyState: document.getElementById("emptyState"),
  emptyText: document.querySelector("#emptyState p"),
  wmText: document.getElementById("wmText"),
  wmFont: document.getElementById("wmFont"),
  wmColor: document.getElementById("wmColor"),
  wmSize: document.getElementById("wmSize"),
  wmSizeVal: document.getElementById("wmSizeVal"),
  wmOpacity: document.getElementById("wmOpacity"),
  wmOpacityVal: document.getElementById("wmOpacityVal"),
  wmRotation: document.getElementById("wmRotation"),
  wmRotationVal: document.getElementById("wmRotationVal"),
  wmMode: document.getElementById("wmMode"),
  wmSpacing: document.getElementById("wmSpacing"),
  wmSpacingVal: document.getElementById("wmSpacingVal"),
  spacingRow: document.getElementById("spacingRow"),
  textSingleHint: document.getElementById("textSingleHint"),
  imgWidth: document.getElementById("imgWidth"),
  imgWidthVal: document.getElementById("imgWidthVal"),
  imgOpacity: document.getElementById("imgOpacity"),
  imgOpacityVal: document.getElementById("imgOpacityVal"),
  imgRotation: document.getElementById("imgRotation"),
  imgRotationVal: document.getElementById("imgRotationVal"),
  imgScope: document.getElementById("imgScope"),
  compressMode: document.getElementById("compressMode"),
  compressQuality: document.getElementById("compressQuality"),
  compressQualityVal: document.getElementById("compressQualityVal"),
  compressScale: document.getElementById("compressScale"),
  compressScaleVal: document.getElementById("compressScaleVal"),
  compressQualityRow: document.getElementById("compressQualityRow"),
  compressScaleRow: document.getElementById("compressScaleRow"),
  mergeInput: document.getElementById("mergeInput"),
  mergeList: document.getElementById("mergeList"),
  splitMode: document.getElementById("splitMode"),
  splitStart: document.getElementById("splitStart"),
  splitEnd: document.getElementById("splitEnd"),
  splitRangeRow: document.getElementById("splitRangeRow"),
  jpgQuality: document.getElementById("jpgQuality"),
  jpgQualityVal: document.getElementById("jpgQualityVal"),
  jpgScale: document.getElementById("jpgScale"),
  jpgScaleVal: document.getElementById("jpgScaleVal"),
  jpgScope: document.getElementById("jpgScope"),
  watermarkTool: document.getElementById("watermarkTool"),
  compressTool: document.getElementById("compressTool"),
  mergeTool: document.getElementById("mergeTool"),
  splitTool: document.getElementById("splitTool"),
  jpgTool: document.getElementById("jpgTool"),
  textControls: document.getElementById("textControls"),
  imageControls: document.getElementById("imageControls"),
};

const segButtons = Array.from(document.querySelectorAll(".seg-btn"));
const toolButtons = Array.from(document.querySelectorAll(".tool-btn"));

const renderState = { busy: false };
let dragState = null;
let patternDrag = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isBoldFont(fontKey) {
  return /Bold$/.test(fontKey);
}

function getFontWeight(fontKey) {
  return isBoldFont(fontKey) ? "700" : "400";
}

function getCanvasFont(fontKey, size) {
  return `${getFontWeight(fontKey)} ${size}px ${fontCssMap[fontKey]}`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

function setEmptyState(show) {
  els.emptyState.classList.toggle("hidden", !show);
}

function setStatus(message) {
  if (!message) {
    els.toolStatus.classList.add("hidden");
    els.statusText.textContent = "";
    return;
  }
  els.statusText.textContent = message;
  els.toolStatus.classList.remove("hidden");
}

function setProcessing(active) {
  state.processing = active;
  updateButtons();
}

function updateEmptyStateText() {
  if (!els.emptyText) return;
  if (state.tool === "merge") {
    els.emptyText.textContent = "Preview tidak tersedia untuk merge.";
  } else {
    els.emptyText.textContent = "Upload PDF untuk mulai.";
  }
}

function setPreviewEnabled(enabled) {
  els.pdfCanvas.classList.toggle("hidden", !enabled);
  els.patternCanvas.classList.toggle("hidden", !enabled);
  els.watermarkOverlay.classList.toggle("hidden", !enabled);
  if (!enabled) {
    setEmptyState(true);
  }
}

function updateButtons() {
  const hasPdf = Boolean(state.pdfBytes);
  const hasImage = Boolean(state.imageBytes);
  const canWatermark = hasPdf && (state.type !== "image" || hasImage);
  els.applyBtn.disabled =
    state.tool !== "watermark" || !canWatermark || state.processing;
  els.resetBtn.disabled = state.tool !== "watermark" || !hasPdf || state.processing;
  els.compressBtn.disabled = state.tool !== "compress" || !hasPdf || state.processing;
  els.splitBtn.disabled = state.tool !== "split" || !hasPdf || state.processing;
  els.jpgBtn.disabled = state.tool !== "jpg" || !hasPdf || state.processing;
  els.mergeBtn.disabled =
    state.tool !== "merge" || state.mergeFiles.length < 2 || state.processing;
}

function updateSegmented(type) {
  segButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });
}

function updateToolButtons(tool) {
  toolButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === tool);
  });
}

function setTool(tool) {
  state.tool = tool;
  updateToolButtons(tool);
  els.sourcePdfSection.classList.toggle("hidden", tool === "merge");
  els.watermarkTool.classList.toggle("hidden", tool !== "watermark");
  els.compressTool.classList.toggle("hidden", tool !== "compress");
  els.mergeTool.classList.toggle("hidden", tool !== "merge");
  els.splitTool.classList.toggle("hidden", tool !== "split");
  els.jpgTool.classList.toggle("hidden", tool !== "jpg");
  setStatus("");
  updateEmptyStateText();
  setPreviewEnabled(tool !== "merge");
  refreshOverlays();
  updateButtons();
  updatePageIndicator();
}

function syncControlsFromState() {
  els.wmText.value = state.text;
  els.wmFont.value = state.font;
  els.wmColor.value = state.color;
  els.wmSize.value = Math.round(state.fontSize);
  els.wmSizeVal.textContent = `${Math.round(state.fontSize)}px`;
  els.wmOpacity.value = Math.round(state.opacity * 100);
  els.wmOpacityVal.textContent = `${Math.round(state.opacity * 100)}%`;
  els.wmRotation.value = Math.round(state.rotation);
  els.wmRotationVal.textContent = `${Math.round(state.rotation)}deg`;
  els.wmMode.value = state.mode;
  els.wmSpacing.value = Math.round(state.spacing);
  els.wmSpacingVal.textContent = `${Math.round(state.spacing)}px`;
  els.imgWidth.value = Math.round(state.imageWidth);
  els.imgWidthVal.textContent = `${Math.round(state.imageWidth)}px`;
  els.imgOpacity.value = Math.round(state.imageOpacity * 100);
  els.imgOpacityVal.textContent = `${Math.round(state.imageOpacity * 100)}%`;
  els.imgRotation.value = Math.round(state.imageRotation);
  els.imgRotationVal.textContent = `${Math.round(state.imageRotation)}deg`;
  els.imgScope.value = state.imageScope;
  els.compressMode.value = state.compressMode;
  els.compressQuality.value = Math.round(state.compressQuality * 100);
  els.compressQualityVal.textContent = `${Math.round(state.compressQuality * 100)}%`;
  els.compressScale.value = state.compressScale.toFixed(1);
  els.compressScaleVal.textContent = `${state.compressScale.toFixed(1)}x`;
  els.splitMode.value = state.splitMode;
  els.splitStart.value = state.splitStart;
  els.splitEnd.value = state.splitEnd;
  els.jpgQuality.value = Math.round(state.jpgQuality * 100);
  els.jpgQualityVal.textContent = `${Math.round(state.jpgQuality * 100)}%`;
  els.jpgScale.value = state.jpgScale.toFixed(1);
  els.jpgScaleVal.textContent = `${state.jpgScale.toFixed(1)}x`;
  els.jpgScope.value = state.jpgScope;
  const isRaster = state.compressMode === "rasterize";
  els.compressQualityRow.classList.toggle("hidden", !isRaster);
  els.compressScaleRow.classList.toggle("hidden", !isRaster);
  els.splitRangeRow.classList.toggle("hidden", state.splitMode !== "range");
}

function updateRangeLimits() {
  if (!state.previewWidth) return;
  els.wmSize.max = Math.max(80, Math.round(state.previewWidth * 0.3));
  const maxImg = Math.max(220, Math.round(state.previewWidth * 1.2));
  els.imgWidth.max = maxImg;
  if (state.imageWidth > maxImg) {
    state.imageWidth = maxImg;
    state.imageWidthRatio = state.imageWidth / state.previewWidth;
  }
  els.wmSpacing.max = Math.max(260, Math.round(state.previewWidth * 0.8));
}

function updateSplitRangeMax() {
  if (!state.pageCount) return;
  els.splitStart.max = state.pageCount;
  els.splitEnd.max = state.pageCount;
  if (state.splitStart < 1) state.splitStart = 1;
  if (state.splitEnd < state.splitStart) state.splitEnd = state.splitStart;
  if (state.splitEnd > state.pageCount) state.splitEnd = state.pageCount;
  els.splitStart.value = state.splitStart;
  els.splitEnd.value = state.splitEnd;
}

function updateRatios() {
  if (!state.previewWidth) return;
  state.fontSizeRatio = state.fontSize / state.previewWidth;
  state.imageWidthRatio = state.imageWidth / state.previewWidth;
  state.spacingRatio = state.spacing / state.previewWidth;
  state.positionRatio = {
    x: state.position.x / state.previewWidth,
    y: state.position.y / state.previewHeight,
  };
  state.patternOffsetRatio = {
    x: state.patternOffset.x / state.previewWidth,
    y: state.patternOffset.y / state.previewHeight,
  };
}

function applyRatiosToPreview() {
  if (!state.previewWidth) return;
  state.fontSize = state.fontSizeRatio * state.previewWidth;
  state.imageWidth = state.imageWidthRatio * state.previewWidth;
  state.spacing = state.spacingRatio * state.previewWidth;
  state.position.x = state.positionRatio.x * state.previewWidth;
  state.position.y = state.positionRatio.y * state.previewHeight;
  state.patternOffset.x = state.patternOffsetRatio.x * state.previewWidth;
  state.patternOffset.y = state.patternOffsetRatio.y * state.previewHeight;
}

function setOverlaySize(width, height) {
  state.overlaySize = { w: width, h: height };
  els.watermarkOverlay.style.width = `${width}px`;
  els.watermarkOverlay.style.height = `${height}px`;
  setPosition(state.position.x, state.position.y);
}

function setPosition(x, y) {
  if (!state.previewWidth) return;
  const maxX = Math.max(0, state.previewWidth - state.overlaySize.w);
  const maxY = Math.max(0, state.previewHeight - state.overlaySize.h);
  state.position.x = clamp(x, 0, maxX);
  state.position.y = clamp(y, 0, maxY);
  els.watermarkOverlay.style.left = `${state.position.x}px`;
  els.watermarkOverlay.style.top = `${state.position.y}px`;
  updateRatios();
}

function centerTextOverlay() {
  if (!state.previewWidth) return;
  const x = (state.previewWidth - state.overlaySize.w) / 2;
  const y = (state.previewHeight - state.overlaySize.h) / 2;
  setPosition(x, y);
}

function updateTextOverlay() {
  els.wmTextOverlay.textContent = state.text || " ";
  els.wmTextOverlay.style.fontFamily = fontCssMap[state.font] || fontCssMap.Helvetica;
  els.wmTextOverlay.style.fontWeight = getFontWeight(state.font);
  els.wmTextOverlay.style.fontSize = `${state.fontSize}px`;
  els.wmTextOverlay.style.color = state.color;
  els.wmTextOverlay.style.opacity = state.opacity;
  els.wmTextOverlay.style.transform = `rotate(${state.rotation}deg)`;

  requestAnimationFrame(() => {
    const width = els.wmTextOverlay.scrollWidth || 10;
    const height = els.wmTextOverlay.scrollHeight || 10;
    setOverlaySize(width, height);
    if (state.type === "text" && state.mode === "single" && state.textAutoCenter) {
      centerTextOverlay();
    }
  });
}

function updateImageOverlay() {
  if (!state.imageDataUrl) return;
  const width = state.imageWidth;
  const height = width * state.imageAspect;
  els.wmImageOverlay.src = state.imageDataUrl;
  els.wmImageOverlay.style.width = `${width}px`;
  els.wmImageOverlay.style.height = `${height}px`;
  els.wmImageOverlay.style.opacity = state.imageOpacity;
  els.wmImageOverlay.style.transform = `rotate(${state.imageRotation}deg)`;
  setOverlaySize(width, height);
}

function showOverlay() {
  els.watermarkOverlay.classList.remove("hidden");
}

function hideOverlay() {
  els.watermarkOverlay.classList.add("hidden");
}

function showPattern() {
  els.patternCanvas.classList.remove("hidden");
}

function hidePattern() {
  els.patternCanvas.classList.add("hidden");
}

function updateModeVisibility() {
  if (state.type === "text" && state.mode === "repeat") {
    hideOverlay();
    showPattern();
    els.spacingRow.classList.remove("hidden");
    els.textSingleHint.classList.add("hidden");
  } else if (state.type === "text") {
    showOverlay();
    hidePattern();
    els.spacingRow.classList.add("hidden");
    els.textSingleHint.classList.remove("hidden");
  } else {
    showOverlay();
    hidePattern();
    els.spacingRow.classList.add("hidden");
    els.textSingleHint.classList.add("hidden");
  }
  const canDragText = state.type === "text" && state.mode === "single";
  const canDragImage = state.type === "image";
  els.watermarkOverlay.style.cursor = canDragText || canDragImage ? "grab" : "default";
  els.patternCanvas.style.cursor =
    state.type === "text" && state.mode === "repeat" ? "move" : "default";
}

function refreshOverlays() {
  if (!state.pdfBytes || state.tool !== "watermark") {
    hideOverlay();
    hidePattern();
    return;
  }
  updateModeVisibility();

  if (state.type === "text") {
    els.wmTextOverlay.classList.remove("hidden");
    els.wmImageOverlay.classList.add("hidden");
    if (state.mode === "repeat") {
      drawPattern();
    } else {
      updateTextOverlay();
    }
  } else {
    els.wmTextOverlay.classList.add("hidden");
    els.wmImageOverlay.classList.remove("hidden");
    if (!state.imageDataUrl) {
      hideOverlay();
      return;
    }
    updateImageOverlay();
  }
}

function drawPattern() {
  if (state.type !== "text" || state.mode !== "repeat") return;
  if (!state.previewWidth) return;
  const canvas = els.patternCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const text = state.text || " ";
  const lines = text.split(/\r?\n/);
  const lineHeight = state.fontSize * 1.2;
  ctx.font = getCanvasFont(state.font, state.fontSize);
  const textWidths = lines.map((line) => ctx.measureText(line).width);
  const blockWidth = Math.max(...textWidths, 10);
  const blockHeight = lineHeight * lines.length;

  const baseX = (canvas.width - blockWidth) / 2 + state.patternOffset.x;
  const baseY = (canvas.height - blockHeight) / 2 + state.patternOffset.y;

  ctx.save();
  ctx.translate(baseX, baseY + blockHeight);
  ctx.rotate((state.rotation * Math.PI) / 180);
  ctx.translate(0, -blockHeight);
  ctx.globalAlpha = state.opacity;
  ctx.fillStyle = state.color;
  ctx.textBaseline = "top";

  const step = state.spacing;
  const maxX = canvas.width * 2;
  const maxY = canvas.height * 2;
  const startX = -Math.ceil(maxX / step) * step;
  const startY = -Math.ceil(maxY / step) * step;

  for (let x = startX; x <= maxX; x += step) {
    for (let y = startY; y <= maxY; y += step) {
      lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * lineHeight);
      });
    }
  }

  ctx.restore();
}

async function renderPage() {
  if (!state.pdfDoc || renderState.busy) return;
  renderState.busy = true;
  const page = await state.pdfDoc.getPage(state.currentPage);
  const baseViewport = page.getViewport({ scale: 1 });
  const containerWidth = els.previewWrap.clientWidth || baseViewport.width;
  const scale = clamp(containerWidth / baseViewport.width, 0.65, 1.6);
  const viewport = page.getViewport({ scale });

  const canvas = els.pdfCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  els.previewWrap.style.width = `${canvas.width}px`;
  els.previewWrap.style.height = `${canvas.height}px`;
  els.patternCanvas.width = canvas.width;
  els.patternCanvas.height = canvas.height;

  if (!state.ratiosReady) {
    state.fontSizeRatio = state.fontSize / canvas.width;
    state.imageWidthRatio = state.imageWidth / canvas.width;
    state.spacingRatio = state.spacing / canvas.width;
    state.positionRatio = { x: 0.12, y: 0.12 };
    state.patternOffsetRatio = { x: 0, y: 0 };
    state.textAutoCenter = true;
    state.ratiosReady = true;
  }

  state.previewWidth = canvas.width;
  state.previewHeight = canvas.height;
  applyRatiosToPreview();
  updateRangeLimits();
  syncControlsFromState();

  const renderTask = page.render({ canvasContext: ctx, viewport });
  await renderTask.promise;

  renderState.busy = false;
  updatePageIndicator();
  refreshOverlays();
}

function updatePageIndicator() {
  if (!state.pdfDoc || state.tool === "merge") {
    els.pageIndicator.textContent = "Page 0 / 0";
    els.prevPage.disabled = true;
    els.nextPage.disabled = true;
    return;
  }
  els.pageIndicator.textContent = `Page ${state.currentPage} / ${state.pageCount}`;
  els.prevPage.disabled = state.currentPage <= 1;
  els.nextPage.disabled = state.currentPage >= state.pageCount;
}

async function loadPdf(file) {
  const buffer = await file.arrayBuffer();
  state.pdfBytes = buffer.slice(0);
  state.ratiosReady = false;
  const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
  state.pdfDoc = await loadingTask.promise;
  state.pageCount = state.pdfDoc.numPages;
  state.currentPage = 1;
  state.splitStart = 1;
  state.splitEnd = state.pageCount;
  setEmptyState(false);
  updateButtons();
  updateSplitRangeMax();
  await renderPage();
}

function setType(type) {
  state.type = type;
  updateSegmented(type);
  if (type === "text") {
    state.textAutoCenter = true;
    els.textControls.classList.remove("hidden");
    els.imageControls.classList.add("hidden");
  } else {
    els.textControls.classList.add("hidden");
    els.imageControls.classList.remove("hidden");
  }
  updateButtons();
  refreshOverlays();
}

function setMode(mode) {
  state.mode = mode;
  if (state.type === "text" && mode === "single") {
    state.textAutoCenter = true;
  }
  refreshOverlays();
}

function resetPosition() {
  if (state.type === "text") {
    state.textAutoCenter = true;
    state.patternOffset = { x: 0, y: 0 };
    state.patternOffsetRatio = { x: 0, y: 0 };
    refreshOverlays();
    return;
  }
  state.positionRatio = { x: 0.12, y: 0.12 };
  state.patternOffsetRatio = { x: 0, y: 0 };
  applyRatiosToPreview();
  refreshOverlays();
}

function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function renderPageToCanvas(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const renderTask = page.render({ canvasContext: ctx, viewport });
  await renderTask.promise;
  return canvas;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function canvasToJpegBytes(canvas, quality) {
  const blob = await canvasToBlob(canvas, "image/jpeg", quality);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

function drawTextBlock(page, text, previewTop, previewPivot, options) {
  const lines = text.split(/\r?\n/);
  const lineHeight = options.size * 1.2;
  const { width, height } = page.getSize();
  const pivotX = previewPivot.x * options.scaleX;
  const pivotY = height - previewPivot.y * options.scaleY;
  const rotation = options.angle ?? 0;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  lines.forEach((line, index) => {
    const lineWidth = options.font.widthOfTextAtSize(line, options.size);
    const alignOffset =
      options.align === "center" ? (options.blockWidth - lineWidth) / 2 : 0;
    const baseX = previewTop.x * options.scaleX + alignOffset;
    const baseY = height - (previewTop.y * options.scaleY + lineHeight * (index + 1));
    const dx = baseX - pivotX;
    const dy = baseY - pivotY;
    const drawX = pivotX + dx * cos - dy * sin;
    const drawY = pivotY + dx * sin + dy * cos;

    page.drawText(line, {
      x: drawX,
      y: drawY,
      size: options.size,
      font: options.font,
      color: options.color,
      opacity: options.opacity,
      rotate: degrees(rotation),
    });
  });
}

async function exportPdf() {
  if (!state.pdfBytes) return;
  const pdfDoc = await PDFDocument.load(state.pdfBytes);
  const pages = pdfDoc.getPages();

  let font = null;
  if (state.type === "text") {
    const fontKey = fontPdfMap[state.font] || StandardFonts.Helvetica;
    font = await pdfDoc.embedFont(fontKey);
  }

  let embeddedImage = null;
  if (state.type === "image") {
    if (!state.imageBytes) return;
    const header = new Uint8Array(state.imageBytes).slice(0, 4);
    const isPng = header[0] === 0x89 && header[1] === 0x50;
    embeddedImage = isPng
      ? await pdfDoc.embedPng(state.imageBytes)
      : await pdfDoc.embedJpg(state.imageBytes);
  }

  for (const [index, page] of pages.entries()) {
    const { width, height } = page.getSize();

    if (state.type === "text") {
      const previewWidth = state.previewWidth || width;
      const previewHeight = state.previewHeight || height;
      const scaleX = width / previewWidth;
      const scaleY = height / previewHeight;
      const fontSize = state.fontSizeRatio * width;
      const color = hexToRgb(state.color);
      const lines = state.text.split(/\r?\n/);
      const lineHeightPreview = state.fontSize * 1.2;
      const blockHeightPreview = lineHeightPreview * lines.length;
      const textWidths = lines.map((line) => font.widthOfTextAtSize(line, fontSize));
      const blockWidth = Math.max(...textWidths, 0);
      const blockWidthPreview = blockWidth / scaleX;
      const angle = -state.rotation;

      if (state.mode === "repeat") {
        const spacing = state.previewWidth ? state.spacing : state.spacingRatio * previewWidth;
        const offsetX = state.previewWidth
          ? state.patternOffset.x
          : state.patternOffsetRatio.x * previewWidth;
        const offsetY = state.previewHeight
          ? state.patternOffset.y
          : state.patternOffsetRatio.y * previewHeight;
        const baseX = (previewWidth - blockWidthPreview) / 2 + offsetX;
        const baseY = (previewHeight - blockHeightPreview) / 2 + offsetY;
        const pivot = { x: baseX, y: baseY + blockHeightPreview };
        const maxX = previewWidth * 2;
        const maxY = previewHeight * 2;
        const startX = -Math.ceil(maxX / spacing) * spacing;
        const startY = -Math.ceil(maxY / spacing) * spacing;

        for (let x = startX; x <= maxX; x += spacing) {
          for (let y = startY; y <= maxY; y += spacing) {
            const top = { x: baseX + x, y: baseY + y };
            drawTextBlock(page, state.text, top, pivot, {
              size: fontSize,
              font,
              color: rgb(color.r, color.g, color.b),
              opacity: state.opacity,
              angle,
              align: "center",
              blockWidth,
              scaleX,
              scaleY,
            });
          }
        }
      } else {
        const topX = state.previewWidth
          ? state.position.x
          : state.positionRatio.x * previewWidth;
        const topY = state.previewHeight
          ? state.position.y
          : state.positionRatio.y * previewHeight;
        const top = { x: topX, y: topY };
        const pivot = { x: topX, y: topY + blockHeightPreview };
        drawTextBlock(page, state.text, top, pivot, {
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
          opacity: state.opacity,
          angle,
          align: "center",
          blockWidth,
          scaleX,
          scaleY,
        });
      }
    } else if (embeddedImage) {
      if (state.imageScope === "first" && index > 0) {
        continue;
      }
      const drawWidth = state.imageWidthRatio * width;
      const drawHeight = drawWidth * state.imageAspect;
      const xTop = state.positionRatio.x * width;
      const yTop = state.positionRatio.y * height;
      const y = height - yTop - drawHeight;
      page.drawImage(embeddedImage, {
        x: xTop,
        y,
        width: drawWidth,
        height: drawHeight,
        opacity: state.imageOpacity,
        rotate: degrees(state.imageRotation),
      });
    }
  }

  const outBytes = await pdfDoc.save();
  const filename = `watermarked-${Date.now()}.pdf`;
  downloadBytes(outBytes, filename);
}

async function compressPdf() {
  if (!state.pdfBytes) return;
  try {
    setProcessing(true);
    setStatus("Mengompres PDF...");
    if (state.compressMode === "lossless") {
      const pdfDoc = await PDFDocument.load(state.pdfBytes);
      const outBytes = await pdfDoc.save({ useObjectStreams: true });
      downloadBytes(outBytes, `compressed-${Date.now()}.pdf`);
      return;
    }

    const sourceDoc = state.pdfDoc
      ? state.pdfDoc
      : await pdfjsLib.getDocument({ data: state.pdfBytes.slice(0) }).promise;
    const outDoc = await PDFDocument.create();
    for (let i = 1; i <= sourceDoc.numPages; i += 1) {
      setStatus(`Mengompres halaman ${i} / ${sourceDoc.numPages}...`);
      const page = await sourceDoc.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });
      const canvas = await renderPageToCanvas(page, state.compressScale);
      const imgBytes = await canvasToJpegBytes(canvas, state.compressQuality);
      const embedded = await outDoc.embedJpg(imgBytes);
      const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
      outPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });
    }
    const outBytes = await outDoc.save({ useObjectStreams: true });
    downloadBytes(outBytes, `compressed-${Date.now()}.pdf`);
  } finally {
    setProcessing(false);
    setStatus("");
  }
}

function renderMergeList() {
  els.mergeList.innerHTML = "";
  state.mergeFiles.forEach((file, index) => {
    const row = document.createElement("div");
    row.className = "file-row";

    const name = document.createElement("span");
    name.className = "file-name";
    name.textContent = file.name;

    const actions = document.createElement("div");
    actions.className = "file-actions";

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "mini";
    upBtn.textContent = "Up";
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", () => {
      const temp = state.mergeFiles[index - 1];
      state.mergeFiles[index - 1] = state.mergeFiles[index];
      state.mergeFiles[index] = temp;
      renderMergeList();
      updateButtons();
    });

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "mini";
    downBtn.textContent = "Down";
    downBtn.disabled = index === state.mergeFiles.length - 1;
    downBtn.addEventListener("click", () => {
      const temp = state.mergeFiles[index + 1];
      state.mergeFiles[index + 1] = state.mergeFiles[index];
      state.mergeFiles[index] = temp;
      renderMergeList();
      updateButtons();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "mini";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      state.mergeFiles.splice(index, 1);
      renderMergeList();
      updateButtons();
    });

    actions.append(upBtn, downBtn, removeBtn);
    row.append(name, actions);
    els.mergeList.append(row);
  });
}

async function mergePdfs() {
  if (state.mergeFiles.length < 2) return;
  try {
    setProcessing(true);
    setStatus("Menggabungkan PDF...");
    const outDoc = await PDFDocument.create();
    for (const file of state.mergeFiles) {
      setStatus(`Memproses ${file.name}...`);
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const copied = await outDoc.copyPages(doc, doc.getPageIndices());
      copied.forEach((page) => outDoc.addPage(page));
    }
    const outBytes = await outDoc.save({ useObjectStreams: true });
    downloadBytes(outBytes, `merged-${Date.now()}.pdf`);
  } finally {
    setProcessing(false);
    setStatus("");
  }
}

async function splitPdf() {
  if (!state.pdfBytes) return;
  try {
    setProcessing(true);
    const sourceDoc = await PDFDocument.load(state.pdfBytes);
    const totalPages = sourceDoc.getPageCount();

    if (state.splitMode === "range") {
      const start = clamp(state.splitStart, 1, totalPages);
      const end = clamp(state.splitEnd, start, totalPages);
      setStatus(`Membuat PDF halaman ${start}-${end}...`);
      const outDoc = await PDFDocument.create();
      const pages = await outDoc.copyPages(
        sourceDoc,
        Array.from({ length: end - start + 1 }, (_, i) => i + start - 1),
      );
      pages.forEach((page) => outDoc.addPage(page));
      const outBytes = await outDoc.save({ useObjectStreams: true });
      downloadBytes(outBytes, `split-${start}-${end}.pdf`);
      return;
    }

    for (let i = 0; i < totalPages; i += 1) {
      setStatus(`Menyimpan halaman ${i + 1} / ${totalPages}...`);
      const outDoc = await PDFDocument.create();
      const [page] = await outDoc.copyPages(sourceDoc, [i]);
      outDoc.addPage(page);
      const outBytes = await outDoc.save({ useObjectStreams: true });
      downloadBytes(outBytes, `page-${i + 1}.pdf`);
    }
  } finally {
    setProcessing(false);
    setStatus("");
  }
}

async function exportJpg() {
  if (!state.pdfBytes) return;
  try {
    setProcessing(true);
    const sourceDoc = state.pdfDoc
      ? state.pdfDoc
      : await pdfjsLib.getDocument({ data: state.pdfBytes.slice(0) }).promise;
    const pages =
      state.jpgScope === "current"
        ? [state.currentPage]
        : Array.from({ length: sourceDoc.numPages }, (_, i) => i + 1);

    for (const pageNumber of pages) {
      setStatus(`Export JPG halaman ${pageNumber} / ${sourceDoc.numPages}...`);
      const page = await sourceDoc.getPage(pageNumber);
      const canvas = await renderPageToCanvas(page, state.jpgScale);
      const blob = await canvasToBlob(canvas, "image/jpeg", state.jpgQuality);
      downloadBlob(blob, `page-${pageNumber}.jpg`);
    }
  } finally {
    setProcessing(false);
    setStatus("");
  }
}

els.pdfInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  await loadPdf(file);
});

els.mergeInput.addEventListener("change", (event) => {
  state.mergeFiles = Array.from(event.target.files || []);
  renderMergeList();
  updateButtons();
});

els.imageInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state.imageBytes = await file.arrayBuffer();
  const reader = new FileReader();
  reader.onload = () => {
    state.imageDataUrl = reader.result;
    const img = new Image();
    img.onload = () => {
      state.imageAspect = img.height / img.width;
      refreshOverlays();
      updateButtons();
    };
    img.src = state.imageDataUrl;
  };
  reader.readAsDataURL(file);
});

els.applyBtn.addEventListener("click", exportPdf);
els.resetBtn.addEventListener("click", resetPosition);
els.compressBtn.addEventListener("click", compressPdf);
els.mergeBtn.addEventListener("click", mergePdfs);
els.splitBtn.addEventListener("click", splitPdf);
els.jpgBtn.addEventListener("click", exportJpg);

els.prevPage.addEventListener("click", async () => {
  if (state.currentPage <= 1) return;
  state.currentPage -= 1;
  await renderPage();
});

els.nextPage.addEventListener("click", async () => {
  if (state.currentPage >= state.pageCount) return;
  state.currentPage += 1;
  await renderPage();
});

els.wmText.addEventListener("input", (event) => {
  state.text = event.target.value || " ";
  refreshOverlays();
});

els.wmFont.addEventListener("change", (event) => {
  state.font = event.target.value;
  refreshOverlays();
});

els.wmColor.addEventListener("input", (event) => {
  state.color = event.target.value;
  refreshOverlays();
});

els.wmSize.addEventListener("input", (event) => {
  state.fontSize = Number(event.target.value);
  if (state.previewWidth) {
    state.fontSizeRatio = state.fontSize / state.previewWidth;
  }
  els.wmSizeVal.textContent = `${Math.round(state.fontSize)}px`;
  refreshOverlays();
});

els.wmOpacity.addEventListener("input", (event) => {
  state.opacity = Number(event.target.value) / 100;
  els.wmOpacityVal.textContent = `${Math.round(state.opacity * 100)}%`;
  refreshOverlays();
});

els.wmRotation.addEventListener("input", (event) => {
  state.rotation = Number(event.target.value);
  els.wmRotationVal.textContent = `${Math.round(state.rotation)}deg`;
  refreshOverlays();
});

els.wmMode.addEventListener("change", (event) => {
  setMode(event.target.value);
});

els.wmSpacing.addEventListener("input", (event) => {
  state.spacing = Number(event.target.value);
  if (state.previewWidth) {
    state.spacingRatio = state.spacing / state.previewWidth;
  }
  els.wmSpacingVal.textContent = `${Math.round(state.spacing)}px`;
  drawPattern();
});

els.imgWidth.addEventListener("input", (event) => {
  state.imageWidth = Number(event.target.value);
  if (state.previewWidth) {
    state.imageWidthRatio = state.imageWidth / state.previewWidth;
  }
  els.imgWidthVal.textContent = `${Math.round(state.imageWidth)}px`;
  refreshOverlays();
});

els.imgOpacity.addEventListener("input", (event) => {
  state.imageOpacity = Number(event.target.value) / 100;
  els.imgOpacityVal.textContent = `${Math.round(state.imageOpacity * 100)}%`;
  refreshOverlays();
});

els.imgRotation.addEventListener("input", (event) => {
  state.imageRotation = Number(event.target.value);
  els.imgRotationVal.textContent = `${Math.round(state.imageRotation)}deg`;
  refreshOverlays();
});

els.imgScope.addEventListener("change", (event) => {
  state.imageScope = event.target.value;
});

els.compressMode.addEventListener("change", (event) => {
  state.compressMode = event.target.value;
  const isRaster = state.compressMode === "rasterize";
  els.compressQualityRow.classList.toggle("hidden", !isRaster);
  els.compressScaleRow.classList.toggle("hidden", !isRaster);
});

els.compressQuality.addEventListener("input", (event) => {
  state.compressQuality = Number(event.target.value) / 100;
  els.compressQualityVal.textContent = `${Math.round(state.compressQuality * 100)}%`;
});

els.compressScale.addEventListener("input", (event) => {
  state.compressScale = Number(event.target.value);
  els.compressScaleVal.textContent = `${state.compressScale.toFixed(1)}x`;
});

els.splitMode.addEventListener("change", (event) => {
  state.splitMode = event.target.value;
  const showRange = state.splitMode === "range";
  els.splitRangeRow.classList.toggle("hidden", !showRange);
});

els.splitStart.addEventListener("input", (event) => {
  state.splitStart = Math.max(1, Number(event.target.value));
  if (state.splitEnd < state.splitStart) {
    state.splitEnd = state.splitStart;
    els.splitEnd.value = state.splitEnd;
  }
});

els.splitEnd.addEventListener("input", (event) => {
  state.splitEnd = Math.max(state.splitStart, Number(event.target.value));
});

els.jpgQuality.addEventListener("input", (event) => {
  state.jpgQuality = Number(event.target.value) / 100;
  els.jpgQualityVal.textContent = `${Math.round(state.jpgQuality * 100)}%`;
});

els.jpgScale.addEventListener("input", (event) => {
  state.jpgScale = Number(event.target.value);
  els.jpgScaleVal.textContent = `${state.jpgScale.toFixed(1)}x`;
});

els.jpgScope.addEventListener("change", (event) => {
  state.jpgScope = event.target.value;
});

segButtons.forEach((btn) => {
  btn.addEventListener("click", () => setType(btn.dataset.type));
});

toolButtons.forEach((btn) => {
  btn.addEventListener("click", () => setTool(btn.dataset.tool));
});

els.watermarkOverlay.addEventListener("pointerdown", (event) => {
  if (state.tool !== "watermark") return;
  const canDragText = state.type === "text" && state.mode === "single";
  const canDragImage = state.type === "image";
  if (!canDragText && !canDragImage) return;
  if (canDragText) {
    state.textAutoCenter = false;
  }
  dragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: state.position.x,
    originY: state.position.y,
  };
  els.watermarkOverlay.setPointerCapture(event.pointerId);
});

els.watermarkOverlay.addEventListener("pointermove", (event) => {
  if (state.tool !== "watermark") return;
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  setPosition(dragState.originX + dx, dragState.originY + dy);
});

els.watermarkOverlay.addEventListener("pointerup", (event) => {
  if (state.tool !== "watermark") return;
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  els.watermarkOverlay.releasePointerCapture(event.pointerId);
  dragState = null;
});

els.patternCanvas.addEventListener("pointerdown", (event) => {
  if (state.tool !== "watermark") return;
  if (state.type !== "text" || state.mode !== "repeat") return;
  patternDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: state.patternOffset.x,
    originY: state.patternOffset.y,
  };
  els.patternCanvas.setPointerCapture(event.pointerId);
});

els.patternCanvas.addEventListener("pointermove", (event) => {
  if (state.tool !== "watermark") return;
  if (!patternDrag || patternDrag.pointerId !== event.pointerId) return;
  const dx = event.clientX - patternDrag.startX;
  const dy = event.clientY - patternDrag.startY;
  state.patternOffset.x = patternDrag.originX + dx;
  state.patternOffset.y = patternDrag.originY + dy;
  updateRatios();
  drawPattern();
});

els.patternCanvas.addEventListener("pointerup", (event) => {
  if (state.tool !== "watermark") return;
  if (!patternDrag || patternDrag.pointerId !== event.pointerId) return;
  els.patternCanvas.releasePointerCapture(event.pointerId);
  patternDrag = null;
});

window.addEventListener("resize", () => {
  if (!state.pdfDoc) return;
  renderPage();
});

setEmptyState(true);
updateButtons();
updateSegmented(state.type);
updateModeVisibility();
syncControlsFromState();
updateEmptyStateText();
setTool(state.tool);
