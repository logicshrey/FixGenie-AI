const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function getImageValidationMessage(file: File) {
  if (!file.size) {
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Please upload a JPG, PNG, or WebP image.';
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'Please upload an image smaller than 2 MB.';
  }

  return null;
}

export async function fileToDataUrl(file: File) {
  if (!file.size) {
    return null;
  }

  const error = getImageValidationMessage(file);
  if (error) {
    throw new Error(error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}
