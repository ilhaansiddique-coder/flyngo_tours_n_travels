export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function toYouTubeEmbed(url?: string | null): string | null {
  if (!url) return null;
  if (/^https:\/\/(?:www\.)?youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}/.test(url)) return url;
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}