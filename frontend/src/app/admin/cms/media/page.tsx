'use client';

import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';
import { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, Search, Trash2, Copy, ExternalLink, X, Filter } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  filename?: string;
  alt?: string;
  folder?: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

interface PaginatedMedia {
  items: MediaItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const ALL_FOLDERS = ['tours', 'hotels', 'flights', 'destinations', 'hajj', 'umrah', 'hero', 'general'];

function formatBytes(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { listMedia, uploadMedia, deleteMedia } = useApi();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 24, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [page, setPage] = useState(1);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFolder, setUploadFolder] = useState('general');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMedia = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(pageNum), limit: '24' };
      if (search.trim()) params.q = search.trim();
      const res = (await listMedia(params)) as unknown as PaginatedMedia;
      setMedia(res?.items ?? []);
      setMeta(res?.meta ?? { page: 1, limit: 24, total: 0, totalPages: 0 });
    } catch (err: any) {
      setError(err?.message || 'Failed to load media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchMedia(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setError(null);
    try {
      await uploadMedia(uploadFile, { folder: uploadFolder, alt: uploadAlt || undefined });
      setUploadOpen(false);
      setUploadFile(null);
      setUploadAlt('');
      setUploadPreview('');
      setPage(1);
      fetchMedia(1);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMedia(id);
      fetchMedia(page);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (url: string) => {
    void navigator.clipboard.writeText(url);
  };

  const filtered = folder ? media.filter((m) => (m.folder || 'general') === folder) : media;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <Input
              placeholder="Search media..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  fetchMedia(1);
                }
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="pl-9 pr-3 py-2.5 text-sm border border-outline-variant rounded-xl bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
            >
              <option value="">All folders</option>
              {ALL_FOLDERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <Button size="md" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="w-4 h-4" /> Upload Media
        </Button>
      </div>

      {error && (
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-error text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>Dismiss</Button>
          </div>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card hover={false}>
          <div className="text-center py-12">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/40" />
            <p className="text-on-surface-variant text-sm">No media found</p>
            <p className="text-on-surface-variant/60 text-xs mt-1">Upload your first image to get started.</p>
          </div>
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((m) => (
            <Card key={m.id} hover={false} className="group overflow-hidden">
              <div
                className="aspect-square bg-surface-container-high overflow-hidden cursor-pointer relative"
                onClick={() => setPreviewItem(m)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || m.filename || 'media'} className="w-full h-full object-cover" />
                {m.folder && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">
                    {m.folder}
                  </span>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate" title={m.filename || m.url}>{m.filename || 'Untitled'}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{formatBytes(m.size)}</p>
                <div className="flex gap-1 mt-2">
                  <button
                    className="flex-1 p-1 rounded text-[10px] hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center gap-1"
                    onClick={() => copyToClipboard(m.url)}
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-1 rounded text-[10px] hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    className="p-1 rounded text-[10px] hover:bg-error/10 text-on-surface-variant hover:text-error disabled:opacity-50"
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Media">
        <div className="space-y-3">
          <FormInput
            type="file"
            accept="image/*"
            onChange={(v) => {
              const target = document.querySelector('input[type="file"]') as HTMLInputElement | null;
              if (target) handleFileChange({ target } as any);
            }}
          />
          {uploadPreview && (
            <div className="rounded-lg overflow-hidden border border-outline-variant">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uploadPreview} alt="preview" className="w-full h-48 object-cover" />
            </div>
          )}
          <FormField label="Folder">
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
            >
              {ALL_FOLDERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Alt Text (for accessibility)">
            <FormInput
              value={uploadAlt}
              onChange={setUploadAlt}
              placeholder="Description for screen readers / SEO"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <Button variant="outline" type="button" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile || uploading} loading={uploading}>
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setPreviewItem(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewItem.url}
              alt={previewItem.alt || previewItem.filename || 'media'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-sm">
              <p className="font-medium">{previewItem.filename || 'Untitled'}</p>
              <p className="text-xs text-gray-500 font-mono break-all">{previewItem.url}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                {previewItem.folder && <span>Folder: <strong>{previewItem.folder}</strong></span>}
                {previewItem.size && <span>Size: <strong>{formatBytes(previewItem.size)}</strong></span>}
                {previewItem.mimeType && <span>Type: <strong>{previewItem.mimeType}</strong></span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
