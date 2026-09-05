import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import type { HomeVideo } from '@/types';

export async function VideoSection({ videos }: { videos: HomeVideo[] }) {
  const lang = await getServerLang();
  const video = videos?.[0];
  if (!video?.youtubeUrl) return null;

  const badge = pickField(lang, video.badgeEn, video.badgeBn);
  const title = pickField(lang, video.titleEn, video.titleBn);

  return (
    <section className="section-pad bg-[var(--color-mist)]">
      <div className="container-site">
        <div className="text-center">
          {badge ? (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#4a3008]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              {badge}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          ) : null}
        </div>
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
          <iframe
            src={video.youtubeUrl}
            title={title}
            className="aspect-video w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}