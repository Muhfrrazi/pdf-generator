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

const fpdfWidths = {
  Helvetica: [278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 350, 556, 350, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, 350, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 350, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, 667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500],
  HelveticaBold: [278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 350, 556, 350, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, 350, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 350, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556],
  TimesRoman: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 278, 278, 564, 564, 564, 444, 921, 722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611, 889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333, 278, 333, 469, 500, 333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 480, 200, 480, 541, 350, 500, 350, 333, 500, 444, 1000, 500, 500, 333, 1000, 556, 333, 889, 350, 611, 350, 350, 333, 333, 444, 444, 350, 500, 1000, 333, 980, 389, 333, 722, 350, 444, 722, 250, 333, 500, 500, 500, 500, 200, 500, 333, 760, 276, 500, 564, 333, 760, 333, 400, 564, 300, 300, 333, 500, 453, 250, 333, 300, 310, 500, 750, 750, 750, 444, 722, 722, 722, 722, 722, 722, 889, 667, 611, 611, 611, 611, 333, 333, 333, 333, 722, 722, 722, 722, 722, 722, 722, 564, 722, 722, 722, 722, 722, 722, 556, 500, 444, 444, 444, 444, 444, 444, 667, 444, 444, 444, 444, 444, 278, 278, 278, 278, 500, 500, 500, 500, 500, 500, 500, 564, 500, 500, 500, 500, 500, 500, 500, 500],
  TimesBold: [250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500, 930, 722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667, 944, 722, 778, 611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667, 333, 278, 333, 581, 500, 333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500, 556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 394, 220, 394, 520, 350, 500, 350, 333, 500, 500, 1000, 500, 500, 333, 1000, 556, 333, 1000, 350, 667, 350, 350, 333, 333, 500, 500, 350, 500, 1000, 333, 1000, 389, 333, 722, 350, 444, 722, 250, 333, 500, 500, 500, 500, 220, 500, 333, 747, 300, 500, 570, 333, 747, 333, 400, 570, 300, 300, 333, 556, 540, 250, 333, 300, 330, 500, 750, 750, 750, 500, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 389, 389, 389, 389, 722, 722, 778, 778, 778, 778, 778, 570, 778, 722, 722, 722, 722, 722, 611, 556, 500, 500, 500, 500, 500, 500, 722, 444, 444, 444, 444, 444, 278, 278, 278, 278, 500, 556, 500, 500, 500, 500, 500, 570, 500, 556, 556, 556, 556, 500, 556, 500],
  Courier: [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600],
  CourierBold: [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600],
};

function fpdfTextWidth(fontKey, text, fontSize) {
  const widths = fpdfWidths[fontKey];
  if (!widths) return null;
  const fallback = widths[63] ?? 500;
  let total = 0;
  for (const ch of text) {
    let code = ch.charCodeAt(0);
    if (code > 255) code = 63;
    total += widths[code] ?? fallback;
  }
  return (total / 1000) * fontSize;
}

const fontMeasure = { ready: false, fonts: {} };

async function loadMeasureFonts() {
  try {
    const doc = await PDFDocument.create();
    await Promise.all(
      Object.entries(fontPdfMap).map(async ([key, fontName]) => {
        fontMeasure.fonts[key] = await doc.embedFont(fontName);
      }),
    );
    fontMeasure.ready = true;
    if (state.pdfDoc && state.tool === "watermark" && state.type === "text" && state.mode === "repeat") {
      drawPattern();
    }
  } catch (error) {
    fontMeasure.ready = false;
  }
}

loadMeasureFonts();

const state = {
  pdfDoc: null,
  pdfBytes: null,
  sourceBytes: null,
  pdfFile: null,
  pageCount: 0,
  currentPage: 1,
  previewScale: 1,
  previewWidth: 0,
  previewHeight: 0,
  baseWidth: 0,
  baseHeight: 0,
  ratiosReady: false,
  tool: "watermark",
  view: "home",
  processing: false,
  type: "text",
  text: "",
  textSize: { w: 0, h: 0 },
  imageSize: { w: 0, h: 0 },
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
  imageFile: null,
  imageDataUrl: null,
  imageWidth: 180,
  imageWidthRatio: 0.24,
  imageOpacity: 0.3,
  imageRotation: 0,
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
  homePage: document.getElementById("homePage"),
  toolPage: document.getElementById("toolPage"),
  backHome: document.getElementById("backHome"),
  toolTitle: document.getElementById("toolTitle"),
  toolSubtitle: document.getElementById("toolSubtitle"),
  sourcePdfSection: document.getElementById("sourcePdfSection"),
  pdfInput: document.getElementById("pdfInput"),
  pdfFileName: document.getElementById("pdfFileName"),
  imageInput: document.getElementById("imageInput"),
  imageFileName: document.getElementById("imageFileName"),
  clearImageBtn: document.getElementById("clearImageBtn"),
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
  mergeFileName: document.getElementById("mergeFileName"),
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

const segButtons = Array.from(document.querySelectorAll(".seg-btn[data-type]"));
const toolButtons = Array.from(document.querySelectorAll(".tool-card[data-tool]"));

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
  if (els.clearImageBtn) {
    els.clearImageBtn.disabled = !hasImage || state.processing;
  }
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

const toolMeta = {
  watermark: {
    title: "Watermark",
    subtitle: "Tempelkan teks atau logo di atas PDF dengan kontrol penuh.",
  },
  merge: {
    title: "Merge PDF",
    subtitle: "Gabungkan beberapa PDF sesuai urutan yang Anda inginkan.",
  },
  compress: {
    title: "Compress PDF",
    subtitle: "Perkecil ukuran file sambil menjaga kualitas sebaik mungkin.",
  },
  split: {
    title: "Split PDF",
    subtitle: "Pisahkan halaman tertentu menjadi file terpisah.",
  },
  jpg: {
    title: "PDF to JPG",
    subtitle: "Konversi halaman PDF ke JPG secara cepat.",
  },
};

function updateToolHeader(tool) {
  const meta = toolMeta[tool] || toolMeta.watermark;
  if (els.toolTitle) els.toolTitle.textContent = meta.title;
  if (els.toolSubtitle) els.toolSubtitle.textContent = meta.subtitle;
}

function setView(view) {
  state.view = view;
  if (els.homePage) {
    els.homePage.classList.toggle("hidden", view !== "home");
  }
  if (els.toolPage) {
    els.toolPage.classList.toggle("hidden", view !== "tool");
  }
  if (view === "home") {
    setStatus("");
  }
}

function openTool(tool) {
  setTool(tool);
  setView("tool");
  if (state.pdfDoc && tool !== "merge") {
    renderPage();
  }
}

function setTool(tool) {
  state.tool = tool;
  updateToolButtons(tool);
  updateToolHeader(tool);
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

function updateMergeFileName() {
  if (!els.mergeFileName) return;
  const count = state.mergeFiles.length;
  if (!count) {
    els.mergeFileName.textContent = "Belum ada file";
    return;
  }
  if (count === 1) {
    els.mergeFileName.textContent = state.mergeFiles[0]?.name || "1 file dipilih";
    return;
  }
  els.mergeFileName.textContent = `${count} file dipilih`;
}

function renderMergeList() {
  if (!els.mergeList) return;
  els.mergeList.innerHTML = "";
  updateMergeFileName();

  if (!state.mergeFiles.length) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "Belum ada file PDF.";
    els.mergeList.appendChild(empty);
    return;
  }

  state.mergeFiles.forEach((file, index) => {
    const row = document.createElement("div");
    row.className = "file-row";

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;

    const actions = document.createElement("div");
    actions.className = "file-actions";

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "mini";
    upBtn.textContent = "Naik";
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", () => {
      if (index === 0) return;
      const list = state.mergeFiles.slice();
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
      state.mergeFiles = list;
      renderMergeList();
      updateButtons();
    });

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "mini";
    downBtn.textContent = "Turun";
    downBtn.disabled = index === state.mergeFiles.length - 1;
    downBtn.addEventListener("click", () => {
      if (index >= state.mergeFiles.length - 1) return;
      const list = state.mergeFiles.slice();
      [list[index], list[index + 1]] = [list[index + 1], list[index]];
      state.mergeFiles = list;
      renderMergeList();
      updateButtons();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "mini";
    removeBtn.textContent = "Hapus";
    removeBtn.addEventListener("click", () => {
      state.mergeFiles = state.mergeFiles.filter((_, i) => i !== index);
      renderMergeList();
      updateButtons();
    });

    actions.append(upBtn, downBtn, removeBtn);
    row.append(name, actions);
    els.mergeList.append(row);
  });
}

function updateRatios() {
  if (!state.previewWidth || !state.baseWidth || !state.baseHeight) return;
  const scale = state.previewScale || 1;
  state.fontSizeRatio = (state.fontSize / scale) / state.baseWidth;
  state.imageWidthRatio = (state.imageWidth / scale) / state.baseWidth;
  state.spacingRatio = (state.spacing / scale) / state.baseWidth;
  state.positionRatio = {
    x: (state.position.x / scale) / state.baseWidth,
    y: (state.position.y / scale) / state.baseHeight,
  };
  state.patternOffsetRatio = {
    x: (state.patternOffset.x / scale) / state.baseWidth,
    y: (state.patternOffset.y / scale) / state.baseHeight,
  };
}

function applyRatiosToPreview() {
  if (!state.previewWidth || !state.baseWidth || !state.baseHeight) return;
  const scale = state.previewScale || 1;
  state.fontSize = state.fontSizeRatio * state.baseWidth * scale;
  state.imageWidth = state.imageWidthRatio * state.baseWidth * scale;
  state.spacing = state.spacingRatio * state.baseWidth * scale;
  state.position.x = state.positionRatio.x * state.baseWidth * scale;
  state.position.y = state.positionRatio.y * state.baseHeight * scale;
  state.patternOffset.x = state.patternOffsetRatio.x * state.baseWidth * scale;
  state.patternOffset.y = state.patternOffsetRatio.y * state.baseHeight * scale;
}

function setOverlaySize(width, height) {
  state.overlaySize = { w: width, h: height };
  els.watermarkOverlay.style.width = `${width}px`;
  els.watermarkOverlay.style.height = `${height}px`;
  setPosition(state.position.x, state.position.y);
}

function updateOverlayBounds() {
  const width = Math.max(state.textSize.w || 0, state.imageSize.w || 0);
  const height = Math.max(state.textSize.h || 0, state.imageSize.h || 0);
  if (!width || !height) return;
  setOverlaySize(width, height);
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
    state.textSize = { w: width, h: height };
    updateOverlayBounds();
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
  state.imageSize = { w: width, h: height };
  updateOverlayBounds();
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
  const ctx = els.patternCanvas.getContext("2d");
  ctx.clearRect(0, 0, els.patternCanvas.width, els.patternCanvas.height);
  els.patternCanvas.classList.add("hidden");
}

function updateModeVisibility() {
  if (state.type === "text" && state.mode === "repeat") {
    els.spacingRow.classList.remove("hidden");
    els.textSingleHint.classList.add("hidden");
  } else if (state.type === "text") {
    els.spacingRow.classList.add("hidden");
    els.textSingleHint.classList.remove("hidden");
  } else {
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
  if (state.tool !== "watermark") {
    hideOverlay();
    hidePattern();
  } else if (!state.pdfBytes) {
    hideOverlay();
    hidePattern();
  } else {
    updateModeVisibility();
    const hasText = Boolean((state.text || "").trim());
    const hasImage = Boolean(state.imageDataUrl);

    if (hasText && state.mode === "repeat") {
      showPattern();
      drawPattern();
    } else {
      hidePattern();
    }

    if (hasText && state.mode === "single") {
      els.wmTextOverlay.classList.remove("hidden");
      updateTextOverlay();
    } else {
      els.wmTextOverlay.classList.add("hidden");
      state.textSize = { w: 0, h: 0 };
    }

    if (hasImage) {
      els.wmImageOverlay.classList.remove("hidden");
      updateImageOverlay();
    } else {
      els.wmImageOverlay.classList.add("hidden");
      state.imageSize = { w: 0, h: 0 };
    }

    if (hasImage || (hasText && state.mode === "single")) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }

}

function drawPattern() {
  if (state.type !== "text" || state.mode !== "repeat") return;
  if (!state.previewWidth) return;
  const canvas = els.patternCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const text = state.text || "";
  const lines = text.split(/\r?\n/);
  const lineHeight = state.fontSize * 1.2;
  ctx.font = getCanvasFont(state.font, state.fontSize);
  const measureFont = fontMeasure.fonts[state.font];
  const textWidths = lines.map((line) => {
    const width = fpdfTextWidth(state.font, line, state.fontSize);
    if (width !== null) return width;
    if (fontMeasure.ready && measureFont) {
      return measureFont.widthOfTextAtSize(line, state.fontSize);
    }
    return ctx.measureText(line).width;
  });
  const blockWidth = Math.max(...textWidths, 10);
  const blockHeight = lineHeight * lines.length;

  const baseX = (canvas.width - blockWidth) / 2 + state.patternOffset.x;
  const baseY = (canvas.height - blockHeight) / 2 + state.patternOffset.y;
  const pivotX = baseX;
  const pivotY = baseY + blockHeight;
  const angle = state.rotation;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  ctx.save();
  ctx.globalAlpha = state.opacity;
  ctx.fillStyle = state.color;
  ctx.textBaseline = "alphabetic";

  const step = state.spacing;
  const maxX = canvas.width * 2;
  const maxY = canvas.height * 2;
  const startX = -Math.ceil(maxX / step) * step;
  const startY = -Math.ceil(maxY / step) * step;

  for (let x = startX; x <= maxX; x += step) {
    for (let y = startY; y <= maxY; y += step) {
      const topX = baseX + x;
      const topY = baseY + y;
      lines.forEach((line, index) => {
        const alignOffset = (blockWidth - textWidths[index]) / 2;
        const baseLineX = topX + alignOffset;
        const baseLineY = topY + (index + 1) * lineHeight;
        const dx = baseLineX - pivotX;
        const dy = baseLineY - pivotY;
        const drawX = pivotX + dx * cos - dy * sin;
        const drawY = pivotY + dx * sin + dy * cos;
        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(rad);
        ctx.fillText(line, 0, 0);
        ctx.restore();
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

  state.previewScale = scale;
  state.baseWidth = baseViewport.width;
  state.baseHeight = baseViewport.height;

  if (!state.ratiosReady) {
    state.fontSizeRatio = (state.fontSize / scale) / state.baseWidth;
    state.imageWidthRatio = (state.imageWidth / scale) / state.baseWidth;
    state.spacingRatio = (state.spacing / scale) / state.baseWidth;
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
  state.sourceBytes = buffer.slice(0);
  state.pdfBytes = buffer.slice(0);
  state.pdfFile = file;
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
  syncControlsFromState();
  refreshOverlays();
}

function setMode(mode) {
  state.mode = mode;
  if (state.type === "text") {
    state.text = "";
    if (els.wmText) {
      els.wmText.value = "";
    }
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

function clearImage() {
  state.imageFile = null;
  state.imageBytes = null;
  state.imageDataUrl = null;
  state.imageAspect = 0.6;
  state.imageSize = { w: 0, h: 0 };
  if (els.imageInput) {
    els.imageInput.value = "";
  }
  if (els.imageFileName) {
    els.imageFileName.textContent = "Belum ada file";
  }
  updateButtons();
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

function getBaseName(filename) {
  if (!filename) return "file";
  const lastDot = filename.lastIndexOf(".");
  if (lastDot > 0) return filename.slice(0, lastDot);
  return filename;
}

function buildOutputName(suffix, ext, baseName) {
  const base = baseName || getBaseName(state.pdfFile?.name);
  return `${base}-${suffix}.${ext}`;
}

async function requestDownload(url, formData, fallbackName) {
  const response = await fetch(url, { method: "POST", body: formData });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Gagal memproses file.");
    }
    const text = await response.text();
    throw new Error(text || "Gagal memproses file.");
  }
  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Gagal memproses file.");
  }
  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  let filename = fallbackName;
  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  if (match) {
    filename = decodeURIComponent(match[1] || match[2]);
  }
  downloadBlob(blob, filename);
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

async function applyTextWatermark(pdfDoc, text) {
  const fontKey = fontPdfMap[state.font] || StandardFonts.Helvetica;
  const font = await pdfDoc.embedFont(fontKey);
  const { r, g, b } = hexToRgb(state.color);
  const color = rgb(r, g, b);
  const lines = text.split(/\r?\n/);

  pdfDoc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = state.fontSizeRatio * width;
    const lineHeight = fontSize * 1.2;
    let blockWidth = 0;
    lines.forEach((line) => {
      blockWidth = Math.max(blockWidth, font.widthOfTextAtSize(line, fontSize));
    });
    const blockHeight = lineHeight * Math.max(lines.length, 1);

    if (state.mode === "repeat") {
      let spacing = state.spacingRatio * width;
      if (spacing <= 0) {
        spacing = width * 0.3;
      }
      const offsetX = state.patternOffsetRatio.x * width;
      const offsetY = state.patternOffsetRatio.y * height;
      const baseX = (width - blockWidth) / 2 + offsetX;
      const baseY = (height - blockHeight) / 2 + offsetY;
      const pivotX = baseX;
      const pivotY = baseY + blockHeight;
      const maxX = width * 2;
      const maxY = height * 2;
      const startX = -Math.ceil(maxX / spacing) * spacing;
      const startY = -Math.ceil(maxY / spacing) * spacing;

      for (let x = startX; x <= maxX; x += spacing) {
        for (let y = startY; y <= maxY; y += spacing) {
          drawTextBlock(
            page,
            text,
            { x: baseX + x, y: baseY + y },
            { x: pivotX, y: pivotY },
            {
              size: fontSize,
              font,
              color,
              opacity: state.opacity,
              angle: -state.rotation,
              align: "center",
              blockWidth,
              scaleX: 1,
              scaleY: 1,
            },
          );
        }
      }
      return;
    }

    const topX = state.positionRatio.x * width;
    const topY = state.positionRatio.y * height;
    const pivotX = topX;
    const pivotY = topY + blockHeight;
    drawTextBlock(page, text, { x: topX, y: topY }, { x: pivotX, y: pivotY }, {
      size: fontSize,
      font,
      color,
      opacity: state.opacity,
      angle: -state.rotation,
      align: "center",
      blockWidth,
      scaleX: 1,
      scaleY: 1,
    });
  });
}

async function exportPdfClient() {
  if (!state.pdfBytes) return;
  const text = (state.text || "").trim();
  if (!text) {
    setStatus("Teks watermark kosong.");
    return;
  }
  let success = false;
  try {
    setProcessing(true);
    setStatus("Menerapkan watermark...");
    const sourceBytes = state.sourceBytes?.slice(0) || state.pdfBytes.slice(0);
    const pdfDoc = await PDFDocument.load(sourceBytes);
    await applyTextWatermark(pdfDoc, text);

    const bytes = await pdfDoc.save();
    downloadBytes(bytes, buildOutputName("watermark", "pdf"));
    success = true;
  } catch (error) {
    setStatus(error.message || "Gagal memproses watermark.");
  } finally {
    setProcessing(false);
    if (success) {
      setStatus("");
    }
  }
}

async function exportPdfClientImage() {
  if (!state.pdfBytes) return;
  if (!state.imageBytes || !state.imageFile) {
    setStatus("Logo belum dipilih.");
    return;
  }
  const text = (state.text || "").trim();
  const type = state.imageFile.type || "";
  if (!type.includes("png") && !type.includes("jpeg") && !type.includes("jpg")) {
    setStatus("Format logo harus PNG atau JPG.");
    return;
  }
  let success = false;
  try {
    setProcessing(true);
    setStatus("Menerapkan watermark...");
    const sourceBytes = state.sourceBytes?.slice(0) || state.pdfBytes.slice(0);
    const pdfDoc = await PDFDocument.load(sourceBytes);
    if (text) {
      await applyTextWatermark(pdfDoc, text);
    }
    const image = type.includes("png")
      ? await pdfDoc.embedPng(state.imageBytes)
      : await pdfDoc.embedJpg(state.imageBytes);
    const imageRotation = Number.isFinite(els.imgRotation?.valueAsNumber)
      ? els.imgRotation.valueAsNumber
      : state.imageRotation;
    state.imageRotation = imageRotation;

    pdfDoc.getPages().forEach((page, index) => {
      if (state.imageScope === "first" && index > 0) return;
      const { width, height } = page.getSize();
      const drawWidth = state.imageWidthRatio * width;
      const drawHeight = drawWidth * state.imageAspect;
      const x = state.positionRatio.x * width;
      const y = height - (state.positionRatio.y * height + drawHeight);
      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
        opacity: state.imageOpacity,
        rotate: degrees(-imageRotation),
      });
    });

    const bytes = await pdfDoc.save();
    downloadBytes(bytes, buildOutputName("watermark", "pdf"));
    success = true;
  } catch (error) {
    setStatus(error.message || "Gagal memproses watermark.");
  } finally {
    setProcessing(false);
    if (success) {
      setStatus("");
    }
  }
}

async function exportPdf() {
  if (!state.pdfFile) return;
  if (state.type === "image" && !state.imageFile) {
    setStatus("Logo belum dipilih.");
    return;
  }
  const hasText = Boolean((state.text || "").trim());
  const hasImage = Boolean(state.imageFile && state.imageBytes);
  if (hasText && hasImage) {
    await exportPdfClientImage();
    return;
  }
  if (state.type === "text") {
    await exportPdfClient();
    return;
  }
  if (state.type === "image") {
    await exportPdfClientImage();
    return;
  }
  let success = false;
  try {
    setProcessing(true);
    setStatus("Menerapkan watermark...");
    const formData = new FormData();
    formData.append("pdf", state.pdfFile);
    formData.append("type", state.type);
    if (state.type === "text") {
      formData.append("text", state.text);
      formData.append("font", state.font);
      formData.append("fontSizeRatio", state.fontSizeRatio.toString());
      formData.append("color", state.color);
      formData.append("opacity", state.opacity.toString());
      formData.append("rotation", state.rotation.toString());
      formData.append("mode", state.mode);
      formData.append("spacingRatio", state.spacingRatio.toString());
      formData.append("patternOffsetRatioX", state.patternOffsetRatio.x.toString());
      formData.append("patternOffsetRatioY", state.patternOffsetRatio.y.toString());
      formData.append("positionRatioX", state.positionRatio.x.toString());
      formData.append("positionRatioY", state.positionRatio.y.toString());
    } else {
      formData.append("logo", state.imageFile);
      formData.append("imageWidthRatio", state.imageWidthRatio.toString());
      formData.append("imageOpacity", state.imageOpacity.toString());
      formData.append("imageRotation", state.imageRotation.toString());
      formData.append("imageAspect", state.imageAspect.toString());
      formData.append("imageScope", state.imageScope);
      formData.append("positionRatioX", state.positionRatio.x.toString());
      formData.append("positionRatioY", state.positionRatio.y.toString());
    }
    await requestDownload("api/watermark", formData, buildOutputName("watermark", "pdf"));
    success = true;
  } catch (error) {
    setStatus(error.message || "Gagal memproses watermark.");
  } finally {
    setProcessing(false);
    if (success) {
      setStatus("");
    }
  }
}

async function compressPdf() {
  if (!state.pdfFile) return;
  let success = false;
  try {
    setProcessing(true);
    setStatus("Mengompres PDF...");
    const formData = new FormData();
    formData.append("pdf", state.pdfFile);
    formData.append("mode", state.compressMode);
    formData.append("quality", state.compressQuality.toString());
    formData.append("scale", state.compressScale.toString());
    await requestDownload("api/compress", formData, buildOutputName("compress", "pdf"));
    success = true;
  } catch (error) {
    setStatus(error.message || "Gagal mengompres PDF.");
  } finally {
    setProcessing(false);
    if (success) {
      setStatus("");
    }
  }
}

async function mergePdfs() {
  if (state.mergeFiles.length < 2) return;
  let success = false;
  try {
    setProcessing(true);
    setStatus("Menggabungkan PDF...");
    const formData = new FormData();
    state.mergeFiles.forEach((file) => {
      formData.append("files[]", file);
    });
    const baseName = getBaseName(state.mergeFiles[0]?.name) || "merge";
    await requestDownload("api/merge", formData, buildOutputName("merge", "pdf", baseName));
    success = true;
  } catch (error) {
    setStatus(error.message || "Gagal merge PDF.");
  } finally {
    setProcessing(false);
    if (success) {
      setStatus("");
    }
  }
}

async function splitPdf() {
  if (!state.pdfFile) return;
  let success = false;
  try {
    setProcessing(true);
    setStatus("Memisahkan PDF...");
    const formData = new FormData();
    formData.append("pdf", state.pdfFile);
    formData.append("mode", state.splitMode);
    formData.append("start", state.splitStart.toString());
    formData.append("end", state.splitEnd.toString());
    const filename = state.splitMode === "range"
      ? `${getBaseName(state.pdfFile?.name)}-split-${state.splitStart}-${state.splitEnd}.pdf`
      : buildOutputName("split", "zip");
    await requestDownload("api/split", formData, filename);
    success = true;
  } catch (error) {
    setStatus(error.message || "Gagal split PDF.");
  } finally {
    setProcessing(false);
    if (success) {
      setStatus("");
    }
  }
}

async function exportJpg() {
  if (!state.pdfFile) return;
  let success = false;
  try {
    setProcessing(true);
    setStatus("Mengubah ke JPG...");
    const formData = new FormData();
    formData.append("pdf", state.pdfFile);
    formData.append("quality", state.jpgQuality.toString());
    formData.append("scale", state.jpgScale.toString());
    formData.append("scope", state.jpgScope);
    if (state.jpgScope === "current") {
      formData.append("page", state.currentPage.toString());
    }
    const filename = state.jpgScope === "current"
      ? `${getBaseName(state.pdfFile?.name)}-page-${state.currentPage}.jpg`
      : buildOutputName("jpg", "zip");
    await requestDownload("api/pdf-to-jpg", formData, filename);
    success = true;
  } catch (error) {
    setStatus(error.message || "Gagal konversi JPG.");
  } finally {
    setProcessing(false);
    if (success) {
      setStatus("");
    }
  }
}

if (els.mergeInput) {
  els.mergeInput.addEventListener("change", (event) => {
    state.mergeFiles = Array.from(event.target.files || []);
    renderMergeList();
    updateButtons();
  });
}

if (els.pdfInput) {
  els.pdfInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (els.pdfFileName) {
      els.pdfFileName.textContent = file.name;
    }
    try {
      await loadPdf(file);
    } catch (error) {
      setStatus(error.message || "Gagal memuat PDF.");
      setEmptyState(true);
      if (els.pdfInput) {
        els.pdfInput.value = "";
      }
      if (els.pdfFileName) {
        els.pdfFileName.textContent = "Belum ada file";
      }
      updateButtons();
    }
  });
}

if (els.imageInput) {
  els.imageInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (els.imageFileName) {
      els.imageFileName.textContent = file.name;
    }
    state.imageFile = file;
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
}

if (els.clearImageBtn) {
  els.clearImageBtn.addEventListener("click", clearImage);
}

els.applyBtn.addEventListener("click", exportPdf);
els.resetBtn.addEventListener("click", resetPosition);
els.compressBtn.addEventListener("click", compressPdf);
els.mergeBtn.addEventListener("click", mergePdfs);
els.splitBtn.addEventListener("click", splitPdf);
els.jpgBtn.addEventListener("click", exportJpg);
els.backHome.addEventListener("click", () => setView("home"));

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
  const value = event.target.value || "";
  state.text = value;
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
  updateRatios();
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
  updateRatios();
  els.wmSpacingVal.textContent = `${Math.round(state.spacing)}px`;
  drawPattern();
});

els.imgWidth.addEventListener("input", (event) => {
  state.imageWidth = Number(event.target.value);
  updateRatios();
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
  btn.addEventListener("click", () => openTool(btn.dataset.tool));
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
setView(state.view);
