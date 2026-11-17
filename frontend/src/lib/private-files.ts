import { api } from './api';

const PREFIX = '/api/v1/media/private/';
// Guest capabilities stay in memory, never in a URL or persistent browser storage.
const uploadTokens = new Map<string, string>();
export function rememberPrivateUpload<T>(result: T): T {
  const file = result as { url?: string; uploadToken?: string };
  if (file?.url?.startsWith(PREFIX) && file.uploadToken) uploadTokens.set(file.url, file.uploadToken);
  return result;
}
export function privateUploadTokens(urls: string[]) {
  return Object.fromEntries(urls.filter((url) => uploadTokens.has(url)).map((url) => [url, uploadTokens.get(url)!]));
}
export function bookingUploadTokens(meta: unknown) {
  if (!meta || typeof meta !== 'object') return {};
  return privateUploadTokens(Object.entries(meta).filter(([key]) => key.startsWith('doc_'))
    .flatMap(([, value]) => typeof value === 'string' ? value.split(',').map((part) => part.trim()) : []));
}
export async function privateFileBlob(url: string) {
  if (!url.startsWith(PREFIX) || !/^[a-zA-Z0-9-]+$/.test(url.slice(PREFIX.length))) throw new Error('Invalid private file URL');
  const capability = uploadTokens.get(url);
  return api.getBlob(url.slice('/api/v1'.length), {
    cache: 'no-store', headers: capability ? { 'X-Upload-Token': capability } : {},
  });
}
