'use client';

import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { Image, Upload, Search, Trash2, Copy, ExternalLink, X } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  alt?: string;
  source: 'tour' | 'hotel' | 'uploaded';
  sourceId?: string;
  selected?: boolean;
}

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024; // 2MB

export default function MediaPage() {
  const { getTours, getHotels } = useApi();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);

  const extractImages = (items: any[], source: 'tour' | 'hotel'): MediaItem[] => {
    const result: MediaItem[] = [];
    items.forEach((item) => {
      const images: any[] = item.images ?? item.photos ?? [];
      images.forEach((img: any, idx: number) => {
        const url = typeof img === 'string' ? img : img.url ?? img.src ?? '';
        if (!url) return;
        result.push({
          id: `${source}-${item.id ?? `unknown-${idx}`}-${idx}`,
          url,
          name: typeof img === 'string'
            ? (url.split('/').pop() || url)
            : img.name ?? img.alt ?? (url.split('/').pop() || url),
          alt: typeof img === 'string' ? undefined : img.alt ?? img.caption,
          source,
          sourceId: item.id,
        });
      });
    });
    return result;
  };

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const [toursRes, hotelsRes] = await Promise.all([
        getTours().catch(() => ({ items: [] })),
        getHotels().catch(() => ({ items: [] })),
      ]);

      const toursData = toursRes as any;
      const hotelsData = hotelsRes as any;

      const tourItems = Array.isArray(toursData) ? toursData : toursData?.items ?? toursData?.data ?? toursData?.tours ?? [];
      const hotelItems = Array.isArray(hotelsData) ? hotelsData : hotelsData?.items ?? hotelsData?.data ?? hotelsData?.hotels ?? [];

      const tourImages = extractImages(tourItems, 'tour');
      const hotelImages = extractImages(hotelItems, 'hotel');

      setMedia([...uploadedMedia, ...tourImages, ...hotelImages]);
    } catch (err: any) {
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedMedia.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      setError('File too large. Maximum 2MB allowed for in-browser storage.');
      return;
    }
    setUploadFile(file);
    setUploadName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!uploadFile || !uploadPreview) return;
    const newItem: MediaItem = {
      id: `uploaded-${Date.now()}`,
      url: uploadPreview,
      name: uploadName || uploadFile.name,
      alt: uploadAlt || undefined,
      source: 'uploaded',
    };
    setUploadedMedia((prev) => [newItem, ...prev]);
    setUploadOpen(false);
    setUploadFile(null);
    setUploadName('');
    setUploadAlt('');
    setUploadPreview('');
  };

  const handleDelete = (id: string) => {
    if (id.startsWith('uploaded-')) {
      setUploadedMedia((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const truncateUrl = (url: string, max = 40) => {
    if (!url) return '';
    if (url.length > max) return url.slice(0, max) + '...';
    return url;
  };

  const filtered = media
    .filter((m) => sourceFilter === 'all' || m.source === sourceFilter)
    .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.url.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search media..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="all">All Sources</option>
            <option value="uploaded">My Uploads</option>
            <option value="tour">Tour Images</option>
            <option value="hotel">Hotel Images</option>
          </select>
        </div>
        <Button size="md" className="gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="w-4 h-4" /> Upload Media
        </Button>
      </div>

      {error && (
        <Card hover={false}>
          <div className="text-center py-6">
            <p className="text-red-500 text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>Dismiss</Button>
          </div>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card hover={false}>
          <div className="text-center py-12">
            <Image className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No media found</p>
          </div>
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((m) => (
            <Card key={m.id} hover className="group">
              <div
                className="h-32 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-3 overflow-hidden relative cursor-pointer"
                onClick={() => setPreviewItem(m)}
              >
                {m.url.startsWith('data:') || m.url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ? (
                  <img src={m.url} alt={m.alt || m.name} className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-8 h-8 text-white/60" />
                )}
                {m.source === 'uploaded' && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500 text-white">
                    UPLOADED
                  </span>
                )}
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/50 text-white uppercase">
                  {m.source}
                </span>
              </div>
              <p className="text-xs font-medium truncate" title={m.name}>{m.name}</p>
              {m.alt && <p className="text-xs text-gray-500 truncate">{m.alt}</p>}
              <p className="text-xs text-gray-400 truncate font-mono" title={m.url}>{truncateUrl(m.url, 32)}</p>
              <div className="flex gap-1 mt-2">
                <button
                  className="flex-1 p-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600 flex items-center justify-center gap-1"
                  onClick={() => copyToClipboard(m.url)}
                  title="Copy URL"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 p-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600 flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open
                </a>
                {m.source === 'uploaded' && (
                  <button
                    className="p-1.5 rounded text-xs hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                    onClick={() => handleDelete(m.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Media">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Image File (max 2MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg p-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-brand-50 file:text-brand-700"
            />
          </div>
          {uploadPreview && (
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={uploadPreview} alt="preview" className="w-full h-48 object-cover" />
            </div>
          )}
          <FormField label="Name">
            <FormInput
              value={uploadName}
              onChange={setUploadName}
              placeholder="Image name"
            />
          </FormField>
          <FormField label="Alt Text (for accessibility)">
            <FormInput
              value={uploadAlt}
              onChange={setUploadAlt}
              placeholder="Description for screen readers / SEO"
            />
          </FormField>
          <p className="text-xs text-gray-500 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-2">
            <strong>Note:</strong> Files are stored as data URLs in your browser session. For production, configure Cloudflare R2 (keys in <code className="font-mono">.env</code>) for permanent CDN hosting.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!uploadFile}>Upload</Button>
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
            {previewItem.url.startsWith('data:') || previewItem.url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ? (
              <img src={previewItem.url} alt={previewItem.alt || previewItem.name} className="max-w-full max-h-[80vh] object-contain" />
            ) : (
              <div className="w-96 h-96 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <Image className="w-24 h-24 text-white/60" />
              </div>
            )}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-sm">
              <p className="font-medium">{previewItem.name}</p>
              <p className="text-xs text-gray-500 font-mono break-all">{previewItem.url}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
