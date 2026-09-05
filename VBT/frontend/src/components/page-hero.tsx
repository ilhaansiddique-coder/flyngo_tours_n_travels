export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-black/5">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 80% at 20% 0%, rgba(9,144,74,0.16), transparent 60%), radial-gradient(ellipse 60% 80% at 90% 20%, rgba(232,182,93,0.2), transparent 60%), linear-gradient(180deg, #eef5f0 0%, #ffffff 100%)',
        }}
      />
      <div className="container-site relative z-10 px-6 py-14 text-center sm:py-20">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {subtitle ? (
          <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--color-ink-soft)] sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}