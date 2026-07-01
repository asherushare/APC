import fileType from 'file-type';

/**
 * Validates if the uploaded file buffer matches its declared mime type.
 * Returns true if the file signature matches the expected mimetype.
 */
export function validateFileSignature(buffer: Buffer, declaredMimeType: string): boolean {
  if (!buffer || buffer.length === 0) return false;

  const fileInfo = fileType(buffer);
  
  if (!fileInfo) {
    return false; // Could not detect signature (might be plain text, HTML, or corrupted binary)
  }

  // Support image/jpg mapping to image/jpeg
  const normalizedDeclared = declaredMimeType === 'image/jpg' ? 'image/jpeg' : declaredMimeType;
  const normalizedDetected = (fileInfo.mime as string) === 'image/jpg' ? 'image/jpeg' : fileInfo.mime;

  return normalizedDetected === normalizedDeclared;
}
