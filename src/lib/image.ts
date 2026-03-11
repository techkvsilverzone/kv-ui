// Derive the API server origin (e.g. "http://localhost:5000") from the full API URL
const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').origin;
  } catch {
    return 'http://localhost:5000';
  }
})();

/** Known base64 magic-byte prefixes for common image types. */
const RAW_BASE64_SIGNATURES: Array<{ prefix: string; mime: string }> = [
  { prefix: '/9j/',       mime: 'image/jpeg' },  // JPEG
  { prefix: '/9j+',       mime: 'image/jpeg' },  // JPEG variant
  { prefix: 'iVBOR',      mime: 'image/png'  },  // PNG
  { prefix: 'R0lGOD',     mime: 'image/gif'  },  // GIF
  { prefix: 'UklGR',      mime: 'image/webp' },  // WebP
  { prefix: 'Qk0',        mime: 'image/bmp'  },  // BMP
];

/**
 * Detects whether a string (with whitespace already stripped) is a raw base64
 * image by checking the magic bytes at the beginning, then returns the MIME type.
 * Returns null if the string is not a recognised raw base64 image.
 */
const detectRawBase64Mime = (compact: string): string | null => {
  if (compact.length < 100) return null;
  for (const sig of RAW_BASE64_SIGNATURES) {
    if (compact.startsWith(sig.prefix)) return sig.mime;
  }
  return null;
};

export const normalizeImageSrc = (image?: unknown): string => {
  if (!image || typeof image !== 'string') return '';

  const trimmed = image.trim();
  if (!trimmed) return '';

  // 1. Already a complete data URI (most common when images are stored as base64 in DB)
  if (trimmed.startsWith('data:image')) return trimmed;

  // 2. Already an absolute URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  // 3. Raw base64 without the data: prefix — detect by magic bytes
  const compact = trimmed.replace(/\s/g, '');
  const mime = detectRawBase64Mime(compact);
  if (mime) return `data:${mime};base64,${compact}`;

  // 4. Server-relative path e.g. /uploads/image.jpg
  if (trimmed.startsWith('/')) return `${API_ORIGIN}${trimmed}`;

  // 5. Bare relative path e.g. uploads/image.jpg
  return `${API_ORIGIN}/${trimmed}`;
};
