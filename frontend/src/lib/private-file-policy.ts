/** Private bytes must never enter the public Next.js image optimization cache. */
export function isPrivateImageSource(source: string): boolean {
  try {
    const url = new URL(source, 'https://local.invalid');
    const pathname = decodeURIComponent(url.pathname).replace(/\\/g, '/').toLowerCase();
    if (pathname.startsWith('/api/v1/media/private/')) return true;
    if (pathname === '/_next/image') return true;
    return pathname.startsWith('/api/v1/uploads/') && pathname.split('/').some((part) =>
      ['.private', 'user-documents', 'visa-documents', 'receipts'].includes(part));
  } catch { return true; }
}
