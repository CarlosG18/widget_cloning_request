const BASE64_DATA_URI_REGEX = /^data:([^;]+);base64,/i;

const MIME_TYPE_EXTENSION_MAP: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "text/plain": "txt",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

export function removeExtensionFileName(fileName: string): string {
  if (!fileName) {
    return "anexo";
  }

  return fileName.replace(/\.[^/.]+$/, "");
}

export function createPdfFileFromBase64(
  base64: string,
  fileName: string,
): File {
  const normalizedBase64 = normalizeBase64Content(base64);
  const mimeType = extractMimeTypeFromBase64(base64);
  const byteCharacters = atob(normalizedBase64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return new File([blob], ensurePdfFileName(fileName, mimeType), {
    type: mimeType,
  });
}

export function normalizeBase64Content(base64: string): string {
  if (!base64 || typeof base64 !== "string") {
    return "";
  }

  return base64
    .replace(BASE64_DATA_URI_REGEX, "")
    .replace(/\s+/g, "")
    .trim();
}

export function ensurePdfFileName(
  fileName: string,
  mimeType = "application/octet-stream",
): string {
  const trimmedFileName = (fileName || "").trim();

  if (!trimmedFileName) {
    return `anexo.${getExtensionFromMimeType(mimeType)}`;
  }

  if (/\.[^/.]+$/.test(trimmedFileName)) {
    return trimmedFileName;
  }

  return `${trimmedFileName}.${getExtensionFromMimeType(mimeType)}`;
}

function extractMimeTypeFromBase64(base64: string): string {
  if (!base64 || typeof base64 !== "string") {
    return "application/octet-stream";
  }

  const match = base64.match(BASE64_DATA_URI_REGEX);
  return match?.[1]?.toLowerCase() || "application/octet-stream";
}

function getExtensionFromMimeType(mimeType: string): string {
  return MIME_TYPE_EXTENSION_MAP[mimeType.toLowerCase()] || "bin";
}
