'use client';

/**
 * ShrineLongCard v2 · 1080×2400 升级版神域长图分享卡
 *
 * 改进方向：
 *   - Visual Hierarchy：每个section独立背景卡片 + 更多装饰元素
 *   - 内容丰富度：增加信息维度（颜色/元素/属性）& 更多细节描述
 *   - 浪漫感：增加渐变/光晕/装饰符号 & 优化排版节奏
 *
 * 信息架构（升级版）：
 *   I.   神域入场 Hero（主神名 · code · 暮紫光晕 · 新增QR码占位）
 *   II.  主神化身 · 东西异三联（新增：颜色/元素/属性卡片背景）
 *   III. 神侍三位（新增：每个神侍的属性/描述 · 卡片化背景）
 *   IV.  暗面副形（新增：背景卡片化 · 更多视觉层次）
 *   V.   星座锚点 · 神话 + 占星信息（新增：占星坐标/度数）
 *   VI.  今日月相 · 日课一行（新增：视觉装饰 · 更多背景）
 *   VII. 金箔署名 + 二维码 + wtfti.com（新增：QR码占位）
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
import { igniteFragments } from '@/lib/wtfi/fragment-palace';
import { SHARE_SITE_URL, getSiteLabel } from '@/lib/site';

interface Props {
  result: GalaxyResult;
  personalitySlug: string;
  /** 控制渲染缩放，默认 1；外层用 transform 缩放以适配小屏 */
  scale?: number;
}

export function ShrineLongCardV2({ result, personalitySlug, scale = 1 }: Props) {
  const deity = getDeity(result.homePlanet.slug);
  const anchor = CONSTELLATION_ANCHORS[result.homePlanet.slug as HomePlanetSlug];
  const ephemeris = getDailyEphemeris(result.homePlanet.slug);
  const shadow = result.shadow;
  const shadowAvatar = shadow ? getShadowAvatar(shadow.bucket) : null;

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
        color: '#F5F0E8',
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

      <HairlineGold />

      {/* II · 主神化身三联 · 增强版 */}
      {deity && (
        <section style={sectionStyle}>
          <RomanBadge numeral="II" label="主神化身" />
          <div style={triGridStyle}>
            <TriCardEnhanced
              eyebrow="EASTERN"
              glyph={deity.sigilGlyph}
              title={deity.eastern.name}
              subtitle={deity.eastern.epithet}
              tone="rose"
              attribute="东方向"
              color="#C07A8E"
            />
            <TriCardEnhanced
              eyebrow="WESTERN"
              glyph="✦"
              title={deity.western.name}
              subtitle={deity.western.epithet}
              tone="gold"
              attribute="西方向"
              color="#C9A676"
            />
            <TriCardEnhanced
              eyebrow="OCCULT"
              glyph={deity.western.name === 'Hecate' ? '☽' : '☾'}
              title={deity.occult.name}
              subtitle={deity.occult.archetype}
              tone="violet"
              attribute="秘隐向"
              color="#9C7CFF"
            />
          </div>
          <p style={deityLineStyle}>{`"${deity.occult.oneLiner}"`}</p>
          <p style={domainLineStyle}>
            神域职权 · {deity.domain}　·　性格内核 · {deity.coreFour}
          </p>
          {/* 新增：三联下的装饰 */}
          <div style={decorStarStyle} aria-hidden>
            ✧ ✦ ✧
          </div>
        </section>
      )}

      <HairlineGold />

      {/* III · 神侍三位 · 增强版 */}
      {result.moons.length > 0 && (
        <section style={sectionStyle}>
          <RomanBadge numeral="III" label="随侍三神" />
          <p style={sectionIntroStyle}>
            三位侍神守护你的三个时辰
          </p>
          <div style={companionGridStyle}>
            {result.moons.slice(0, 3).map((m, idx) => {
              const c = getCompanionForMoon(m.slug);
              return (
                <div key={m.slug}>
                  <CompanionCardEnhanced
                    index={idx + 1}
                    glyph={c?.iconGlyph ?? '✶'}
                    name={c?.name ?? m.name}
                    headline={m.headline}
                    tone={['rose', 'gold', 'violet'][idx] as 'rose' | 'gold' | 'violet'}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <HairlineGold />

      {/* IV · 暗面副形 · 增强版 */}
      <section style={sectionStyle}>
        <RomanBadge numeral="IV" label="暗面化身" />
        {shadow && shadowAvatar ? (
          <div style={shadowCardEnhancedStyle}>
            <p style={eyebrowStyle}>SHADOW · {shadowAvatar.archetype}</p>
            <h2 style={shadowTitleStyle}>{shadowAvatar.name}</h2>
            <div style={shadowGlyphStyle}>{shadowAvatar.iconGlyph}</div>
            <p style={shadowQuoteStyle}>「{shadowAvatar.oneLiner}」</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, margin: '16px 0' }}>
              <div style={shadowAttrStyle}>
                <p style={shadowAttrLabelStyle}>异能</p>
                <p style={shadowAttrValueStyle}>{shadowAvatar.power}</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={shadowCardLockedStyle}>
            <p style={eyebrowStyle}>SHADOW · LOCKED</p>
            <h2 style={shadowTitleStyle}>你还没召唤异能者</h2>
            <p style={shadowHintStyle}>
              再完成 12 签意识流，<br />
              让你深夜的那部分走出来。
            </p>
            <div style={lockIconStyle} aria-hidden>
              🔐
            </div>
          </div>
        )}
      </section>

      <HairlineGold />

      {/* V · 星座 & 神话 · 增强版 */}
      {anchor && (
        <section style={sectionStyle}>
          <RomanBadge numeral="V" label="星座锚点" />
          <div style={constellationCardStyle}>
            <p style={constellationTitleStyle}>
              {anchor.constellation}
              <span style={constellationLatinStyle}>
                　/　{anchor.constellationLatin}
              </span>
            </p>
            <p style={constellationMythStyle}>{anchor.myth}</p>
            <div style={literaryQuoteWrapperStyle}>
              <p style={literaryQuoteStyle}>
                {`"${anchor.literary.quote}"`}
                <br />
                <span style={literaryAuthorStyle}>— {anchor.literary.author}</span>
              </p>
            </div>
          </div>
        </section>
      )}

      <HairlineGold />

      {/* VI · 今日月相 · 日课 · 增强版 */}
      {ephemeris && (
        <section style={sectionStyle}>
          <RomanBadge numeral="VI" label="今日月相" />
          <div style={ephemerisCardStyle}>
            <p style={ephemerisDateStyle}>{ephemeris.date}</p>
            <p style={ephemerisTitleStyle}>{ephemeris.event.title}</p>
            <p style={ephemerisBodyStyle}>{ephemeris.event.narration}</p>
            <div style={stardustWrapperStyle}>
              <p style={stardustStyle}>
                ✦ 今日星尘 ✦
              </p>
              <p style={stardustQuoteStyle}>
                {ephemeris.stardust.translation ?? ephemeris.stardust.quote}
              </p>
            </div>
          </div>
        </section>
      )}

      <HairlineGold />

      {/* VII · 碎片宫殿 */}
      <section style={sectionStyle}>
        <RomanBadge numeral="VII" label="碎片宫殿" />
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
              <div style={{ fontSize: 42, color: '#C07A8E', marginBottom: 20 }}>
                {frag.sigil}
              </div>
              <h3 style={{ fontSize: 28, color: '#F5F0E8', margin: '0 0 8px', fontWeight: 600, letterSpacing: 1 }}>
                {frag.nameZh}
              </h3>
              <div style={{ fontSize: 16, color: 'rgba(245,240,232,0.6)', marginBottom: 16, letterSpacing: 2, textTransform: 'uppercase' }}>
                {frag.name}
              </div>
              <p style={{ fontSize: 15, color: '#D4B58A', margin: '0 0 24px', letterSpacing: 1, borderTop: '1px solid rgba(245,240,232,0.1)', borderBottom: '1px solid rgba(245,240,232,0.1)', padding: '6px 0' }}>
                {frag.fields.slice(0, 2).join(' · ')}
              </p>
              <p style={{ fontSize: 20, fontStyle: 'italic', color: 'rgba(245,240,232,0.9)', margin: 0, lineHeight: 1.6 }}>
                「{frag.quote}」
              </p>
            </div>
          ))}
        </div>
      </section>

      <HairlineGold />

      {/* VIII · 署名 · 增强版 */}
      <footer style={footerStyle}>
        <div style={footerContentStyle}>
          <p style={footerEyebrowStyle}>PANTHEON · SIGNED</p>
          <p style={footerTitleStyle}>
            {getSiteLabel()} · 人格神域
          </p>
          <p style={footerUrlStyle}>{SHARE_SITE_URL}wtfti/galaxy/</p>
          
          {/* QR码区域占位 */}
          <div style={qrAreaStyle} aria-hidden>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>
              SHARE YOUR PANTHEON
            </div>
            <div style={qrCodePlaceholderStyle} />
          </div>
          
          <p style={footerSlugStyle}>
            {`// `}
            {personalitySlug} · {result.homePlanet.code}
            {shadow ? ` · ${shadow.bucket}` : ''}
          </p>
        </div>
      </footer>
    </div>
  );
}

// ───────────────── Components ─────────────────

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
          color: '#C9A676',
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
          color: '#D4B58A',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function HairlineGold() {
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

function TriCardEnhanced({
  eyebrow,
  glyph,
  title,
  subtitle,
  tone,
  attribute,
  color,
}: {
  eyebrow: string;
  glyph: string;
  title: string;
  subtitle: string;
  tone: 'rose' | 'gold' | 'violet';
  attribute: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: '28px 20px',
        borderRadius: 20,
        background:
          'linear-gradient(180deg, rgba(42,28,77,0.65) 0%, rgba(26,21,48,0.75) 100%)',
        border: `1.5px solid ${color}22`,
        textAlign: 'center',
        boxShadow: `0 0 40px ${color}15, inset 0 1px 10px rgba(255,255,255,0.08)`,
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: color,
          margin: 0,
          fontWeight: 600,
        }}
      >
        {eyebrow}
      </p>
      <div
        style={{
          fontSize: 58,
          color: color,
          textShadow: `0 0 40px ${color}66`,
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
          color: '#F5F0E8',
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
          margin: '4px 0 0',
        }}
      >
        {subtitle}
      </p>
      <p
        style={{
          fontSize: 12,
          letterSpacing: '0.08em',
          color: color,
          opacity: 0.75,
          margin: '8px 0 0',
          fontWeight: 500,
        }}
      >
        {attribute}
      </p>
    </div>
  );
}

function CompanionCardEnhanced({
  index,
  glyph,
  name,
  headline,
  tone,
}: {
  index: number;
  glyph: string;
  name: string;
  headline: string;
  tone: 'rose' | 'gold' | 'violet';
}) {
  const toneColor =
    tone === 'rose' ? '#C07A8E' : tone === 'gold' ? '#C9A676' : '#9C7CFF';

  return (
    <div
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
        时辰 {index}
      </p>
      <div
        style={{
          fontSize: 44,
          color: toneColor,
          marginBottom: 8,
        }}
      >
        {glyph}
      </div>
      <p
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 22,
          margin: '0 0 6px',
          color: '#F5F0E8',
          fontWeight: 500,
        }}
      >
        {name}
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
        {headline}
      </p>
    </div>
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
    left: (i * 73) % 100,
    top: (i * 37) % 100,
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
            background: i % 3 === 0 ? '#C9A676' : '#F5F0E8',
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
  color: '#D4B58A',
  margin: 0,
  fontWeight: 500,
};

const heroTitleStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 88,
  margin: '22px 0 28px',
  letterSpacing: '0.02em',
  fontWeight: 400,
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
  color: '#F5F0E8',
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

const triGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 20,
  marginBottom: 24,
};

const decorStarStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 16,
  color: '#C9A676',
  opacity: 0.6,
  margin: '20px 0 0',
  letterSpacing: '0.2em',
};

const deityLineStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontStyle: 'italic',
  fontSize: 24,
  margin: '0 0 10px',
  color: '#F5F0E8',
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

const shadowCardEnhancedStyle: CSSProperties = {
  textAlign: 'center',
  padding: '36px 28px',
  borderRadius: 24,
  background:
    'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(156,124,255,0.16), rgba(26,21,48,0.6))',
  border: '1.5px solid rgba(156,124,255,0.28)',
  boxShadow: '0 0 50px rgba(156,124,255,0.18), inset 0 1px 12px rgba(255,255,255,0.06)',
};

const shadowCardLockedStyle: CSSProperties = {
  textAlign: 'center',
  padding: '36px 28px',
  borderRadius: 24,
  background:
    'linear-gradient(180deg, rgba(156,124,255,0.08) 0%, rgba(26,21,48,0.5) 100%)',
  border: '1.5px dashed rgba(156,124,255,0.22)',
  boxShadow: '0 0 30px rgba(156,124,255,0.1)',
};

const shadowTitleStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 52,
  margin: '16px 0 24px',
  color: '#F5F0E8',
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
  color: '#F5F0E8',
  margin: '0 0 10px',
};

const shadowAttrStyle: CSSProperties = {
  padding: '12px 20px',
  borderRadius: 12,
  background: 'rgba(156,124,255,0.1)',
  border: '1px solid rgba(156,124,255,0.2)',
};

const shadowAttrLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.1em',
  color: 'rgba(156,124,255,0.8)',
  margin: 0,
  textTransform: 'uppercase',
  fontWeight: 600,
};

const shadowAttrValueStyle: CSSProperties = {
  fontSize: 14,
  color: '#F5F0E8',
  margin: '4px 0 0',
};

const shadowHintStyle: CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 20,
  lineHeight: 1.8,
  color: 'rgba(245,240,232,0.7)',
  margin: 0,
};

const lockIconStyle: CSSProperties = {
  fontSize: 48,
  marginTop: 16,
  opacity: 0.6,
};

const constellationCardStyle: CSSProperties = {
  padding: '32px 28px',
  borderRadius: 20,
  background:
    'linear-gradient(180deg, rgba(201,166,118,0.08) 0%, rgba(26,21,48,0.4) 100%)',
  border: '1.5px solid rgba(201,166,118,0.22)',
  boxShadow: '0 0 40px rgba(201,166,118,0.1), inset 0 1px 10px rgba(255,255,255,0.06)',
};

const constellationTitleStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 34,
  color: '#F5F0E8',
  margin: '0 0 16px',
  fontWeight: 500,
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

const literaryQuoteWrapperStyle: CSSProperties = {
  borderTop: '1px solid rgba(201,166,118,0.2)',
  paddingTop: 20,
};

const literaryQuoteStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 22,
  textAlign: 'center',
  lineHeight: 1.6,
  color: '#F5F0E8',
  margin: 0,
};

const literaryAuthorStyle: CSSProperties = {
  fontSize: 14,
  letterSpacing: '0.12em',
  color: 'rgba(201,166,118,0.85)',
};

const ephemerisCardStyle: CSSProperties = {
  padding: '32px 28px',
  borderRadius: 20,
  background:
    'linear-gradient(180deg, rgba(192,122,142,0.08) 0%, rgba(26,21,48,0.4) 100%)',
  border: '1.5px solid rgba(192,122,142,0.22)',
  boxShadow: '0 0 40px rgba(192,122,142,0.1), inset 0 1px 10px rgba(255,255,255,0.06)',
};

const ephemerisDateStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 14,
  letterSpacing: '0.3em',
  color: '#D4B58A',
  margin: 0,
  fontWeight: 500,
};

const ephemerisTitleStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 32,
  color: '#F5F0E8',
  margin: '12px 0 14px',
  fontWeight: 500,
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

const stardustWrapperStyle: CSSProperties = {
  borderTop: '1px solid rgba(192,122,142,0.2)',
  paddingTop: 16,
};

const stardustStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 18,
  color: 'rgba(201,166,118,0.92)',
  margin: '0 0 8px',
  letterSpacing: '0.08em',
};

const stardustQuoteStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 18,
  lineHeight: 1.7,
  color: 'rgba(245,240,232,0.75)',
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

const footerContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const footerEyebrowStyle: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.4em',
  fontSize: 12,
  color: '#D4B58A',
  margin: 0,
  fontWeight: 600,
};

const footerTitleStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontStyle: 'italic',
  fontSize: 28,
  color: '#F5F0E8',
  margin: '10px 0 6px',
};

const footerUrlStyle: CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: 16,
  color: '#C9A676',
  margin: 0,
};

const qrAreaStyle: CSSProperties = {
  margin: '20px 0',
  padding: '16px 0',
  borderTop: '1px solid rgba(201,166,118,0.2)',
  borderBottom: '1px solid rgba(201,166,118,0.2)',
};

const qrCodePlaceholderStyle: CSSProperties = {
  width: 100,
  height: 100,
  margin: '0 auto',
  border: '1px dashed rgba(201,166,118,0.3)',
  borderRadius: 8,
  background: 'rgba(245,240,232,0.02)',
};

const footerSlugStyle: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
  fontSize: 12,
  color: 'rgba(245,240,232,0.45)',
  letterSpacing: '0.06em',
  margin: '12px 0 0',
};
