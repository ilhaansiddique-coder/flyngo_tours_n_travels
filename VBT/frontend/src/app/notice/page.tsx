import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { getNotices } from '@/lib/get-site';
import { formatDate, pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';

export default async function NoticePage() {
  const lang = await getServerLang();
  const notices = await getNotices();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'নোটিশ' : 'Notices'}
        subtitle={lang === 'bn' ? 'ঘোষণা ও গুরুত্বপূর্ণ আপডেট।' : 'Announcements and important updates.'}
      />
      <section className="section-pad">
        <div className="container-site max-w-3xl space-y-4">
          {notices.map((notice) => {
            const title = pickField(lang, notice.titleEn, notice.titleBn);
            const content = pickField(lang, notice.contentEn, notice.contentBn);
            return (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className="block rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                  {formatDate(notice.publishedAt, lang)}
                </p>
                <h2 className="mt-1 text-lg font-bold">{title}</h2>
                {content ? (
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--color-ink-soft)]">{content}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
