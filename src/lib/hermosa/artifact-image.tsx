import { ImageResponse } from 'next/og';
import type { HermosaArtifactKind, HermosaArtifactRow } from './public-artifacts';
import { getHermosaTopic } from './topics';

const W = 1080;
const H = 1350;

function fitText(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function roman(index: number): string {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][index] ?? String(index + 1);
}

function itemText(row: HermosaArtifactRow): string {
  if (row.kind === 'book') {
    const title = row.metadata?.book_title ?? '未命名书籍';
    const author = row.metadata?.book_author ? ` / ${row.metadata.book_author}` : '';
    const note = row.metadata?.book_note || row.metadata?.book_quote || row.text;
    return `《${title}》${author} · ${note}`;
  }
  return row.text;
}

export function createHermosaArtifactImageResponse({
  kind,
  week,
  rows,
}: {
  kind: HermosaArtifactKind;
  week: string;
  rows: HermosaArtifactRow[];
}) {
  const topic = getHermosaTopic(week);
  const isBook = kind === 'book';
  const title = isBook ? topic.bookTitle : topic.wallpaperTitle;
  const eyebrow = isBook ? 'HER VOICE · BOOK LIST' : 'HER VOICE · WALLPAPER WORDS';
  const visibleRows = rows.slice(0, isBook ? 7 : 12);
  const fallbackRows = visibleRows.length > 0 ? visibleRows : [{
    id: 'fallback',
    kind,
    text: isBook ? '等待第一本被女性共同推荐的书。' : '等待第一句被女性共同保存的话。',
    signature: 'Her Voice',
    metadata: {},
    topic_week: week,
    consent_to_feature: true,
    echo_count: 0,
    is_featured: false,
    curation_status: 'selected',
    created_at: new Date().toISOString(),
  } satisfies HermosaArtifactRow];

  if (!isBook) {
    // 专题海报：女性发言集（编辑工坊 × 暮光博物笔记 风格）
    const watermarkChar = title.replace(/[^\u4e00-\u9fa5]/g, '').slice(-1) || '声';
    const sideText = '她把伤口挂在身上·用最艳的颜色装饰它';
    const featured = fallbackRows[0];
    const restRows = fallbackRows.slice(1);
    // 关键词高亮库（可视情况自动着色）
    const ROSE = '#C07A8E';
    const GOLD = '#C9A676';
    const INK = '#1A1530';

    return new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: 'flex',
            flexDirection: 'column',
            padding: '54px 70px 44px',
            background: '#F5F0E8',
            color: INK,
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            position: 'relative',
            alignItems: 'center',
          }}
        >
          {/* 超大半透明主题字水印 */}
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              right: -30,
              display: 'flex',
              fontSize: 540,
              lineHeight: 1,
              color: INK,
              opacity: 0.06,
              fontFamily: '"Noto Serif SC", serif',
              fontWeight: 700,
            }}
          >
            {watermarkChar}
          </div>

          {/* 顶部细横线 */}
          <div style={{ display: 'flex', position: 'absolute', top: 36, left: 70, right: 70, height: 1, background: INK, opacity: 0.18 }} />

          {/* 顶栏信息 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
            <div style={{ display: 'flex', fontSize: 15, letterSpacing: 8, color: INK, opacity: 0.65 }}>
              HERMOSA
            </div>
            <div style={{ display: 'flex', marginTop: 4, fontSize: 14, fontStyle: 'italic', letterSpacing: 3, color: ROSE, opacity: 0.9 }}>
              her voice commons
            </div>

            <div style={{ display: 'flex', marginTop: 22, fontSize: 96, fontWeight: 600, color: INK, letterSpacing: 6, fontFamily: '"Cormorant Garamond", serif' }}>
              VIVA
            </div>
            <div style={{ display: 'flex', marginTop: 6, fontSize: 26, fontWeight: 500, color: INK, letterSpacing: 4 }}>
              — {title} —
            </div>
            <div style={{ display: 'flex', marginTop: 18, fontSize: 14, color: INK, opacity: 0.55, letterSpacing: 1 }}>
              {fallbackRows.length} 位姐妹写给「{title}」的话
            </div>
            <div style={{ display: 'flex', marginTop: 10, width: 56, height: 1, background: INK, opacity: 0.4 }} />
          </div>

          {/* 左侧竖排报眉（用 flex column 模拟，避免 Satori writingMode 不支持） */}
          <div
            style={{
              position: 'absolute',
              left: 28,
              top: 360,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 14,
              color: INK,
              opacity: 0.4,
              fontFamily: '"Noto Serif SC", serif',
              letterSpacing: 0,
              gap: 8,
              zIndex: 5,
            }}
          >
            {sideText.split('').map((ch, idx) => (
              <div key={`l-${idx}`} style={{ display: 'flex' }}>{ch}</div>
            ))}
          </div>

          {/* 精选大引语 */}
          {featured ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 36, zIndex: 10, padding: '0 60px' }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: 40,
                  fontWeight: 600,
                  color: INK,
                  lineHeight: 1.4,
                  textAlign: 'center',
                  letterSpacing: 1,
                }}
              >
                「{fitText(featured.text, 36)}」
              </div>
              <div style={{ display: 'flex', marginTop: 12, fontSize: 14, color: INK, opacity: 0.55, letterSpacing: 2, fontStyle: 'italic' }}>
                — {featured.signature || 'Anonymous'}
              </div>
            </div>
          ) : null}

          {/* 涂鸦式语录墙 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
              marginTop: 28,
              position: 'relative',
              zIndex: 10,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 14,
              padding: '0 30px',
            }}
          >
            {restRows.map((row, i) => {
              // 节奏：每 4 项有一个大字
              const isAccent = i % 4 === 0;
              const isMedium = i % 3 === 1;
              const isEnglish = /^[\x00-\x7F\s]+$/.test(row.text || '');

              let size = 18;
              let weight: number = 400;
              let color = INK;
              let opacity = 0.7;

              if (isAccent) {
                size = isEnglish ? 32 : 30;
                weight = 600;
                color = INK;
                opacity = 0.95;
              } else if (isMedium) {
                size = 22;
                weight = 500;
                opacity = 0.85;
                if (i % 2 === 0) color = ROSE;
              } else {
                size = 17;
                opacity = 0.75;
                if (i % 5 === 0) color = GOLD;
              }

              const wrapped = isEnglish
                ? fitText(row.text, 70)
                : `「${fitText(row.text, 38)}」`;

              return (
                <div
                  key={row.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: size,
                      color,
                      fontWeight: weight,
                      opacity,
                      lineHeight: 1.45,
                      textAlign: 'center',
                      maxWidth: '92%',
                      letterSpacing: isEnglish ? 1 : 1.5,
                    }}
                  >
                    {wrapped}
                  </div>
                </div>
              );
            })}

            {/* 中段细分割线 */}
            <div style={{ display: 'flex', marginTop: 8, width: 80, height: 1, background: INK, opacity: 0.25 }} />
          </div>

          {/* 底部 Footer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', zIndex: 10, paddingBottom: 8 }}>
            <div style={{ display: 'flex', fontSize: 14, letterSpacing: 10, color: INK, opacity: 0.7, fontWeight: 500 }}>
              A ROOM OF ONE&#39;S OWN
            </div>
            <div style={{ display: 'flex', marginTop: 8, fontSize: 11, letterSpacing: 4, color: INK, opacity: 0.45 }}>
              HERMOSA · her voice commons · VIVA
            </div>
          </div>

          {/* 底部细横线 */}
          <div style={{ display: 'flex', position: 'absolute', bottom: 36, left: 70, right: 70, height: 1, background: INK, opacity: 0.18 }} />
        </div>
      ),
      {
        width: W,
        height: H,
        headers: {
          'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
        },
      },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          padding: '74px 76px 64px',
          background: '#1A1530',
          color: '#F5F0E8',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -190,
            right: -190,
            width: 560,
            height: 560,
            display: 'flex',
            borderRadius: 560,
            background: 'radial-gradient(circle, rgba(192,122,142,0.25), rgba(192,122,142,0) 68%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -220,
            left: -220,
            width: 660,
            height: 660,
            display: 'flex',
            borderRadius: 660,
            background: 'radial-gradient(circle, rgba(201,166,118,0.20), rgba(201,166,118,0) 68%)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', fontSize: 21, letterSpacing: 9, color: '#C9A676' }}>
            {eyebrow}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 66,
              lineHeight: 1.08,
              fontStyle: 'italic',
              color: '#F5F0E8',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 20,
              fontSize: 25,
              lineHeight: 1.5,
              color: 'rgba(245,240,232,0.72)',
            }}
          >
            {topic.question}
          </div>
          <div style={{ display: 'flex', marginTop: 26, alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 120, height: 1, background: '#C9A676', opacity: 0.65 }} />
            <div style={{ display: 'flex', marginLeft: 18, fontSize: 18, letterSpacing: 5, color: '#C9A676' }}>
              {week} · {fallbackRows.length} ITEMS
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 48,
            gap: 18,
            position: 'relative',
          }}
        >
          {fallbackRows.map((row, index) => (
            <div
              key={row.id}
              style={{
                display: 'flex',
                padding: '18px 20px',
                border: '1px solid rgba(201,166,118,0.30)',
                borderRadius: 14,
                background: 'rgba(245,240,232,0.055)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 58,
                  flexShrink: 0,
                  color: '#C9A676',
                  fontSize: 20,
                  letterSpacing: 3,
                }}
              >
                {roman(index)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    fontSize: isBook ? 28 : 32,
                    lineHeight: 1.45,
                    fontStyle: isBook ? 'normal' : 'italic',
                    color: '#F5F0E8',
                  }}
                >
                  {fitText(itemText(row), isBook ? 54 : 46)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    marginTop: 10,
                    fontSize: 17,
                    color: 'rgba(245,240,232,0.55)',
                    letterSpacing: 2,
                  }}
                >
                  {row.signature || 'Anonymous'} · 共鸣 {row.echo_count}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            paddingTop: 26,
            borderTop: '1px solid rgba(201,166,118,0.32)',
            justifyContent: 'space-between',
            color: 'rgba(245,240,232,0.58)',
            fontSize: 18,
            letterSpacing: 6,
          }}
        >
          <span>HERMOSA · WTFTI</span>
          <span>HER VOICE COMMONS</span>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
      },
    },
  );
}
