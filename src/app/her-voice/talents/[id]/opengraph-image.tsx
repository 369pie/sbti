import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = '她说·沙龙｜接单档案';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PAPER = '#F5F0E8';
const INK = '#1A1530';
const INK_MUTED = '#8A817A';
const ACCENT = '#C0512F';
const HAIRLINE = 'rgba(26, 21, 48, 0.14)';

interface Row {
  handle: string;
  pitch: string;
  skills: string[];
  curation_status: string;
  is_published: boolean;
  is_open_to_collab: boolean;
  flagged: boolean;
}

async function tryReadFont(filename: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'assets', 'fonts', filename));
  } catch {
    return null;
  }
}

async function fetchTalent(id: string): Promise<Row | null> {
  try {
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('hermosa_talents')
      .select('handle,pitch,skills,curation_status,is_published,is_open_to_collab,flagged')
      .eq('id', id)
      .maybeSingle();
    return (data as Row) ?? null;
  } catch {
    return null;
  }
}

export default async function TalentOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await fetchTalent(id);
  const handle = t?.is_published && !t.flagged ? t.handle : '她说·沙龙';
  const pitch =
    t?.is_published && !t.flagged
      ? t.pitch
      : '一群不报真名的接单者 · 写作 · 设计 · 咨询 · AI 工程 · 研究';
  const status = t?.curation_status === 'spotlighted' ? 'SPOTLIGHT' : 'OPEN TO COLLAB';
  const offline = t ? !t.is_open_to_collab : false;
  const skills = (t?.skills ?? []).slice(0, 3);

  const [regular, bold] = await Promise.all([
    tryReadFont('noto-sans-sc-social-400.woff'),
    tryReadFont('noto-sans-sc-social-700.woff'),
  ]);
  const fonts = [
    regular ? { name: 'NotoSC', data: regular, weight: 400 as const, style: 'normal' as const } : null,
    bold ? { name: 'NotoSC', data: bold, weight: 700 as const, style: 'normal' as const } : null,
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '70px 80px',
          background: PAPER,
          color: INK,
          fontFamily: 'NotoSC, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top dateline */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 24,
            borderBottom: `1px solid ${INK}`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              letterSpacing: 7,
              color: ACCENT,
              fontWeight: 700,
            }}
          >
            HERMOSA · SALON · TALENT
          </span>
          <span
            style={{
              fontSize: 16,
              letterSpacing: 6,
              color: INK_MUTED,
              fontWeight: 700,
            }}
          >
            暮光博物笔记 · MMXXVI
          </span>
        </div>

        {/* Eyebrow status */}
        <div
          style={{
            marginTop: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 18,
              letterSpacing: 8,
              color: offline ? INK_MUTED : ACCENT,
              fontWeight: 700,
            }}
          >
            § {offline ? 'PAUSED' : status}
          </span>
        </div>

        {/* Handle */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              fontSize: 110,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: INK,
            }}
          >
            {handle}
          </span>
        </div>

        {/* Accent rule */}
        <div
          style={{
            width: 64,
            height: 4,
            background: ACCENT,
            marginTop: 28,
          }}
        />

        {/* Pitch */}
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            paddingLeft: 24,
            borderLeft: `4px solid ${ACCENT}`,
            maxWidth: 1000,
          }}
        >
          <span
            style={{
              fontSize: 36,
              lineHeight: 1.45,
              color: INK,
              fontWeight: 400,
            }}
          >
            「{pitch}」
          </span>
        </div>

        {/* Skills */}
        {skills.length > 0 ? (
          <div
            style={{
              marginTop: 36,
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            {skills.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 18,
                  letterSpacing: 4,
                  color: INK,
                  padding: '10px 18px',
                  border: `1px solid ${HAIRLINE}`,
                  fontWeight: 700,
                }}
              >
                #{s}
              </span>
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 28,
            borderTop: `1px dotted ${HAIRLINE}`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              letterSpacing: 4,
              color: INK_MUTED,
              fontWeight: 400,
            }}
          >
            wtfti.com / her-voice / talents
          </span>
          <span
            style={{
              fontSize: 18,
              letterSpacing: 7,
              color: ACCENT,
              fontWeight: 700,
            }}
          >
            → WHISPER · 双盲投递
          </span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
