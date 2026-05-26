/** Client-side KYC checks — mirrors backend `app/utils/kyc_media.py` (server re-validates on upload). */

export const KYC_MAX_BYTES = 12 * 1024 * 1024;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|tiff?|heic|heif|avif)$/i;

const MIN_PX_ID = 160_000;
const MIN_PX_SELFIE = 100_000;
const MIN_SHORT_ID = 260;
const MIN_LONG_ID = 380;
const MIN_SHORT_SELFIE = 240;
const MIN_LONG_SELFIE = 300;
const ID_ASPECT_MIN = 1.12;
const ID_ASPECT_MAX = 3.4;

function isImageFile(file) {
  const mime = (file.type || "").split(";")[0].trim().toLowerCase();
  if (mime.startsWith("image/")) return true;
  if (!mime || mime === "application/octet-stream") {
    return IMAGE_EXT.test(file.name || "");
  }
  return false;
}

function validateIdFraming(w, h) {
  const aspect = w / h;
  if (h >= w * 1.05) {
    return "This looks like a portrait photo, not an ID. Hold the phone sideways and photograph the flat card (landscape).";
  }
  if (aspect < ID_ASPECT_MIN) {
    return "This does not look like an ID card. Show the full card in landscape.";
  }
  if (aspect > ID_ASPECT_MAX) {
    return "Image is too wide and thin for an ID. Center the full card in the frame.";
  }
  return null;
}

function validateSelfieFraming(w, h) {
  if (w > h * 1.2) {
    return "This looks like a document photo, not a selfie. Hold the phone vertically and photograph your face.";
  }
  if (h < w * 0.92) {
    return "Selfie must be portrait (taller than wide). Do not upload a photo of your ID on a table.";
  }
  return null;
}

/**
 * @param {File} file
 * @param {"id_front"|"id_back"|"selfie"} kind
 * @returns {Promise<string|null>} error message or null if OK
 */
export function validateKycFile(file, kind) {
  if (!file) return "Choose a file.";
  if (!isImageFile(file)) {
    return "Upload a photo (JPEG, PNG, WebP, HEIC, GIF, BMP, TIFF, etc.) — not PDF or other document types.";
  }
  if (file.size > KYC_MAX_BYTES) return `File is too large (max ${Math.round(KYC_MAX_BYTES / (1024 * 1024))} MB).`;
  if (file.size < 800) return "File is too small to be a real photo.";

  return loadImageDimensions(file).then(({ width: w, height: h, failed }) => {
    if (failed || !w || !h) {
      return "Could not read this as an image. Try another photo from your camera or gallery.";
    }
    const pixels = w * h;
    const shortE = Math.min(w, h);
    const longE = Math.max(w, h);

    if (kind === "id_front" || kind === "id_back") {
      if (pixels < MIN_PX_ID) return "ID image is too small — fill the frame with your ID so text is readable.";
      if (shortE < MIN_SHORT_ID || longE < MIN_LONG_ID) {
        return "ID photo is too low resolution. Move closer or retake in better light.";
      }
      return validateIdFraming(w, h);
    }

    if (pixels < MIN_PX_SELFIE) return "Selfie is too small — use your front camera and fill the frame with your face.";
    if (shortE < MIN_SHORT_SELFIE || longE < MIN_LONG_SELFIE) {
      return "Selfie resolution is too low. Retake with your face and shoulders visible.";
    }
    return validateSelfieFraming(w, h);
  });
}

function loadImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight, failed: false });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0, failed: true });
    };
    img.src = url;
  });
}
