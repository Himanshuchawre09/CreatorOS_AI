/**
 * Verifies file signature / magic bytes against allowed MIME types:
 * - image/png
 * - image/jpeg
 * - application/pdf
 * - video/mp4
 */
export function verifyFileSignature(buffer: Buffer): {
  valid: boolean;
  detectedMime?: string;
} {
  if (!buffer || buffer.length < 8) {
    return { valid: false };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PDF: 25 50 44 46 (%PDF)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, detectedMime: 'application/pdf' };
  }

  // MP4: bytes 4..7 === 'ftyp'
  if (buffer.length >= 12) {
    const ftyp = buffer.toString('utf8', 4, 8);
    if (ftyp === 'ftyp') {
      return { valid: true, detectedMime: 'video/mp4' };
    }
  }

  return { valid: false };
}
