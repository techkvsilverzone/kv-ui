const BASE64_PATTERN = /^[A-Za-z0-9+/=\s]+$/;

const getImageMimeTypeFromBase64 = (value: string): string => {
  const normalized = value.replace(/\s/g, '');

  if (normalized.startsWith('/9j/')) {
    return 'image/jpeg';
  }

  if (normalized.startsWith('iVBORw0KGgo')) {
    return 'image/png';
  }

  if (normalized.startsWith('R0lGOD')) {
    return 'image/gif';
  }

  if (normalized.startsWith('UklGR')) {
    return 'image/webp';
  }

  return 'image/jpeg';
};

export const normalizeImageSrc = (image?: string): string => {
  if (!image) {
    return '';
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return '';
  }

  const compact = trimmed.replace(/\s/g, '');
  if (compact.length > 100 && BASE64_PATTERN.test(trimmed)) {
    const mimeType = getImageMimeTypeFromBase64(compact);
    return `data:${mimeType};base64,${compact}`;
  }

  if (
    trimmed.startsWith('data:image')
    || trimmed.startsWith('http://')
    || trimmed.startsWith('https://')
    || trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  return trimmed;
};
