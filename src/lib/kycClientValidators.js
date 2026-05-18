/** Client-side KYC checks — align with backend `app/utils/kyc_media.py` (not a substitute for review). */

export const KYC_MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const MIN_PX_ID = 180_000;
const MIN_PX_SELFIE = 120_000;
const MIN_SHORT_ID = 280;
const MIN_LONG_ID = 400;
const MIN_SHORT_SELFIE = 260;
const MIN_LONG_SELFIE = 320;

/**
 * @param {File} file
 * @param {"id_front"|"id_back"|"selfie"} kind
 * @returns {Promise<string|null>} error message or null if OK
 */
export function validateKycFile(file, kind) {
  if (!file) return "Choose a file.";
  const mime = (file.type || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return "Use a JPEG, PNG, or WebP photo from your camera (not PDF or other types).";
  }
  if (file.size > KYC_MAX_BYTES) return "File is too large (max 8 MB).";
  if (file.size < 2000) return "File is too small to be a real photo.";
  return loadImageDimensions(file).then(({ width: w, height: h }) => {
    if (!w || !h) return "Could not read image dimensions.";
    const pixels = w * h;
    const shortE = Math.min(w, h);
    const longE = Math.max(w, h);

    if (kind === "id_front" || kind === "id_back") {
      if (pixels < MIN_PX_ID) return "Image is too small — fill the frame with your ID so text is readable.";
      if (shortE < MIN_SHORT_ID || longE < MIN_LONG_ID) {
        return "ID photo is too low resolution. Move closer or retake in better light.";
      }
    } else {
      if (pixels < MIN_PX_SELFIE) return "Selfie is too small — use your front camera and fill the frame.";
      if (shortE < MIN_SHORT_SELFIE || longE < MIN_LONG_SELFIE) {
        return "Selfie resolution is too low. Retake with your face and shoulders visible.";
      }
      if (w > h * 1.35) {
        return "This looks like a landscape document, not a selfie. Hold the phone vertically, face centered.";
      }
    }
    return null;
  });
}

function loadImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}
