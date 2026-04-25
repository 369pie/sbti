import Link from 'next/link';
import NextImage from 'next/image';

type Stat = {
  value: string;
  label: string;
};

type Feature = {
  mark: string;
  title: string;
  desc: string;
};

type PreviewItem = {
  href: string;
  name: string;
  code: string;
  color: string;
  tagline?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type Props = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
  testHref: string;
  backHref?: string;
  backLabel?: string;
  stats: Stat[];
  features: Feature[];
  previewTitle: string;
  previewSubtitle?: string;
  previewItems: PreviewItem[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
};

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

export function WtftiUniverseLanding({
  eyebrow,
  title,
  accentTitle,
  description,
  testHref,
  backHref = '/wtfti/',
  backLabel = '返回人格神域',
  stats,
  features,
  previewTitle,
  previewSubtitle,
  previewItems,
  ctaTitle,
  ctaBody,
  ctaHref,
}: Props) {
  const heroItems = previewItems.slice(0, 3);

  return (
    <div>
      <section className="wtfti-section pt-16 md:pt-24">
        <div className="wtfti-wide-container grid items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-3xl animate-fade-up">
            <span className="wtfti-eyebrow">{eyebrow}</span>
            <h1 className="wtfti-display mt-6 text-[clamp(2.8rem,6.6vw,6rem)]">
              {title}
              <span className="block text-[0.62em] leading-[1.08]">
                <em>{accentTitle}</em>
              </span>
            </h1>
            <p className="wtfti-copy mt-7 max-w-[42rem]">{description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={testHref} className="wtfti-cta-primary">
                开始测试
                <span className="wtfti-arrow"><ArrowIcon className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href={backHref} prefetch={false} className="wtfti-cta-secondary">
                {backLabel}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px] animate-fade-up-delay-1">
            <div className="wtfti-orbit-field absolute inset-[6%] rounded-[2.5rem]" />
            <div className="absolute inset-x-[12%] top-[13%] h-px bg-[var(--galaxy-hairline)]" aria-hidden="true" />
            <div className="absolute inset-x-[18%] bottom-[13%] h-px bg-[var(--galaxy-hairline)]" aria-hidden="true" />
            {heroItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={[
                  'wtfti-mini-card absolute block w-[58%] overflow-hidden rounded-[1.35rem] p-2',
                  index === 0 ? 'left-0 top-[7%] rotate-[-5deg]' : '',
                  index === 1 ? 'right-0 top-[31%] rotate-[4deg]' : '',
                  index === 2 ? 'left-[13%] bottom-[7%] rotate-[-2deg]' : '',
                ].join(' ')}
              >
                <div className="grid aspect-[4/3] place-items-center rounded-[1rem] bg-bg-secondary/70 p-4">
                  {item.imageSrc ? (
                    <NextImage
                      src={item.imageSrc}
                      alt={item.imageAlt ?? item.name}
                      width={220}
                      height={220}
                      priority={index === 0}
                      className="h-full w-full object-contain drop-shadow-md"
                    />
                  ) : (
                    <span className="wtfti-roman text-5xl" style={{ color: item.color }}>{item.code}</span>
                  )}
                </div>
                <div className="min-w-0 px-1 pb-1 pt-2">
                  <div className="truncate text-[10px] font-mono text-text-muted">{item.code}</div>
                  <div className="truncate text-sm font-medium text-text-primary">{item.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="wtfti-section-tight">
        <div className="wtfti-container grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="wtfti-panel rounded-[1.25rem] px-5 py-6 text-center">
              <div className="stat-value text-3xl text-text-primary">{stat.value}</div>
              <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.24em] text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wtfti-section-tight">
        <div className="wtfti-container">
          <div className="mb-10 max-w-3xl">
            <span className="wtfti-eyebrow">Design Notes</span>
            <h2 className="wtfti-display mt-5 text-3xl md:text-5xl">同一套内核，换一种场景语言。</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((item, index) => (
              <div key={item.title} className="wtfti-card flex min-h-[180px] gap-5 rounded-[1.4rem] p-6 animate-fade-up" style={{ animationDelay: `${index * 70}ms` }}>
                <span className="wtfti-roman mt-1 text-4xl">{item.mark}</span>
                <span className="min-w-0">
                  <h3 className="text-xl font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{item.desc}</p>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wtfti-section-tight">
        <div className="wtfti-container">
          <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="wtfti-eyebrow">Preview</span>
              <h2 className="wtfti-display mt-5 text-3xl md:text-5xl">{previewTitle}</h2>
            </div>
            {previewSubtitle ? <p className="wtfti-copy max-w-xl text-sm">{previewSubtitle}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previewItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="wtfti-card group block overflow-hidden rounded-[1.25rem] p-3 animate-fade-up"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="grid aspect-square place-items-center overflow-hidden rounded-[1rem] bg-bg-secondary/65 p-4">
                  {item.imageSrc ? (
                    <NextImage
                      src={item.imageSrc}
                      alt={item.imageAlt ?? item.name}
                      width={240}
                      height={240}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      fetchPriority={index < 4 ? 'high' : 'auto'}
                      className="h-full w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="wtfti-roman text-4xl transition-transform duration-300 group-hover:scale-105" style={{ color: item.color }}>
                      {item.code}
                    </span>
                  )}
                </div>
                <div className="min-w-0 px-1 py-4">
                  <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: item.color }}>
                    {item.code}
                  </span>
                  <h3 className="mt-1 truncate text-sm font-semibold text-text-primary">{item.name}</h3>
                  {item.tagline ? <p className="mt-1 line-clamp-1 text-xs text-text-muted">{item.tagline}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="wtfti-section pb-20">
        <div className="wtfti-container">
          <div className="wtfti-panel rounded-[2rem] p-8 text-center md:p-12">
            <span className="wtfti-eyebrow justify-center">{eyebrow}</span>
            <h2 className="wtfti-display mx-auto mt-5 max-w-3xl text-3xl md:text-5xl">{ctaTitle}</h2>
            <p className="wtfti-copy mx-auto mt-5 max-w-2xl">{ctaBody}</p>
            <Link href={ctaHref} className="wtfti-cta-primary mt-8">
              开始测试
              <span className="wtfti-arrow"><ArrowIcon className="h-3.5 w-3.5" /></span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
