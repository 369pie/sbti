'use client';

/**
 * ShrineLongCard · 1080×2400 的神域长图分享卡
 *
 * 信息架构（小红书女性向 · 博物馆编辑）：
 *   I.   神域入场 Hero（主神名 · code · 暮紫光晕）
 *   II.  主神化身 · 东方 × 西方 × 异能者三联
 *   III. 神侍三位（最多 3）
 *   IV.  暗面副形（若已召唤，否则展示占位 + "未召唤"标签）
 *   V.   星座锚点 · 神话 + 文学引言
 *   VI.  今日月相 · 日课一行
 *   VII. 金箔署名 + 二维码占位 + wtfti.com
 *
 * 视觉：
 *   - 1080px 固定宽度；背景 galaxy-bg-paper；金色 hairline + 罗马数字 I–VII
 *   - 移动端父容器负责 zoom-out / scroll
 *
 * 用法：截屏保存 / 长按保存 / 或由 /api/galaxy/shrine-card 生成 PNG。
 */

import type { CSSProperties } from 'react';

import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';
import {
  getCompanionForMoon,
  getDeity,
  getShadowAvatar,
} from '@/lib/wtfi/pantheon';
import { CONSTELLATION_ANCHORS } from '@/lib/wtfi/constellation-anchors';
import type { HomePlanetSlug } from '@/lib/wtfi/constellation-anchors';
import { getDailyEphemeris } from '@/lib/wtfi/daily-ephemeris';
import { getSignaturePerfume } from '@/lib/wtfi/signature-perfume';
import { igniteFragments } from '@/lib/wtfi/fragment-palace';
import { SHARE_SITE_URL, getSiteLabel } from '@/lib/site';

interface Props {
  result: GalaxyResult;
  personalitySlug: string;
  /** 控制渲染缩放，默认 1；外层用 transform 缩放以适配小屏 */
  scale?: number;
}

export function ShrineLongCard({ result, personalitySlug, scale = 1 }: Props) {
  const deity = getDeity(result.homePlanet.slug);
  const anchor = CONSTELLATION_ANCHORS[result.homePlanet.slug as HomePlanetSlug];
  const ephemeris = getDailyEphemeris(result.homePlanet.slug);
  const shadow = result.shadow;
  const shadowAvatar = shadow ? getShadowAvatar(shadow.bucket) : null;
  const perfume = getSignaturePerfume(result.homePlanet.slug);

  return (
    <div
      role="img"
      aria-label={`${result.homePlanet.name} · 人格神域分享卡`}
      style={{
        width: 1080,
        height: 'max-content',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        background:
          'radial-gradient(ellipse 120% 70% at 50% 0%, #3F2F6B 0%, #1A1530 42%, #0F0A22 100%)',
        color: 'var(--color-bg-primary)',
        fontFamily:
          '"Cormorant Garamond", "Noto Serif SC", "Songti SC", serif',
        padding: '96px 80px 80px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow:
          '0 40px 120px -40px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,166,118,0.18)',
      }}
    >
      <OrbitDecor />
      <StardustDots />

      {/* I · Hero · 增强版 */}
      <section style={sectionStyle}>
        <RomanBadge numeral="I" label="你的神域" />
        <div style={{ textAlign: 'center' }}>
          <p style={eyebrowStyle}>
            WTFTI · PERSONAL PANTHEON · {result.homePlanet.code}
          </p>
          <h1 style={heroTitleStyle}>
            你是 <em style={{ fontStyle: 'italic' }}>{result.homePlanet.name}</em>
          </h1>
          <div style={heroOrbStyle} aria-hidden />
          <p style={heroQuoteStyle}>「{result.homePlanet.headline}」</p>
          <p style={heroBodyStyle}>{result.homePlanet.body}</p>
          {/* 新增：QR码占位 */}
          <div style={qrPlaceholderStyle} aria-hidden>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)' }}>
              ◆ QR CODE ◆
            </div>
          </div>
        </div>
      </section>

      <Hairline />

      {/* II · 主神化身三联 */}
      {deity && (
        <section style={sectionStyle}>
          <RomanBadge numeral="II" label="主神化身" />
          <div style={triGridStyle}>
            <TriCard
              eyebrow="EASTERN"
              glyph={deity.sigilGlyph}
              title={deity.eastern.name}
              subtitle={deity.eastern.epithet}
              tone="rose"
            />
            <TriCard
              eyebrow="WESTERN"
              glyph="✦"
              title={deity.western.name}
              subtitle={deity.western.epithet}
              tone="gold"
            />
            <TriCard
              eyebrow="OCCULT"
              glyph={deity.western.name === 'Hecate' ? '☽' : '☾'}
              title={deity.occult.name}
              subtitle={deity.occult.archetype}
              tone="violet"
            />
          </div>
          <p style={deityLineStyle}>{`"${deity.occult.oneLiner}"`}</p>
          <p style={domainLineStyle}>
            神域职权 · {deity.domain}　·　性格内核 · {deity.coreFour}
          </p>
        </section>
      )}

      <Hairline />

      {/* III · 神侣三位 · 增强版 */}
      {result.moons.length > 0 && (
        <section style={sectionStyle}>
          <RomanBadge numeral="III" label="随侍三神" />
          <p style={sectionIntroStyle}>
            三位侣神守护你的三个时辰
          </p>
          <div style={companionGridStyle}>
            {result.moons.slice(0, 3).map((m, idx) => {
              const c = getCompanionForMoon(m.slug);
              const tone = ['rose', 'gold', 'violet'][idx] as 'rose' | 'gold' | 'violet';
              const toneColor =
                tone === 'rose' ? 'var(--color-accent)' : tone === 'gold' ? 'var(--color-gold)' : '#9C7CFF';
              return (
                <div
                  key={m.slug}
                  style={{
                    textAlign: 'center',
                    padding: '24px 16px',
                    borderRadius: 18,
                    background: `linear-gradient(180deg, rgba(${tone === 'rose' ? '192,122,142' : tone === 'gold' ? '201,166,118' : '156,124,255'},0.08) 0%, rgba(26,21,48,0.4) 100%)`,
                    border: `1.5px solid ${toneColor}26`,
                    boxShadow: `0 0 30px ${toneColor}12, inset 0 1px 8px rgba(255,255,255,0.06)`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      letterSpacing: '0.3em',
                      color: toneColor,
                      opacity: 0.8,
                      margin: '0 0 4px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    时辰 {idx + 1}
                  </p>
                  <div
                    style={{
                      fontSize: 44,
                      color: toneColor,
                      marginBottom: 8,
                    }}
                  >
                    {c?.iconGlyph ?? '✶'}
                  </div>
                  <p
                    style={{
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 22,
                      margin: '0 0 6px',
                      color: 'var(--color-bg-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {c?.name ?? m.name}
                  </p>
                  <p
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontStyle: 'italic',
                      fontSize: 16,
                      lineHeight: 1.6,
                      margin: 0,
                      color: 'rgba(245,240,232,0.72)',
                    }}
                  >
                    {m.headline}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Hairline />

      {/* IV · 暗面副形 */}
      <section style={sectionStyle}>
        <RomanBadge numeral="IV" label="暗面化身" />
        {shadow && shadowAvatar ? (
          <div style={shadowCardStyle}>
            <p style={eyebrowStyle}>SHADOW · {shadowAvatar.archetype}</p>
            <h2 style={shadowTitleStyle}>{shadowAvatar.name}</h2>
            <div style={shadowGlyphStyle}>{shadowAvatar.iconGlyph}</div>
            <p style={shadowQuoteStyle}>「{shadowAvatar.oneLiner}」</p>
            <p style={shadowPowerStyle}>异能 · {shadowAvatar.power}</p>
          </div>
        ) : (
          <div style={shadowCardStyle}>
            <p style={eyebrowStyle}>SHADOW · LOCKED</p>
            <h2 style={shadowTitleStyle}>你还没召唤异能者</h2>
            <p style={shadowHintStyle}>
              再完成 12 签意识流，
              <br />
              让你深夜的那部分走出来。
            </p>
          </div>
        )}
      </section>

      <Hairline />

      {/* V · 星座 & 神话 */}
      {anchor && (
        <section style={sectionStyle}>
          <RomanBadge numeral="V" label="星座锚点" />
          <p style={constellationTitleStyle}>
            {anchor.constellation}
            <span style={constellationLatinStyle}>
              　/　{anchor.constellationLatin}
            </span>
          </p>
          <p style={constellationMythStyle}>{anchor.myth}</p>
          <p style={literaryQuoteStyle}>
            {`"${anchor.literary.quote}"`}
            <br />
            <span style={literaryAuthorStyle}>— {anchor.literary.author}</span>
          </p>
        </section>
      )}

      <Hairline />

      {/* VI · 今日月相 · 日课 */}
      {ephemeris && (
        <section style={sectionStyle}>
          <RomanBadge numeral="VI" label="今日月相" />
          <p style={ephemerisDateStyle}>{ephemeris.date}</p>
          <p style={ephemerisTitleStyle}>{ephemeris.event.title}</p>
          <p style={ephemerisBodyStyle}>{ephemeris.event.narration}</p>
          <p style={stardustStyle}>
            ✦ 今日星尘 · {ephemeris.stardust.translation ?? ephemeris.stardust.quote}
          </p>
        </section>
      )}

      <Hairline />

      {/* VII · 签名香水 + 灵魂结晶 */}
      {perfume && (
        <>
          <section style={sectionStyle}>
            <RomanBadge numeral="VII" label="你的香水 · 你的结晶" />
            <PerfumeShareBlock perfume={perfume} />
          </section>
          <Hairline />
        </>
      )}

      {/* VIII · 碎片宫殿 (Fragment Palace) */}
      <section style={sectionStyle}>
        <RomanBadge numeral="VIII" label="碎片宫殿" />
        <p style={{ textAlign: 'center', fontSize: 24, color: 'rgba(245,240,232,0.7)', letterSpacing: 2, marginBottom: 40, fontStyle: 'italic' }}>
          「 你身体里潜藏着他们的星火 」
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {igniteFragments(result).slice(0, 4).map((frag, idx) => (
            <div
              key={idx}
              style={{
                background: 'linear-gradient(145deg, rgba(245,240,232,0.06) 0%, rgba(26,21,48,0.4) 100%)',
                border: '1px solid rgba(201,166,118,0.25)',
                borderRadius: 24,
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ fontSize: 42, color: 'var(--color-accent)', marginBottom: 20 }}>
                {frag.sigil}
              </div>
              <h3 style={{ fontSize: 28, color: 'var(--color-bg-primary)', margin: '0 0 8px', fontWeight: 600, letterSpacing: 1 }}>
                {frag.nameZh}
              </h3>
              <div style={{ fontSize: 16, color: 'rgba(245,240,232,0.6)', marginBottom: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
                {frag.name}
              </div>
              <p style={{ fontSize: 15, color: 'var(--color-gold)', margin: '0 0 24px', letterSpacing: 1, borderTop: '1px solid rgba(245,240,232,0.1)', borderBottom: '1px solid rgba(245,240,232,0.1)', padding: '6px 0' }}>
                {frag.fields.slice(0, 2).join(' · ')}
              </p>
              <p style={{ fontSize: 20, fontStyle: 'italic', color: 'rgba(245,240,232,0.9)', margin: 0, lineHeight: 1.6 }}>
                「{frag.quote}」
              </p>
            </div>
          ))}
        </div>
      </section>

      <Hairline />

      {/* IX · 署名 */}
      <footer style={footerStyle}>
        <p style={footerEyebrowStyle}>PANTHEON · SIGNED</p>
        <p style={footerTitleStyle}>
          {getSiteLabel()} · 人格神域
        </p>
        <p style={footerUrlStyle}>{SHARE_SITE_URL}wtfti/galaxy/</p>
        <p style={footerSlugStyle}>
          {`// `}
          {personalitySlug} · {result.homePlanet.code}
          {shadow ? ` · ${shadow.bucket}` : ''}
        </p>
      </footer>
    </div>
  );
}

// ───────────────── Atoms ─────────────────

function RomanBadge({ numeral, label }: { numeral: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 18,
        justifyContent: 'center',
        marginBottom: 26,
      }}
    >
      <span
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 46,
          color: 'var(--color-gold)',
          letterSpacing: '0.08em',
        }}
      >
        {numeral}
      </span>
      <span
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.42em',
          fontSize: 18,
          color: 'var(--color-gold)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Hairline() {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        height: 1,
        background:
          'linear-gradient(90deg, transparent, #C9A676 50%, transparent)',
        margin: '48px 0',
        opacity: 0.55,
      }}
    />
  );
}


function TriCard({
  eyebrow,
  glyph,
  title,
  subtitle,
  tone,
}: {
  eyebrow: string;
  glyph: string;
  title: string;
  subtitle: string;
  tone: 'rose' | 'gold' | 'violet';
}) {
  const toneColor =
    tone === 'rose' ? 'var(--color-accent)' : tone === 'gold' ? 'var(--color-gold)' : '#9C7CFF';
  return (
    <div
      style={{
        padding: '28px 20px',
        borderRadius: 20,
        background:
          'linear-gradient(180deg, rgba(42,28,77,0.65) 0%, rgba(26,21,48,0.75) 100%)',
        border: `1.5px solid ${toneColor}22`,
        textAlign: 'center',
        boxShadow: `0 0 40px ${toneColor}15, inset 0 1px 10px rgba(255,255,255,0.08)`,
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: toneColor,
          margin: 0,
          fontWeight: 600,
        }}
      >
        {eyebrow}
      </p>
      <div
        style={{
          fontSize: 58,
          color: toneColor,
          textShadow: `0 0 40px ${toneColor}66`,
          margin: '10px 0 6px',
          fontFamily: '"Cormorant Garamond", serif',
        }}
      >
        {glyph}
      </div>
      <p
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 26,
          margin: '4px 0 6px',
          color: 'var(--color-bg-primary)',
          fontWeight: 500,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic',
          fontSize: 15,
          color: 'rgba(245,240,232,0.65)',
          margin: 0,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function PerfumeShareBlock({
  perfume,
}: {
  perfume: NonNullable<ReturnType<typeof getSignaturePerfume>>;
}) {
  const accent = perfume.accent;
  const c = perfume.crystal;
  return (
    <div
      style={{
        margin: '0 auto',
        maxWidth: 880,
        padding: '36px 36px 38px',
        borderRadius: 28,
        background:
          'linear-gradient(180deg, rgba(245,240,232,0.05) 0%, rgba(26,21,48,0.6) 100%)',
        border: `1px solid ${accent}3a`,
        boxShadow: `0 30px 80px -36px ${accent}66`,
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 36,
        alignItems: 'center',
      }}
    >
      {/* 香水瓶 */}
      <div style={{ textAlign: 'center' }}>
        <SharePerfumeBottle accent={accent} house={perfume.house} name={perfume.name} />
        <p
          style={{
            margin: '12px 0 4px',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            fontSize: 36,
            color: 'var(--color-bg-primary)',
            lineHeight: 1.05,
          }}
        >
          {perfume.name}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            letterSpacing: '0.42em',
            color: 'var(--color-gold)',
          }}
        >
          {perfume.house}
        </p>
        <p
          style={{
            margin: '6px 0 0',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(245,240,232,0.65)',
          }}
        >
          {perfume.year} · {perfume.positioning}
        </p>
      </div>

      {/* 右栏 · 香调 + 故事 + 结晶 */}
      <div>
        <p
          style={{
            margin: '0 0 14px',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            fontSize: 22,
            lineHeight: 1.7,
            color: 'rgba(245,240,232,0.92)',
          }}
        >
          「{perfume.whisper}」
        </p>

        {/* 香调金字塔 · 紧凑横排 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 18,
          }}
        >
          {(
            [
              { label: '前调', content: perfume.pyramid.top },
              { label: '中调', content: perfume.pyramid.heart },
              { label: '后调', content: perfume.pyramid.base },
            ] as const
          ).map((row) => (
            <div
              key={row.label}
              style={{
                padding: '12px 10px',
                borderRadius: 12,
                border: `1px solid ${accent}33`,
                background: 'rgba(245,240,232,0.04)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  color: 'rgba(245,240,232,0.55)',
                  textTransform: 'uppercase',
                }}
              >
                {row.label}
              </p>
              <p
                style={{
                  margin: '6px 0 0',
                  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
                  fontStyle: 'italic',
                  fontSize: 17,
                  color: 'var(--color-bg-primary)',
                  lineHeight: 1.4,
                }}
              >
                {row.content}
              </p>
            </div>
          ))}
        </div>

        {/* 灵魂结晶 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 16px',
            borderRadius: 14,
            background:
              'linear-gradient(155deg, rgba(245,240,232,0.06) 0%, rgba(26,21,48,0.55) 100%)',
            border: '1px solid rgba(201,166,118,0.32)',
          }}
        >
          <ShareCrystalGlyph color={c.color} />
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 11,
                letterSpacing: '0.36em',
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
              }}
            >
              灵魂结晶 · SOUL CRYSTAL
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontFamily: '"Noto Serif SC", serif',
                fontSize: 22,
                color: 'var(--color-bg-primary)',
                fontWeight: 500,
              }}
            >
              {c.name}
              <span
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'rgba(245,240,232,0.55)',
                  marginLeft: 8,
                }}
              >
                / {c.latin}
              </span>
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
                fontStyle: 'italic',
                fontSize: 16,
                color: 'rgba(245,240,232,0.78)',
              }}
            >
              「{c.hint}」
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SharePerfumeBottle({
  accent,
  house,
  name,
}: {
  accent: string;
  house: string;
  name: string;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: 200,
        height: 252,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 76,
          height: 26,
          borderRadius: '7px 7px 4px 4px',
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)`,
          boxShadow: `0 3px 8px ${accent}55`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 42,
          height: 12,
          background: `${accent}aa`,
          borderRadius: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 168,
          height: 216,
          borderRadius: '20px 20px 32px 32px',
          background: `linear-gradient(160deg, ${accent}38 0%, ${accent}14 60%, ${accent}28 100%)`,
          border: `1px solid ${accent}55`,
          boxShadow: `inset 0 -22px 36px ${accent}22, 0 16px 36px -20px ${accent}55, inset 8px 8px 18px rgba(255,255,255,0.06)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '0 10px',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 12,
            letterSpacing: '0.4em',
            color: 'var(--color-bg-primary)',
            opacity: 0.85,
          }}
        >
          {house}
        </span>
        <span
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 26,
            color: 'var(--color-bg-primary)',
            lineHeight: 1.05,
            textAlign: 'center',
          }}
        >
          {name.length > 14 ? name.split(/[·\s]/)[0] : name}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 42,
          left: '32%',
          width: 6,
          height: 142,
          borderRadius: 6,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0))',
          opacity: 0.85,
        }}
      />
    </div>
  );
}

function ShareCrystalGlyph({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={96}
      height={96}
      aria-hidden
      style={{ filter: `drop-shadow(0 0 18px ${color}88)`, flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`scrystal-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.92} />
          <stop offset="42%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor={color} stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <polygon
        points="48,10 74,30 68,68 28,68 22,30"
        fill={`url(#scrystal-${color.slice(1)})`}
        stroke="#F5F0E8"
        strokeOpacity={0.55}
        strokeWidth={0.7}
      />
      <polyline
        points="48,10 48,68"
        stroke="#FFFFFF"
        strokeOpacity={0.45}
        strokeWidth={0.7}
        fill="none"
      />
      <polyline
        points="22,30 48,42 74,30"
        stroke="#FFFFFF"
        strokeOpacity={0.5}
        strokeWidth={0.7}
        fill="none"
      />
      <polygon
        points="8,58 18,50 26,62 22,80 12,80"
        fill={`${color}cc`}
        stroke="#F5F0E8"
        strokeOpacity={0.4}
        strokeWidth={0.6}
      />
      <polygon
        points="74,58 84,68 78,84 68,82 72,68"
        fill={`${color}aa`}
        stroke="#F5F0E8"
        strokeOpacity={0.4}
        strokeWidth={0.6}
      />
    </svg>
  );
}

function OrbitDecor() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.45,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: 1400,
          height: 800,
          borderRadius: '50%',
          border: '1px solid rgba(201,166,118,0.18)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: 1700,
          height: 600,
          borderRadius: '50%',
          border: '1px dashed rgba(192,122,142,0.18)',
        }}
      />
    </div>
  );
}

function StardustDots() {
  const dots = Array.from({ length: 40 }, (_, i) => ({
    left: ((i * 73) % 100),
    top: ((i * 37) % 100),
    size: 1.2 + ((i * 1.3) % 2.6),
    op: 0.3 + ((i * 0.07) % 0.45),
  }));
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: i % 3 === 0 ? 'var(--color-gold)' : 'var(--color-bg-primary)',
            opacity: d.op,
            boxShadow: `0 0 ${d.size * 3}px rgba(245,240,232,0.5)`,
          }}
        />
      ))}
    </div>
  );
}

// ───────────────── Styles ─────────────────

const sectionStyle: CSSProperties = {
  position: 'relative',
  zIndex: 1,
};

const eyebrowStyle: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.4em',
  fontSize: 14,
  color: 'var(--color-gold)',
  margin: 0,
};

const heroTitleStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 88,
  margin: '22px 0 28px',
  letterSpacing: '0.02em',
};

const heroOrbStyle: CSSProperties = {
  width: 280,
  height: 280,
  borderRadius: '50%',
  background:
    'radial-gradient(circle at 36% 32%, #FFE0B6 0%, #C07A8E 38%, #2A1C4D 72%, #0F0A22 100%)',
  boxShadow:
    '0 0 70px rgba(192,122,142,0.45), inset -30px -40px 60px rgba(0,0,0,0.55)',
  margin: '0 auto 32px',
};

const heroQuoteStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 30,
  lineHeight: 1.5,
  margin: '0 0 18px',
  color: 'var(--color-bg-primary)',
};

const heroBodyStyle: CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 20,
  lineHeight: 1.8,
  color: 'rgba(245,240,232,0.72)',
  margin: 0,
  maxWidth: 800,
  marginLeft: 'auto',
  marginRight: 'auto',
};

const triGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 20,
  marginBottom: 24,
};

const deityLineStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontStyle: 'italic',
  fontSize: 24,
  margin: '0 0 10px',
  color: 'var(--color-bg-primary)',
};

const domainLineStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 14,
  letterSpacing: '0.08em',
  color: 'rgba(245,240,232,0.55)',
  margin: 0,
};

const sectionIntroStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 18,
  color: 'rgba(245,240,232,0.7)',
  margin: '0 0 24px',
};

const companionGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 20,
};

const qrPlaceholderStyle: CSSProperties = {
  width: 120,
  height: 120,
  margin: '32px auto 0',
  border: '1px dashed rgba(201,166,118,0.3)',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};



const shadowCardStyle: CSSProperties = {
  textAlign: 'center',
  padding: '36px 28px',
  borderRadius: 24,
  background:
    'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(156,124,255,0.16), rgba(26,21,48,0.6))',
  border: '1px solid rgba(156,124,255,0.28)',
};

const shadowTitleStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 52,
  margin: '16px 0 24px',
  color: 'var(--color-bg-primary)',
};

const shadowGlyphStyle: CSSProperties = {
  fontSize: 78,
  color: '#9C7CFF',
  textShadow: '0 0 48px rgba(156,124,255,0.6)',
  marginBottom: 16,
};

const shadowQuoteStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 24,
  lineHeight: 1.6,
  color: 'var(--color-bg-primary)',
  margin: '0 0 10px',
};

const shadowPowerStyle: CSSProperties = {
  fontSize: 14,
  letterSpacing: '0.1em',
  color: 'rgba(156,124,255,0.85)',
  margin: 0,
};

const shadowHintStyle: CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 20,
  lineHeight: 1.8,
  color: 'rgba(245,240,232,0.7)',
  margin: 0,
};

const constellationTitleStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 34,
  color: 'var(--color-bg-primary)',
  margin: '0 0 16px',
};

const constellationLatinStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 20,
  color: 'rgba(201,166,118,0.8)',
};

const constellationMythStyle: CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 20,
  lineHeight: 1.8,
  color: 'rgba(245,240,232,0.8)',
  margin: '0 0 24px',
  textAlign: 'center',
  maxWidth: 840,
  marginLeft: 'auto',
  marginRight: 'auto',
};

const literaryQuoteStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 22,
  textAlign: 'center',
  lineHeight: 1.6,
  color: 'var(--color-bg-primary)',
  margin: 0,
};

const literaryAuthorStyle: CSSProperties = {
  fontSize: 14,
  letterSpacing: '0.12em',
  color: 'rgba(201,166,118,0.85)',
};

const ephemerisDateStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 14,
  letterSpacing: '0.3em',
  color: 'var(--color-gold)',
  margin: 0,
};

const ephemerisTitleStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 32,
  color: 'var(--color-bg-primary)',
  margin: '12px 0 14px',
};

const ephemerisBodyStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 18,
  lineHeight: 1.8,
  color: 'rgba(245,240,232,0.8)',
  margin: '0 0 22px',
  maxWidth: 820,
  marginLeft: 'auto',
  marginRight: 'auto',
};

const stardustStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 18,
  color: 'rgba(201,166,118,0.92)',
  margin: 0,
};

const footerStyle: CSSProperties = {
  textAlign: 'center',
  marginTop: 64,
  paddingTop: 32,
  borderTop: '1px solid rgba(201,166,118,0.3)',
  position: 'relative',
  zIndex: 1,
};

const footerEyebrowStyle: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.4em',
  fontSize: 12,
  color: 'var(--color-gold)',
  margin: 0,
};

const footerTitleStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 28,
  color: 'var(--color-bg-primary)',
  margin: '10px 0 6px',
};

const footerUrlStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: 16,
  color: 'var(--color-gold)',
  margin: 0,
};

const footerSlugStyle: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
  fontSize: 12,
  color: 'rgba(245,240,232,0.45)',
  letterSpacing: '0.06em',
  margin: '12px 0 0',
};
