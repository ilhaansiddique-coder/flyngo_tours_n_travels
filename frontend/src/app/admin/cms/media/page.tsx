'use client';

import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Image, Upload } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  alt?: string;
  width?: number;
  height?: number;
}

export default function MediaPage() {
  const { getTours, getHotels } = useApi();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extractImages = (items: any[], source: string): MediaItem[] => {
    const result: MediaItem[] = [];
    items.forEach((item) => {
      const images: any[] = item.images ?? item.photos ?? [];
      images.forEach((img: any, idx: number) => {
        const url = typeof img === 'string' ? img : img.url ?? img.src ?? '';
        if (!url) return;
        result.push({
          id: `${source}-${item.id ?? item._id}-${idx}`,
          url,
          name: typeof img === 'string'
            ? (url.split('/').pop() || url)
            : img.name ?? img.alt ?? (url.split('/').pop() || url),
          alt: typeof img === 'string' ? undefined : img.alt ?? img.caption,
          width: typeof img === 'string' ? undefined : img.width,
          height: typeof img === 'string' ? undefined : img.height,
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
        getTours().catch(() => ({ data: [] })),
        getHotels().catch(() => ({ data: [] })),
      ]);

      const toursData = toursRes as any;
      const hotelsData = hotelsRes as any;

      const tourItems = Array.isArray(toursData)
        ? toursData
        : toursData?.data ?? toursData?.tours ?? [];
      const hotelItems = Array.isArray(hotelsData)
        ? hotelsData
        : hotelsData?.data ?? hotelsData?.hotels ?? [];

      const tourImages = extractImages(tourItems, 'tour');
      const hotelImages = extractImages(hotelItems, 'hotel');

      setMedia([...tourImages, ...hotelImages]);
    } catch (err: any) {
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const truncateUrl = (url: string, max = 40) => {
    return url.length > max ? url.slice(0, max) + '...' : url;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div />
        <Button size="md" className="gap-2">
          <Upload className="w-4 h-4" /> Upload
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchMedia}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && media.length === 0 && (
        <Card hover={false}>
          <div className="text-center py-12">
            <Image className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">No media found</p>
          </div>
        </Card>
      )}

      {!loading && !error && media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {media.map((m) => (
            <Card key={m.id} hover className="group">
              <div className="h-32 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-3 overflow-hidden relative">
                <Image className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-xs font-medium truncate text-gray-900 dark:text-white">
                {m.name}
              </p>
              {m.alt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {m.alt}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate font-mono">
                {truncateUrl(m.url)}
              </p>
              {(m.width || m.height) && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {m.width && m.height ? `${m.width}x${m.height}` : m.width || m.height}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
