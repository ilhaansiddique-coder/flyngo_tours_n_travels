import { createHash, timingSafeEqual } from 'crypto';
import * as path from 'path';

export const PRIVATE_MEDIA_PREFIX = '/api/v1/media/private/';
export const PRIVATE_FOLDERS = ['user-documents', 'receipts', 'visa-documents'];
// Kept on the existing persistent upload volume, but never served by static middleware.
export const privateDirectory = () => path.resolve(process.cwd(), 'uploads', '.private');
export function privateFilePath(id: string) {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error('Invalid private file ID');
  return path.join(privateDirectory(), id);
}
export const hashUploadToken = (token: string) => createHash('sha256').update(token).digest('hex');
export function validUploadToken(file: { uploadTokenHash: string | null; uploadTokenExpiresAt: Date | null }, token?: string) {
  if (typeof token !== 'string' || !token || !file.uploadTokenHash || !file.uploadTokenExpiresAt || file.uploadTokenExpiresAt <= new Date()) return false;
  const actual = Buffer.from(hashUploadToken(token), 'hex');
  const expected = Buffer.from(file.uploadTokenHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Fail closed before Express static handling, including percent-encoded folder names. */
export function blockPrivateStaticFiles(req: { path: string }, res: any, next: () => void) {
  let key: string;
  try { key = decodeURIComponent(req.path).replace(/\\/g, '/').toLowerCase(); }
  catch { return res.status(404).end(); }
  const segments = key.split('/');
  if (segments.some((segment) => segment === '.private' || PRIVATE_FOLDERS.includes(segment))) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).end();
  }
  next();
}

// Only inert image formats and PDFs are previewed. Other documents download as binary.
export function privateMime(buffer: Buffer): string {
  if (buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'image/jpeg';
  if (/^GIF8[79]a/.test(buffer.subarray(0, 6).toString())) return 'image/gif';
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return 'application/octet-stream';
}
