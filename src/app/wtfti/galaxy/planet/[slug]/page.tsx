import type { Metadata } from 'next';
import Link from 'next/link';
import NextImage from 'next/image';
import { notFound } from 'next/navigation';
import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { getAnchor } from '@/lib/wtfi/constellation-anchors';
import { pickLettersForPlanet } from '@/lib/wtfi/stardust-letters';
import { getDailyEphemeris } from '@/lib/wtfi/daily-ephemeris';
import { mockGalaxyFromHome } from '@/lib/wtfi/galaxy-preview';
import { getDeity } from '@/lib/wtfi/pantheon';
import { getSiteUrl } from '@/lib/site';
import { PantheonBadge } from '@/components/galaxy/PantheonBadge';
import { FragmentPalace } from '@/components/galaxy/FragmentPalace';
import { SoulSigil } from '@/components/galaxy/SoulSigil';
import PlanetLandingClient from './PlanetLandingClient';

export const dynamicParams = false;
export const revalidate = 86400; // daily — keeps ephemeris fresh

export function generateStaticParams() {
  return HOME_PLANET_CATALOG.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const planet = HOME_PLANET_CATALOG.find((p) => p.slug === slug);
  if (!planet) return {};
  const anchor = getAnchor(slug);
  const url = getSiteUrl(`/wtfti/galaxy/planet/${slug}/`);
  const constellationName = anchor?.constellation ?? '';
  const deity = getDeity(slug);
  const deityHook = deity
    ? `${deity.eastern.name}化身 · ${deity.western.name} · ${deity.occult.name}`
    : '';
  const title = deity
    ? `${planet.name} · ${deity.eastern.name} × ${deity.western.name}化身 · WTFTI 人格神域`
    : `${planet.name} · ${constellationName}人格 · WTFTI 人格星图`;
  const description = deity
    ? `${deityHook} — ${planet.headline}`
    : `${planet.headline} — ${planet.body.slice(0, 60)}…`;
  return {
    title,
    description,
    keywords: [
      planet.name,
      deity?.eastern.name,
      deity?.western.name,
      deity?.occult.name,
      `${constellationName}人格`,
      `${constellationName}的女生`,
      'WTFTI',
      'WTFTI 人格神域',
      'WTFTI 人格星图',
      '主神化身',
      '神性人格',
    ].filter(Boolean) as string[],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'WTFTI',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PlanetLandingPage({ params }: Props) {
  const { slug } = await params;
  const planet = HOME_PLANET_CATALOG.find((p) => p.slug === slug);
  if (!planet) notFound();

  const anchor = getAnchor(slug);
  const letters = pickLettersForPlanet(slug);
  const ephemeris = getDailyEphemeris(slug);
  const previewGalaxy = mockGalaxyFromHome(slug);
  const deity = getDeity(slug);

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
        padding: '64px 24px 96px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            letterSpacing: '0.42em',
            color: '#D4B58A',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          ✦ WTFTI · Personality Galaxy · {planet.code}
        </p>
        <h1
          style={{
            margin: '14px 0 8px',
            fontFamily: 'var(--font-display), serif',
            fontSize: 42,
            fontWeight: 500,
            letterSpacing: '0.04em',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {planet.name}
          {anchor && (
            <em
              style={{
                display: 'block',
                marginTop: 6,
                fontFamily: 'var(--font-display), serif',
                fontStyle: 'italic',
                fontSize: 18,
                color: planet.accent,
                letterSpacing: '0.06em',
              }}
            >
              本星归属 · {anchor.constellation} ({anchor.constellationLatin})
            </em>
          )}
        </h1>

        {deity && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <PantheonBadge slug={slug} />
          </div>
        )}
        <p
          style={{
            margin: '12px auto 32px',
            maxWidth: 560,
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 14,
            lineHeight: 1.85,
            color: 'rgba(245,240,232,0.8)',
            textAlign: 'center',
          }}
        >
          {planet.headline}
        </p>

        <NextImage
          src={planet.cardImageUrl}
          alt={`${planet.name}图鉴卡封面`}
          width={720}
          height={960}
          priority
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 24,
            border: `1px solid ${planet.accent}55`,
            boxShadow: `0 30px 80px -30px ${planet.accent}88`,
            display: 'block',
          }}
        />

        <p
          style={{
            margin: '28px 0 0',
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 14.5,
            lineHeight: 1.95,
            color: 'rgba(245,240,232,0.85)',
            letterSpacing: '0.02em',
          }}
        >
          {planet.body}
        </p>

        {deity && (
          <section
            style={{
              marginTop: 36,
              padding: '24px 22px',
              borderRadius: 18,
              background: `linear-gradient(155deg, ${planet.accent}18 0%, rgba(156,124,255,0.08) 100%)`,
              border: `1px solid ${planet.accent}55`,
            }}
          >
            <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.42em', color: '#D4B58A', textTransform: 'uppercase' }}>
              ✦ Tutelary Deity · 主神化身 · {deity.sigilGlyph}
            </p>
            <h2 style={{ margin: '8px 0 14px', fontFamily: 'var(--font-display), serif', fontStyle: 'italic', fontSize: 24, color: '#F5F0E8', letterSpacing: '0.04em' }}>
              {deity.eastern.name} · {deity.western.name} · {deity.occult.name}
            </h2>
            <p style={{ margin: '0 0 8px', fontSize: 13.5, color: 'rgba(245,240,232,0.85)', lineHeight: 1.85 }}>
              <strong style={{ color: planet.accent, fontWeight: 500 }}>神域职权 · </strong>
              {deity.domain}
            </p>
            <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'rgba(245,240,232,0.7)', lineHeight: 1.85 }}>
              <strong style={{ color: planet.accent, fontWeight: 500 }}>性格内核 · </strong>
              {deity.coreFour}
            </p>
            <ArchiveRow label="西神" body={`${deity.western.name} · ${deity.western.epithet}`} accent={planet.accent} />
            <ArchiveRow label="东神" body={`${deity.eastern.name} · ${deity.eastern.epithet}`} accent={planet.accent} />
            <ArchiveRow label="异能" body={`${deity.occult.name} — ${deity.occult.oneLiner}`} accent={planet.accent} />
          </section>
        )}

        {previewGalaxy && (
          <section
            style={{
              marginTop: 36,
              padding: '32px 18px 24px',
              borderRadius: 18,
              background: 'linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(15,10,34,0.5) 100%)',
              border: '1px solid rgba(201,166,118,0.22)',
            }}
          >
            <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.42em', color: '#D4B58A', textTransform: 'uppercase', textAlign: 'center' }}>
              ✦ Soul Sigil · 灵魂印记
            </p>
            <p style={{ margin: '8px auto 24px', maxWidth: 380, textAlign: 'center', fontSize: 12.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.65)', fontFamily: '"Noto Serif SC", serif' }}>
              这是属于「{planet.name}」类人格的几何咒符样式范例。
              <br />
              做完测试后，你会得到唯一属于你自己的版本。
            </p>
            <SoulSigil galaxy={previewGalaxy} size={300} />
          </section>
        )}

        {previewGalaxy && <FragmentPalaceWrapper galaxy={previewGalaxy} />}

        <section
          style={{
            marginTop: 40,
            padding: '28px 24px 26px',
            borderRadius: 18,
            background:
              'linear-gradient(155deg, rgba(192,122,142,0.16) 0%, rgba(156,124,255,0.12) 100%)',
            border: '1px solid rgba(192,122,142,0.4)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              letterSpacing: '0.42em',
              color: '#C07A8E',
              textTransform: 'uppercase',
            }}
          >
            ✦ Soul Probe · 灵魂频率
          </p>
          <h3
            style={{
              margin: '10px 0 6px',
              fontFamily: 'var(--font-display), serif',
              fontStyle: 'italic',
              fontSize: 26,
              color: '#F5F0E8',
              letterSpacing: '0.04em',
            }}
          >
            6 道签 · 60 秒 · 解锁你的灵魂频率
          </h3>
          <p
            style={{
              margin: '6px auto 18px',
              maxWidth: 420,
              fontSize: 13,
              color: 'rgba(245,240,232,0.78)',
              fontFamily: '"Noto Serif SC", serif',
              lineHeight: 1.85,
            }}
          >
            音乐 · 文学 · 颜色 · 电影 · 气味 · 触觉——
            <br />
            和 ta 答得越像，你们越接近「<span style={{ color: '#C9A676' }}>灵魂双星</span>」。
          </p>
          <Link
            href="/wtfti/galaxy/soul-probe/"
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              borderRadius: 999,
              border: '1px solid #C07A8E',
              background: '#C07A8E',
              color: '#1a1530',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            ✦ 去做灵魂探针 →
          </Link>
        </section>

        {anchor && (
          <section
            style={{
              marginTop: 40,
              padding: '24px 24px 22px',
              borderRadius: 18,
              background: 'linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(15,10,34,0.4) 100%)',
              border: '1px solid rgba(212,181,138,0.28)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                letterSpacing: '0.42em',
                color: '#D4B58A',
                textTransform: 'uppercase',
              }}
            >
              ✦ Constellation Archive
            </p>
            <h2
              style={{
                margin: '8px 0 16px',
                fontFamily: 'var(--font-display), serif',
                fontStyle: 'italic',
                fontSize: 22,
                color: '#F5F0E8',
                letterSpacing: '0.04em',
              }}
            >
              {anchor.constellation} · {anchor.constellationLatin}
            </h2>
            <ArchiveRow label="神话" body={anchor.myth} accent={planet.accent} />
            <ArchiveRow label="科学" body={anchor.science} accent={planet.accent} />
            <ArchiveRow label="文学" body={`「${anchor.literary.quote}」— ${anchor.literary.author}`} accent={planet.accent} />
          </section>
        )}

        {ephemeris && (
          <section
            style={{
              marginTop: 28,
              padding: '20px 24px',
              borderRadius: 16,
              background: `linear-gradient(180deg, ${planet.accent}10 0%, rgba(15,10,34,0.45) 100%)`,
              border: `1px solid ${planet.accent}33`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.42em', color: '#D4B58A', fontFamily: 'Inter, sans-serif' }}>
                ✦ TODAY&apos;S EPHEMERIS
              </p>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'rgba(245,240,232,0.4)' }}>
                {ephemeris.date}
              </span>
            </div>
            <h3 style={{ margin: '10px 0 6px', fontFamily: 'var(--font-display), serif', fontSize: 22 }}>
              {ephemeris.event.title}
            </h3>
            <p style={{ margin: '0 0 12px', fontFamily: '"Noto Serif SC", serif', fontSize: 13, lineHeight: 1.85, color: 'rgba(245,240,232,0.78)' }}>
              {ephemeris.event.narration}
            </p>
            <p
              style={{
                margin: 0,
                paddingLeft: 12,
                borderLeft: `2px solid ${planet.accent}77`,
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: planet.accent,
              }}
            >
              「{ephemeris.stardust.quote}」
              <span
                style={{
                  display: 'block',
                  marginTop: 4,
                  fontStyle: 'normal',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: 'rgba(245,240,232,0.5)',
                }}
              >
                — {ephemeris.stardust.author}
              </span>
            </p>
          </section>
        )}

        {letters.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                letterSpacing: '0.42em',
                color: '#D4B58A',
                textTransform: 'uppercase',
              }}
            >
              ✦ Stardust Letters
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              {letters.map((l) => (
                <blockquote
                  key={l.id}
                  style={{
                    margin: 0,
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: 'rgba(245,240,232,0.04)',
                    borderLeft: `2px solid ${planet.accent}77`,
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: 'italic',
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: '#F5F0E8',
                  }}
                >
                  「{l.quote}」
                  <span
                    style={{
                      display: 'block',
                      marginTop: 6,
                      fontStyle: 'normal',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      color: 'rgba(245,240,232,0.55)',
                    }}
                  >
                    — {l.author}
                  </span>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        <PlanetLandingClient slug={slug} accent={planet.accent} planetName={planet.name} />

        <nav style={{ marginTop: 56, textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              letterSpacing: '0.42em',
              color: '#D4B58A',
              textTransform: 'uppercase',
            }}
          >
            ✦ Other Planets
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '14px 0 0',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px 14px',
            }}
          >
            {HOME_PLANET_CATALOG.filter((p) => p.slug !== slug).map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/wtfti/galaxy/planet/${p.slug}/`}
                  style={{
                    color: 'rgba(245,240,232,0.7)',
                    fontFamily: 'var(--font-display), serif',
                    fontStyle: 'italic',
                    fontSize: 14,
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    borderBottom: `1px solid ${p.accent}55`,
                    paddingBottom: 2,
                  }}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}

function ArchiveRow({ label, body, accent }: { label: string; body: string; accent: string }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(245,240,232,0.06)' }}>
      <span
        style={{
          flexShrink: 0,
          width: 44,
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          letterSpacing: '0.32em',
          color: accent,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <p style={{ margin: 0, fontFamily: '"Noto Serif SC", serif', fontSize: 13, lineHeight: 1.8, color: 'rgba(245,240,232,0.82)' }}>
        {body}
      </p>
    </div>
  );
}

function FragmentPalaceWrapper({ galaxy }: { galaxy: ReturnType<typeof mockGalaxyFromHome> }) {
  if (!galaxy) return null;
  return (
    <div style={{ marginTop: 36 }}>
      <FragmentPalace galaxy={galaxy} />
    </div>
  );
}
