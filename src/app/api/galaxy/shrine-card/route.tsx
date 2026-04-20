import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { CONSTELLATION_ANCHORS, type HomePlanetSlug } from '@/lib/wtfi/constellation-anchors';
import { getDeity, getShadowAvatar } from '@/lib/wtfi/pantheon';
import { getContemporaryDeity } from '@/lib/wtfi/contemporary-deities';
import { getSignaturePerfume } from '@/lib/wtfi/signature-perfume';
import { igniteFragments } from '@/lib/wtfi/fragment-palace';
import type { ShadowBucket } from '@/lib/wtfi/s-axis';
import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const homeSlug = (sp.get('home') || 'home-storm-harbor') as HomePlanetSlug;
  const personality = sp.get('personality') || '';
  const shadowBucket = (sp.get('shadow') || '') as ShadowBucket | '';

  const home =
    HOME_PLANET_CATALOG.find((p) => p.slug === homeSlug) ??
    HOME_PLANET_CATALOG[0];
  const anchor = CONSTELLATION_ANCHORS[home.slug];
  const deity = getDeity(home.slug);
  const incarnation = getContemporaryDeity(home.slug);
  const shadowAvatar = shadowBucket ? getShadowAvatar(shadowBucket) : null;
  const perfume = getSignaturePerfume(home.slug);

  const mockResult = {
    homePlanet: {
      slug: home.slug,
      axesVector: home.defaultAxesVector,
    },
    shadow: shadowBucket ? { bucket: shadowBucket } : null,
  } as unknown as GalaxyResult;
  const fragments = igniteFragments(mockResult);

  // Decorative SVG star
  const SvgStar = ({ size = 20, opacity = 1 }: { size?: number, opacity?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity, display: 'flex' }}>
      <path
        d="M 50 0 L 58 42 L 100 50 L 58 58 L 50 100 L 42 58 L 0 50 L 42 42 Z"
        fill="#C9A676"
      />
    </svg>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          background: '#1A1530',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1000,
          display: 'flex',
          background: 'radial-gradient(circle at 50% 0%, rgba(192,122,142,0.25) 0%, rgba(26,21,48,0) 60%)',
        }} />
        
        {/* Book cover frame */}
        <div
          style={{
            margin: 32,
            border: '2px solid rgba(201,166,118,0.2)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '72px 56px 64px',
            color: '#F5F0E8',
            flex: 1,
            zIndex: 1,
          }}
        >
          {/* Top eyebrow */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              letterSpacing: 8,
              fontSize: 16,
              color: '#C9A676',
              textTransform: 'uppercase',
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            WTFTI · PERSONAL PANTHEON · {home.code}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 40,
            }}
          >
            <SvgStar size={16} opacity={0.6} />
          </div>

          {/* Hero title */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 20,
              fontSize: 88,
              fontStyle: 'italic',
              letterSpacing: 2,
              color: '#F5F0E8',
              textShadow: '0 4px 20px rgba(255,255,255,0.1)',
            }}
          >
            {home.name}
          </div>

          {/* Hero orb: Double layer radial */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 48,
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 320,
                height: 320,
                borderRadius: 320,
                border: '1px solid rgba(201,166,118,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 370,
                  height: 370,
                  borderRadius: 370,
                  border: '1px dashed rgba(201,166,118,0.15)',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  width: 250,
                  height: 250,
                  borderRadius: 250,
                  background:
                    'radial-gradient(circle at 35% 32%, #FFE0B6 0%, #C07A8E 38%, #2A1C4D 72%, #0F0A22 100%)',
                  boxShadow: '0 0 80px rgba(192,122,142,0.4)',
                  display: 'flex',
                }}
              />
            </div>
          </div>

          {/* Headline quote */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 64,
              fontSize: 34,
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '0 40px',
              color: '#F5F0E8',
              letterSpacing: 2,
            }}
          >
            「{home.headline}」
          </div>

          {/* Contemporary incarnation · 现世化身（咒语 + tag）— 2026-04-20 引入 */}
          {incarnation ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 36,
                  fontSize: 16,
                  letterSpacing: 6,
                  color: '#C07A8E',
                }}
              >
                ✦ 现世化身 · {incarnation.tag}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 18,
                  fontSize: 32,
                  letterSpacing: 1,
                  color: '#F5F0E8',
                }}
              >
                {incarnation.glyph}　{incarnation.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 14,
                  fontSize: 28,
                  fontStyle: 'italic',
                  color: '#F5F0E8',
                  letterSpacing: 1,
                  padding: '0 40px',
                  textAlign: 'center',
                }}
              >
                「{incarnation.mantra}」
              </div>
            </>
          ) : null}

          <Hairline />

          {/* Deity trinity */}
          {deity ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 32,
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <SvgStar size={10} opacity={0.4} />
                  <div style={{ fontSize: 16, letterSpacing: 4, color: '#C9A676' }}>
                    I · HOLY TRINITY
                  </div>
                  <SvgStar size={10} opacity={0.4} />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                  gap: 20,
                }}
              >
                <TriBlock
                  eyebrow="EASTERN"
                  title={deity.eastern.name}
                  subtitle={deity.eastern.epithet}
                  tone="#C07A8E"
                />
                <TriBlock
                  eyebrow="WESTERN"
                  title={deity.western.name}
                  subtitle={deity.western.epithet}
                  tone="#C9A676"
                />
                <TriBlock
                  eyebrow="OCCULT"
                  title={deity.occult.name}
                  subtitle={deity.occult.archetype}
                  tone="#9C7CFF"
                />
              </div>
            </div>
          ) : null}

          <Hairline />

          {/* Constellation + myth */}
          {anchor ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <SvgStar size={10} opacity={0.4} />
                  <div style={{ fontSize: 16, letterSpacing: 4, color: '#C9A676' }}>
                    II · CELESTIAL ANCHOR
                  </div>
                  <SvgStar size={10} opacity={0.4} />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: 36,
                  color: '#C9A676',
                  fontStyle: 'italic',
                }}
              >
                {anchor.constellation} · {anchor.constellationLatin}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: 'rgba(245,240,232,0.85)',
                  textAlign: 'center',
                  padding: '0 40px',
                  lineHeight: 1.8,
                }}
              >
                {anchor.myth}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: '#C07A8E',
                  textAlign: 'center',
                  padding: '0 60px',
                }}
              >
                {`"${anchor.literary.quote}" — ${anchor.literary.author}`}
              </div>
            </div>
          ) : null}

          <Hairline />

          {/* Shadow */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 40px',
              borderRadius: 24,
              border: '1px dashed rgba(156,124,255,0.4)',
              background:
                'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(156,124,255,0.12), rgba(26,21,48,0.8))',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top faded ornament */}
            <div style={{ display: 'flex', position: 'absolute', top: -30, opacity: 0.3 }}>
              <svg width="200" height="60" viewBox="0 0 200 60">
                <path d="M 0 30 Q 100 -30 200 30" fill="none" stroke="#9C7CFF" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <SvgStar size={10} opacity={0.4} />
              <div style={{ fontSize: 16, letterSpacing: 4, color: '#C9A676' }}>
                III · THE SHADOW
              </div>
              <SvgStar size={10} opacity={0.4} />
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 24,
                fontSize: 60,
                fontStyle: 'italic',
                color: '#F5F0E8',
                textShadow: '0 4px 20px rgba(156,124,255,0.3)',
              }}
            >
              {shadowAvatar ? shadowAvatar.name : '尚未召唤'}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 16,
                fontSize: 24,
                color: 'rgba(245,240,232,0.85)',
                textAlign: 'center',
                padding: '0 20px',
              }}
            >
              {shadowAvatar
                ? `「${shadowAvatar.oneLiner}」`
                : '祈请中：12 签意识流释放你的暗面。'}
            </div>
          </div>

          {/* Signature Perfume + Soul Crystal */}
          {perfume ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 48,
                padding: '48px 40px',
                borderRadius: 24,
                border: `1px solid ${perfume.accent}3a`,
                background:
                  `linear-gradient(180deg, rgba(245,240,232,0.03) 0%, rgba(26,21,48,0.7) 100%)`,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <SvgStar size={10} opacity={0.4} />
                <div style={{ fontSize: 16, letterSpacing: 4, color: '#C9A676' }}>
                  IV · SIGNATURE SCENT
                </div>
                <SvgStar size={10} opacity={0.4} />
              </div>
              
              <div
                style={{
                  display: 'flex',
                  marginTop: 32,
                  marginBottom: 16,
                }}
              >
                {/* Beautiful Vintage Perfume Bottle SVG! */}
                <svg width="100" height="150" viewBox="0 0 100 150" style={{ display: 'flex' }}>
                  {/* Atomizer Tube */}
                  <rect x="48" y="55" width="4" height="40" fill="rgba(255,255,255,0.3)" />
                  {/* Sprayer cap */}
                  <circle cx="50" cy="18" r="10" fill="#C9A676" />
                  <rect x="42" y="28" width="16" height="14" fill="#E2B85C" />
                  <rect x="36" y="42" width="28" height="6" fill="#C9A676" />
                  <polygon points="36,48 64,48 70,55 30,55" fill="#C9A676" opacity="0.6" />
                  {/* Gold neck chain */}
                  <line x1="30" y1="52" x2="70" y2="52" stroke="#1A1530" strokeWidth="2" opacity="0.5"/>
                  {/* Bottle body */}
                  <path d="M 30,55 L 70,55 Q 85,55 90,75 L 96,135 Q 98,145 80,145 L 20,145 Q 2,145 4,135 L 10,75 Q 15,55 30,55 Z" fill="rgba(245,240,232,0.03)" stroke={perfume.accent} strokeWidth="3" />
                  {/* Perfume liquid inside */}
                  <path d="M 22,85 L 78,85 L 88,140 Q 90,145 80,145 L 20,145 Q 10,145 12,140 Z" fill={perfume.accent} opacity="0.35" />
                  <path d="M 22,85 L 78,85 Q 50,90 22,85 Z" fill="rgba(255,255,255,0.2)" />
                  {/* Vintage label */}
                  <rect x="30" y="90" width="40" height="30" rx="4" fill="#1A1530" stroke="#C9A676" strokeWidth="1.5" />
                  <line x1="34" y1="94" x2="66" y2="94" stroke="#C9A676" strokeWidth="1" opacity="0.5"/>
                  <line x1="34" y1="116" x2="66" y2="116" stroke="#C9A676" strokeWidth="1" opacity="0.5"/>
                  <circle cx="50" cy="105" r="4" fill="#C9A676" opacity="0.8"/>
                  {/* Sparkles */}
                  <circle cx="15" cy="50" r="2" fill="#fff" opacity="0.6"/>
                  <circle cx="85" cy="30" r="1.5" fill="#fff" opacity="0.6"/>
                  <circle cx="80" cy="120" r="2" fill={perfume.accent} opacity="0.8"/>
                </svg>
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  letterSpacing: 8,
                  color: '#C9A676',
                  opacity: 0.9,
                }}
              >
                {perfume.house}
              </div>
              <div
                style={{
                  display: 'flex',
                  marginTop: 12,
                  fontSize: 72,
                  fontStyle: 'italic',
                  color: '#F5F0E8',
                  textShadow: `0 4px 20px ${perfume.accent}55`,
                }}
              >
                {perfume.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  marginTop: 10,
                  fontSize: 22,
                  fontStyle: 'italic',
                  color: 'rgba(245,240,232,0.7)',
                }}
              >
                {perfume.year} · {perfume.positioning}
              </div>
              {/* Pyramid */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  width: '100%',
                  marginTop: 36,
                }}
              >
                {(
                  [
                    { label: 'TOP', content: perfume.pyramid.top },
                    { label: 'HEART', content: perfume.pyramid.heart },
                    { label: 'BASE', content: perfume.pyramid.base },
                  ] as const
                ).map((row) => (
                  <div
                    key={row.label}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '24px 12px',
                      borderRadius: 16,
                      border: `1px solid ${perfume.accent}20`,
                      background: 'rgba(245,240,232,0.03)',
                      boxShadow: `inset 0 0 20px rgba(26,21,48,0.5)`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        color: 'rgba(245,240,232,0.5)',
                        letterSpacing: 4,
                        fontSize: 14,
                        textTransform: 'uppercase',
                        fontFamily: '"Cormorant Garamond", serif',
                      }}
                    >
                      {row.label}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        marginTop: 12,
                        fontSize: 22,
                        fontStyle: 'italic',
                        color: '#F5F0E8',
                        textAlign: 'center',
                        lineHeight: 1.4,
                      }}
                    >
                      {row.content}
                    </div>
                  </div>
                ))}
              </div>
              {/* Whisper */}
              <div
                style={{
                  display: 'flex',
                  marginTop: 32,
                  fontSize: 28,
                  fontStyle: 'italic',
                  color: perfume.accent,
                  textAlign: 'center',
                  padding: '0 40px',
                  letterSpacing: 1,
                }}
              >
                「{perfume.whisper}」
              </div>
              {/* Soul Crystal */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  marginTop: 40,
                  padding: '24px 32px',
                  borderRadius: 20,
                  background:
                    'linear-gradient(155deg, rgba(245,240,232,0.08) 0%, rgba(26,21,48,0.7) 100%)',
                  border: '1px solid rgba(201,166,118,0.3)',
                  boxShadow: `0 8px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
                  width: '90%',
                }}
              >
                <div style={{ display: 'flex' }}>
                   {/* Soul Crystal SVG rendering */}
                   <svg width="56" height="56" viewBox="0 0 50 50" style={{ display: 'flex', filter: `drop-shadow(0 0 8px ${perfume.crystal.color})` }}>
                      <polygon points="25,2 45,15 45,35 25,48 5,35 5,15" fill={perfume.crystal.color} opacity="0.6" stroke={perfume.crystal.color} strokeWidth="1" />
                      <polygon points="25,2 45,15 25,24 5,15" fill="rgba(255,255,255,0.7)" />
                      <polygon points="25,48 45,35 25,24 5,35" fill="rgba(0,0,0,0.5)" />
                      <line x1="25" y1="2" x2="25" y2="48" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                      <line x1="5" y1="15" x2="45" y2="15" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                      <line x1="5" y1="35" x2="45" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                   </svg>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      color: '#C9A676',
                      letterSpacing: 4,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      fontFamily: '"Cormorant Garamond", serif',
                    }}
                  >
                    Soul Crystal · 灵魂结晶
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      marginTop: 8,
                      fontSize: 30,
                      color: '#F5F0E8',
                      fontStyle: 'italic',
                    }}
                  >
                    {perfume.crystal.name} <span style={{ opacity: 0.6, fontSize: 22, margin: '6px 0 0 12px' }}>{perfume.crystal.latin}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      marginTop: 8,
                      fontSize: 20,
                      fontStyle: 'italic',
                      color: 'rgba(245,240,232,0.8)',
                    }}
                  >
                    「{perfume.crystal.hint}」
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Fragment Palace */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 64,
            }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <SvgStar size={10} opacity={0.4} />
              <div style={{ fontSize: 16, letterSpacing: 4, color: '#C9A676' }}>
                V · FRAGMENT PALACE
              </div>
              <SvgStar size={10} opacity={0.4} />
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 14,
                fontSize: 36,
                fontStyle: 'italic',
                color: '#F5F0E8',
              }}
            >
              共鸣的历史投影
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 20,
                width: '100%',
                marginTop: 36,
              }}
            >
              {fragments.slice(0, 4).map((frag, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '46%',
                    background: 'rgba(245,240,232,0.03)',
                    border: '1px solid rgba(201,166,118,0.25)',
                    borderRadius: 16,
                    padding: '32px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', position: 'absolute', top: -10, left: -10, opacity: 0.1 }}>
                    {/* Decorative corner */}
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <path d="M 0 40 Q 20 20 40 0" fill="none" stroke="#C9A676" strokeWidth="2" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', fontSize: 36, color: '#C07A8E', fontFamily: '"Noto Serif SC", serif' }}>
                    {frag.sigil}
                  </div>
                  <div style={{ display: 'flex', fontSize: 26, color: '#F5F0E8', marginTop: 16, fontStyle: 'italic' }}>
                    {frag.nameZh} / {frag.name}
                  </div>
                  <div style={{ display: 'flex', fontSize: 14, color: 'rgba(245,240,232,0.6)', marginTop: 8, letterSpacing: 1 }}>
                    {frag.era} · {frag.fields.slice(0, 2).join(' / ')}
                  </div>
                  <div style={{ display: 'flex', fontSize: 18, color: '#C9A676', opacity: 0.9, marginTop: 20, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>
                    「{frag.quote}」
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: 48,
              borderTop: '1px solid rgba(201,166,118,0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                letterSpacing: 6,
                color: '#C9A676',
                fontSize: 16,
                textTransform: 'uppercase',
                fontFamily: '"Cormorant Garamond", serif',
              }}
            >
              RECORDED IN THE AKASHIC
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 12,
                fontSize: 32,
                fontStyle: 'italic',
                color: '#F5F0E8',
              }}
            >
              wtfti.com · 人格神域
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 8,
                fontSize: 15,
                color: 'rgba(245,240,232,0.4)',
                fontFamily: 'monospace',
                letterSpacing: 2,
              }}
            >
              {`// ${personality || 'NO-ID'} · ${home.code}${shadowBucket ? ` · ${shadowBucket}` : ''}`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 2800,
    },
  );
}

function TriBlock({
  eyebrow,
  title,
  subtitle,
  tone,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  tone: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 16px',
        borderRadius: 20,
        background: 'rgba(26,21,48,0.5)',
        border: '1px solid rgba(201,166,118,0.2)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          color: tone,
          letterSpacing: 6,
          fontSize: 14,
          textTransform: 'uppercase',
          fontFamily: '"Cormorant Garamond", serif',
          textShadow: `0 0 10px ${tone}40`,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 18,
          fontSize: 32,
          color: '#F5F0E8',
          textAlign: 'center',
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 12,
          fontSize: 18,
          fontStyle: 'italic',
          color: 'rgba(245,240,232,0.7)',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function Hairline() {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: 1,
        margin: '56px 0',
        background:
          'linear-gradient(90deg, transparent, rgba(201,166,118,0.6) 50%, transparent)',
      }}
    />
  );
}
