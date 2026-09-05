import { SectionHeader } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import type { Institution } from '@/types';

export async function InstitutionsSection({ institutions }: { institutions: Institution[] }) {
  if (!institutions?.length) return null;

  return (
    <section className="section-pad bg-[var(--color-primary-darker)]">
      <div className="container-site">
        <SectionHeader title="Our Institutions" light />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {institutions.map((inst) => (
            <a
              key={inst.id}
              href={inst.website}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-white/5 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-2">
                {inst.logo ? (
                  <img src={assetUrl(inst.logo)} alt={inst.name} className="h-full w-full object-contain" />
                ) : null}
              </div>
              <h3 className="text-lg font-bold text-white">{inst.name}</h3>
              {inst.description ? (
                <p className="mt-3 text-sm leading-relaxed text-white/70">{inst.description}</p>
              ) : null}
              <span className="mt-4 inline-block text-sm font-bold text-[var(--color-gold-deep)] transition-colors group-hover:text-white">
                Visit website →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}