'use client';

/**
 * PairInvitePreview · 好友邀请预览卡
 *
 * 当好友通过 ?friend=<homeSlug>.<soulCode> 落地到 /wtfti/galaxy/test/ 时，
 * 在召唤仪式入口先看到「Ta 是谁 · 一句侧写 · 主神归属 · Soul Probe 一题片段」，
 * 再被引导开始测试，测完跳转 /wtfti/galaxy/pair/<a>/<b>/ 看你们的引力 G。
 *
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §8 配对裂变
 */

import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { getHomePlanet } from '@/lib/wtfi/galaxy-planets';
import { getDeity } from '@/lib/wtfi/pantheon';
import {
  SOUL_PROBE_QUESTIONS,
  decodeSoulAnswers,
  type SoulAnswers,
} from '@/lib/wtfi/soul-resonance';

interface Props {
  /** ?friend= 原始值，形如 `home-storm-harbor.B3D_AC` */
  raw: string;
}

export function PairInvitePreview({ raw }: Props) {
  const view = useMemo(() => buildView(raw), [raw]);
  if (!view) return null;
  const { planet, deity, probe } = view;

  return (
    <section style={card} aria-label="好友邀请预览">
      <p style={eyebrow}>✦ AN INVITATION FROM A KINDRED SOUL</p>

      <h2 style={title}>
        Ta 已经召唤过自己的人格神域，
        <br />
        <em style={em}>现在邀请你 — 来看你们的引力。</em>
      </h2>

      <div style={planetRow}>
        <div
          style={{
            ...orb,
            background: `radial-gradient(circle at 30% 30%, ${planet.accent} 0%, #1a1530 75%)`,
            boxShadow: `0 0 60px ${planet.accent}55, inset 0 0 40px rgba(201,166,118,0.18)`,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {deity && (
            <p style={deityLine}>
              <span style={deityGlyph}>{deity.sigilGlyph}</span>
              <span>
                主神 · <em style={em}>{deity.eastern.name}</em>
                <span style={deityLatin}> {deity.western.latin}</span>
              </span>
            </p>
          )}
          <h3 style={planetName}>{planet.name}</h3>
          <p style={planetHeadline}>{planet.headline}</p>
        </div>
      </div>

      {probe && (
        <div style={probeBox}>
          <p style={probeEyebrow}>{probe.q.eyebrow} · TA 的选择</p>
          <p style={probeQ}>{probe.q.prompt}</p>
          <p style={probeA}>
            <em style={emGold}>{probe.opt.label}</em>
            {probe.opt.blurb ? (
              <span style={probeBlurb}> — {probe.opt.blurb}</span>
            ) : null}
          </p>
        </div>
      )}

      <p style={hint}>
        ✶ 完成下面这场 90 秒召唤仪式，我们会算出你和 Ta 的人格引力 G、灵魂频率 S。
      </p>
    </section>
  );
}

function buildView(raw: string) {
  if (!raw) return null;
  const [seedRaw, soulRaw] = raw.split('.');
  if (!seedRaw) return null;
  const planet = getHomePlanet(seedRaw);
  if (!planet) return null;
  const soul: SoulAnswers = decodeSoulAnswers(soulRaw);
  const deity = getDeity(planet.slug);
  let probe: { q: (typeof SOUL_PROBE_QUESTIONS)[number]; opt: (typeof SOUL_PROBE_QUESTIONS)[number]['options'][number] } | null = null;
  for (const q of SOUL_PROBE_QUESTIONS) {
    const a = soul[q.id];
    if (a && a !== 'SKIP') {
      const opt = q.options.find((o) => o.key === a);
      if (opt) {
        probe = { q, opt };
        break;
      }
    }
  }
  return { planet, soul, deity, probe };
}

const card: CSSProperties = {
  position: 'relative',
  margin: '0 auto 32px',
  padding: '28px 24px 26px',
  maxWidth: 540,
  borderRadius: 18,
  background:
    'linear-gradient(180deg, rgba(192,122,142,0.12) 0%, rgba(26,21,48,0.65) 60%)',
  border: '1px solid rgba(201,166,118,0.28)',
  boxShadow: '0 24px 60px -28px rgba(192,122,142,0.45)',
  color: '#F5F0E8',
};

const eyebrow: CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: '0.36em',
  textTransform: 'uppercase',
  color: '#C9A676',
  fontWeight: 500,
};

const title: CSSProperties = {
  margin: '12px 0 22px',
  fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
  fontSize: 22,
  lineHeight: 1.4,
  fontWeight: 500,
  color: '#F5F0E8',
};

const em: CSSProperties = {
  fontStyle: 'italic',
  color: '#F5F0E8',
  fontWeight: 600,
};

const emGold: CSSProperties = {
  fontStyle: 'italic',
  color: '#C9A676',
  fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
};

const planetRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  margin: '0 0 18px',
};

const orb: CSSProperties = {
  flexShrink: 0,
  width: 64,
  height: 64,
  borderRadius: '50%',
};

const deityLine: CSSProperties = {
  margin: '0 0 4px',
  fontSize: 12,
  color: 'rgba(245,240,232,0.72)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const deityGlyph: CSSProperties = {
  fontSize: 16,
  color: '#C9A676',
};

const deityLatin: CSSProperties = {
  marginLeft: 4,
  fontStyle: 'italic',
  color: 'rgba(201,166,118,0.7)',
  fontFamily: 'Cormorant Garamond, serif',
};

const planetName: CSSProperties = {
  margin: '2px 0 4px',
  fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
  fontSize: 20,
  fontWeight: 500,
  color: '#F5F0E8',
};

const planetHeadline: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.55,
  color: 'rgba(245,240,232,0.78)',
};

const probeBox: CSSProperties = {
  marginTop: 6,
  padding: '14px 16px',
  borderRadius: 12,
  background: 'rgba(26,21,48,0.55)',
  border: '1px dashed rgba(201,166,118,0.28)',
};

const probeEyebrow: CSSProperties = {
  margin: 0,
  fontSize: 10,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'rgba(201,166,118,0.85)',
};

const probeQ: CSSProperties = {
  margin: '6px 0 8px',
  fontSize: 14,
  color: 'rgba(245,240,232,0.85)',
  lineHeight: 1.5,
};

const probeA: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: '#F5F0E8',
  lineHeight: 1.5,
};

const probeBlurb: CSSProperties = {
  fontSize: 12,
  color: 'rgba(245,240,232,0.65)',
  fontStyle: 'italic',
};

const hint: CSSProperties = {
  margin: '20px 0 0',
  fontSize: 12,
  color: 'rgba(245,240,232,0.62)',
  textAlign: 'center',
  fontStyle: 'italic',
};
