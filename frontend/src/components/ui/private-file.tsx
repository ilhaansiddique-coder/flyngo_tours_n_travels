'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { privateFileBlob } from '@/lib/private-files';
import { useAuthStore } from '@/stores/auth.store';

function usePrivateFile(url: string) {
  const token = useAuthStore((state) => state.accessToken);
  const [result, setResult] = useState<{ source: string; session: string | null; file: { url: string; mime: string } | null; error: boolean } | null>(null);
  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;
    privateFileBlob(url).then((blob) => {
      if (disposed) return;
      objectUrl = URL.createObjectURL(blob);
      setResult({ source: url, session: token, file: { url: objectUrl, mime: blob.type }, error: false });
    }).catch(() => { if (!disposed) setResult({ source: url, session: token, file: null, error: true }); });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url, token]);
  // Never show a previous account's or previous selection's bytes while fetching.
  return result?.source === url && result.session === token ? result : { file: null, error: false };
}

function downloadName(filename: string, mime: string) {
  const extension = ({ 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' } as Record<string, string>)[mime] || '';
  return /\.[a-z0-9]+$/i.test(filename) ? filename : filename + extension;
}

export function PrivateFile({ url, filename = 'document', className = 'block w-14 h-14 rounded-lg border overflow-hidden' }: {
  url: string; filename?: string; className?: string;
}) {
  const { file, error } = usePrivateFile(url);
  if (!file) return <span className={className} role="status">{error ? 'Unavailable' : 'Loading…'}</span>;
  return <a href={file.url} download={downloadName(filename, file.mime)} className={className} title={`Download ${filename}`}>
    {file.mime.startsWith('image/') ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={file.url} alt={filename} className="w-full h-full object-cover" />
    ) : <span className="flex h-full items-center justify-center"><FileText className="w-5 h-5" /><span className="sr-only">Download {filename}</span></span>}
  </a>;
}

export function PrivateDocumentPreview({ url }: { url: string }) {
  const { file, error } = usePrivateFile(url);
  if (!file) return <p role="status">{error ? 'Document unavailable or access denied.' : 'Loading document…'}</p>;
  return <div className="w-full flex flex-col items-center gap-3">
    {file.mime === 'application/pdf' ? (
      <iframe src={file.url} sandbox="" className="w-full h-[60vh] border rounded-lg" title="Document preview" />
    ) : file.mime.startsWith('image/') ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={file.url} alt="Document preview" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
    ) : <p>Preview unavailable for this format. Download to open it.</p>}
    <a href={file.url} download={downloadName('document', file.mime)} className="underline">Download document</a>
  </div>;
}
