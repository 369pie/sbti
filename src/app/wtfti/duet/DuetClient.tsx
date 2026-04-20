'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { HOME_PLANET_CATALOG, type HomePlanetEntry } from '@/lib/wtfi/galaxy-planets';
import { getDeity } from '@/lib/wtfi/pantheon';
import {
  calcSoulResonance,
  decodeSoulAnswers,
  encodeSoulAnswers,
  type SoulAnswers,
} from '@/lib/wtfi/soul-resonance';
import { readGS } from '@/lib/wtfi/soul-resonance';
import { loadCard } from '@/lib/wtf-card';
import { withBasePath } from '@/lib/site';

const SOUL_KEY = 'wtfti.soul.answers.v1';

function cosine(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
}

function planetGravity(a: HomePlanetEntry, b: HomePlanetEntry): number {
  const va = [a.defaultAxesVector.W, a.defaultAxesVector.T, a.defaultAxesVector.F, a.defaultAxesVector.I];
  const vb = [b.defaultAxesVector.W, b.defaultAxesVector.T, b.defaultAxesVector.F, b.defaultAxesVector.I];
  const cos = cosine(va, vb);
  // squash to [0,1]
  return +((cos + 1) / 2).toFixed(3);
}

function PairSigil({
  accentA,
  accentB,
  size = 200,
}: {
  accentA: string;
  accentB: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Pair Sigil 双神融合印记"
    >
      <defs>
        <radialGradient id="leftGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentA} stopOpacity="0.85" />
          <stop offset="100%" stopColor={accentA} stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id="rightGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentB} stopOpacity="0.85" />
          <stop offset="100%" stopColor={accentB} stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <circle cx={cx - r * 0.45} cy={cy} r={r} fill="url(#leftGrad)" />
      <circle cx={cx + r * 0.45} cy={cy} r={r} fill="url(#rightGrad)" />
      {/* outer ring */}
      <circle cx={cx} cy={cy} r={r * 1.4} fill="none" stroke="#C9A676" strokeWidth={0.8} opacity={0.6} />
      <circle cx={cx} cy={cy} r={r * 1.55} fill="none" stroke="#C9A676" strokeWidth={0.4} opacity={0.35} />
      {/* center spark */}
      <circle cx={cx} cy={cy} r={3} fill="#F5F0E8" />
      <circle cx={cx} cy={cy} r={6} fill="none" stroke="#F5F0E8" strokeWidth={0.6} opacity={0.5} />
    </svg>
  );
}

interface HostPayload {
  planet: string;
  soul: string;
  nick?: string;
}

function decodeHost(param: string | null): HostPayload | null {
  if (!param) return null;
  try {
    const json = atob(param.replace(/-/g, '+').replace(/_/g, '/'));
    const obj = JSON.parse(json) as HostPayload;
    if (typeof obj.planet === 'string' && typeof obj.soul === 'string') return obj;
    return null;
  } catch {
    return null;
  }
}

function encodeHost(payload: HostPayload): string {
  const json = JSON.stringify(payload);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function DuetClient() {
  const [mySlug, setMySlug] = useState<string | null>(null);
  const [mySoul, setMySoul] = useState<SoulAnswers>({});
  const [myNick, setMyNick] = useState('');
  const [host, setHost] = useState<HostPayload | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const h = decodeHost(params.get('h'));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHost(h);
    const card = loadCard();
    const slug = card?.results?.wtfti?.slug ?? null;
    if (slug && HOME_PLANET_CATALOG.some((p) => p.slug === slug)) {
       
      setMySlug(slug);
    }
    try {
      const raw = window.localStorage.getItem(SOUL_KEY);
      if (raw) {
         
        setMySoul(decodeSoulAnswers(raw));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const myPlanet = mySlug ? HOME_PLANET_CATALOG.find((p) => p.slug === mySlug) ?? null : null;
  const hostPlanet = host
    ? HOME_PLANET_CATALOG.find((p) => p.slug === host.planet) ?? null
    : null;
  const hostSoul = useMemo(() => (host ? decodeSoulAnswers(host.soul) : {}), [host]);

  const mode: 'host' | 'guest' | 'reveal' | 'needs-test' = useMemo(() => {
    if (!myPlanet) return 'needs-test';
    if (host && hostPlanet) return 'reveal';
    return 'host';
  }, [myPlanet, host, hostPlanet]);

  function buildShareUrl() {
    if (!myPlanet) return;
    const payload: HostPayload = {
      planet: myPlanet.slug,
      soul: encodeSoulAnswers(mySoul),
      nick: myNick.trim().slice(0, 12) || undefined,
    };
    const code = encodeHost(payload);
    const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
    const url = `${base}/?h=${code}`;
    setShareUrl(url);
  }

  async function handleShare() {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'WTFTI · 召唤合奏',
          text: '我邀请你和我做一次双人神域共鸣 ✦',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      } catch {
        /* ignore */
      }
    }
  }

  // Reveal mode computations
  const reveal = useMemo(() => {
    if (mode !== 'reveal' || !myPlanet || !hostPlanet) return null;
    const G = planetGravity(myPlanet, hostPlanet);
    const S = calcSoulResonance(mySoul, hostSoul);
    const reading = readGS(G, S);
    return { G, S, reading };
  }, [mode, myPlanet, hostPlanet, mySoul, hostSoul]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
        padding: '56px 20px 96px',
      }}
    >
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.42em',
            color: '#C9A676',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          ✦ Convergence Duet · WTFTI ✦
        </p>
        <h1
          style={{
            margin: '14px 0 6px',
            textAlign: 'center',
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          召唤合奏
        </h1>
        <p
          style={{
            margin: '0 auto 26px',
            maxWidth: 420,
            textAlign: 'center',
            fontSize: 13,
            color: 'rgba(245,240,232,0.7)',
            lineHeight: 1.7,
            fontFamily: 'Noto Serif SC, serif',
          }}
        >
          你和 ta 各召唤一位主神 ——
          <br />
          引力 G · 共鸣 S · 一枚专属于你们俩的 Pair Sigil。
        </p>

        {mode === 'needs-test' ? (
          <div
            style={{
              padding: 16,
              border: '1px dashed rgba(201,166,118,0.4)',
              borderRadius: 12,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 13,
                color: 'rgba(245,240,232,0.78)',
                fontFamily: 'Noto Serif SC, serif',
              }}
            >
              要先做一次 90 秒主神召唤，
              <br />
              才能发起你的合奏邀请。
            </p>
            <Link
              href="/wtfti/galaxy/test/"
              style={{
                display: 'inline-block',
                padding: '10px 22px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 4,
                color: '#1a1530',
                background: 'linear-gradient(135deg, #C9A676 0%, #C07A8E 100%)',
                border: 'none',
                borderRadius: 999,
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              ✦ 先去召唤主神
            </Link>
          </div>
        ) : null}

        {mode === 'host' && myPlanet ? (
          <section
            aria-label="发起合奏"
            style={{
              padding: 18,
              borderRadius: 14,
              border: '1px solid rgba(201,166,118,0.35)',
              background: 'rgba(255,255,255,0.03)',
              display: 'grid',
              gap: 12,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontFamily: 'Noto Serif SC, serif',
                lineHeight: 1.6,
              }}
            >
              你的主星：
              <strong style={{ color: myPlanet.accent, fontWeight: 600 }}>
                {' '}
                {myPlanet.name}
              </strong>
            </p>
            <input
              type="text"
              placeholder="给 ta 留个称呼（可选 ≤ 12 字）"
              maxLength={12}
              value={myNick}
              onChange={(e) => setMyNick(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(245,240,232,0.18)',
                background: 'rgba(26,21,48,0.5)',
                color: '#F5F0E8',
                fontSize: 13,
                fontFamily: 'Noto Serif SC, serif',
              }}
            />
            <button
              type="button"
              onClick={buildShareUrl}
              style={{
                padding: '12px',
                borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #C9A676 0%, #C07A8E 100%)',
                color: '#1a1530',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              ✦ 生成你的合奏邀请
            </button>
            {shareUrl ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: 'rgba(245,240,232,0.7)',
                    fontFamily: 'Noto Serif SC, serif',
                    wordBreak: 'break-all',
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {shareUrl}
                </p>
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    padding: '10px',
                    borderRadius: 999,
                    border: '1px solid #C9A676',
                    background: 'transparent',
                    color: '#C9A676',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ 已复制' : '✦ 复制 / 分享给 ta'}
                </button>
              </div>
            ) : null}
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: 'rgba(245,240,232,0.5)',
                lineHeight: 1.55,
                fontFamily: 'Noto Serif SC, serif',
              }}
            >
              ✦ ta 打开链接 → 也做一次召唤 → 双方屏幕显示同一枚 Pair Sigil。
            </p>
          </section>
        ) : null}

        {mode === 'reveal' && reveal && myPlanet && hostPlanet ? (
          <RevealView
            myPlanet={myPlanet}
            hostPlanet={hostPlanet}
            hostNick={host?.nick ?? null}
            G={reveal.G}
            S={reveal.S}
            reading={reveal.reading}
          />
        ) : null}

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Link
            href="/wtfti/profile/"
            style={{
              fontSize: 11,
              color: '#9C7CFF',
              fontWeight: 700,
              letterSpacing: 4,
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            ✦ 我的五感档案
          </Link>
          <Link
            href="/wtfti/moon/"
            style={{
              fontSize: 11,
              color: '#C9A676',
              fontWeight: 700,
              letterSpacing: 4,
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            ✦ 月相章节
          </Link>
        </div>
      </div>
    </main>
  );
}

function RevealView({
  myPlanet,
  hostPlanet,
  hostNick,
  G,
  S,
  reading,
}: {
  myPlanet: HomePlanetEntry;
  hostPlanet: HomePlanetEntry;
  hostNick: string | null;
  G: number;
  S: number;
  reading: ReturnType<typeof readGS>;
}) {
  const myDeity = getDeity(myPlanet.slug);
  const hostDeity = getDeity(hostPlanet.slug);
  return (
    <section
      aria-label="召唤合奏结果"
      style={{
        padding: 18,
        borderRadius: 16,
        background:
          'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
        border: '1px solid rgba(245,240,232,0.1)',
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12 }}>
        <PairSigil accentA={hostPlanet.accent} accentB={myPlanet.accent} size={200} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <DeityChip planet={hostPlanet} nick={hostNick ?? '邀请人'} />
        <DeityChip planet={myPlanet} nick="你" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          margin: '0 0 14px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: 10,
            borderRadius: 12,
            border: '1px solid rgba(201,166,118,0.4)',
            background: 'rgba(201,166,118,0.08)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: '#C9A676',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ✦ Gravity
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 28,
              fontWeight: 600,
              color: '#F5F0E8',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            G = {G.toFixed(2)}
          </p>
        </div>
        <div
          style={{
            padding: 10,
            borderRadius: 12,
            border: '1px solid rgba(192,122,142,0.4)',
            background: 'rgba(192,122,142,0.08)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: '#C07A8E',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ✦ Soul
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 28,
              fontWeight: 600,
              color: '#F5F0E8',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            S = {S.toFixed(2)}
          </p>
        </div>
      </div>

      <div
        style={{
          padding: '14px 16px',
          borderRadius: 12,
          background: 'rgba(26,21,48,0.5)',
          border: '1px solid rgba(245,240,232,0.08)',
          marginBottom: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.32em',
            color: reading.rare ? '#C07A8E' : '#9C7CFF',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          ✦ {reading.rare ? '稀有相会' : '相处坐标'}
        </p>
        <h2
          style={{
            margin: '6px 0 8px',
            fontSize: 22,
            fontWeight: 600,
            color: '#F5F0E8',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
          }}
        >
          {reading.title}
        </h2>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 13,
            color: '#F5F0E8',
            lineHeight: 1.7,
            fontFamily: 'Noto Serif SC, serif',
          }}
        >
          {reading.narration}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(245,240,232,0.65)',
            lineHeight: 1.55,
            fontFamily: 'Noto Serif SC, serif',
            fontStyle: 'italic',
          }}
        >
          {reading.literaryQuote}
        </p>
      </div>

      <p
        style={{
          margin: 0,
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(245,240,232,0.55)',
          fontFamily: 'Noto Serif SC, serif',
          lineHeight: 1.6,
        }}
      >
        把这一页截图 — 这是仅属于你和{' '}
        <strong style={{ color: '#C9A676' }}>{hostNick ?? 'ta'}</strong> 的 Pair Sigil。
      </p>

      <p
        style={{
          margin: '14px 0 0',
          textAlign: 'center',
          fontSize: 10,
          color: 'rgba(245,240,232,0.4)',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.2em',
        }}
      >
        {hostDeity?.eastern.name ?? '?'} ⚭ {myDeity?.eastern.name ?? '?'}
      </p>
    </section>
  );
}

function DeityChip({ planet, nick }: { planet: HomePlanetEntry; nick: string }) {
  const deity = getDeity(planet.slug);
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        background: `${planet.accent}14`,
        border: `1px solid ${planet.accent}55`,
        display: 'grid',
        gridTemplateColumns: '44px 1fr',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.4)',
          position: 'relative',
        }}
      >
        <NextImage
          src={withBasePath(planet.cardImageUrl)}
          alt={planet.name}
          fill
          sizes="44px"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div style={{ overflow: 'hidden' }}>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: planet.accent,
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {nick}
        </p>
        <p
          style={{
            margin: '3px 0 0',
            fontSize: 13,
            fontWeight: 600,
            color: '#F5F0E8',
            fontFamily: 'Noto Serif SC, serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {planet.name}
        </p>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 11,
            color: 'rgba(245,240,232,0.6)',
            fontFamily: 'Noto Serif SC, serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          主神 {deity?.eastern.name ?? '—'}
        </p>
      </div>
    </div>
  );
}
