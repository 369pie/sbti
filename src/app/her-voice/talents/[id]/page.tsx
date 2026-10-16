/**
 * /her-voice/talents/[id] — 单个接单档案的可分享详情页
 *
 * SSR：拉 talent 行（仅 published & !flagged）渲染 editorial 卡 + WhisperButton。
 * OG image 由同目录 opengraph-image.tsx 自动生成。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { withBasePath } from '@/lib/site';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { HERMOSA_UNIVERSE_LABELS } from '@/lib/hermosa/tags';
import {
  pageStyle,
  shellStyle,
  datelineStyle,
  datelineRuleStyle,
  eyebrowStyle,
  titleStyle,
  accentRuleStyle,
  ledeStyle,
  ACCENT,
  INK,
  INK_MUTED,
  HAIRLINE,
  HerVoiceMobileStyles,
} from '../../_editorial-styles';
import { WhisperButton } from '../WhisperButton';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Row {
  id: string;
  handle: string;
  pitch: string;
  skills: string[];
  universe: string | null;
  slug: string | null;
  contact_email: string | null;
  contact_note: string | null;
  is_open_to_collab: boolean;
  is_published: boolean;
  flagged: boolean;
  curation_status: string;
  created_at: string;
}

async function fetchTalent(id: string): Promise<Row | null> {
  try {
    const admin = createAdminSupabaseClient();
    const { data } = await admin
      .from('hermosa_talents')
      .select(
        'id,handle,pitch,skills,universe,slug,contact_email,contact_note,is_open_to_collab,is_published,flagged,curation_status,created_at',
      )
      .eq('id', id)
      .maybeSingle();
    return (data as Row) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await fetchTalent(id);
  if (!t || !t.is_published || t.flagged) {
    return { title: '接单档案 · HERMOSA' };
  }
  const title = `${t.handle} · 她说·沙龙接单档案`;
  const description = t.pitch.length > 110 ? t.pitch.slice(0, 108) + '…' : t.pitch;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function TalentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await fetchTalent(id);
  if (!t || !t.is_published || t.flagged) notFound();

  const offline = !t.is_open_to_collab;

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <div style={{ ...shellStyle, maxWidth: 760 }}>
        <div style={datelineStyle}>
          <span>HERMOSA · SALON · TALENT · {t.handle.toUpperCase()}</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 40 }}>
          <div style={eyebrowStyle}>
            § TALENT · {offline ? 'PAUSED' : 'OPEN TO COLLAB'}
          </div>
          <h1 style={titleStyle}>
            {t.handle}
          </h1>
          <div style={accentRuleStyle} />
          <p style={{ ...ledeStyle, fontStyle: 'italic', fontSize: 'clamp(18px, 2.4vw, 22px)', paddingLeft: 16, borderLeft: `3px solid ${ACCENT}` }}>
            「{t.pitch}」
          </p>
        </header>

        {t.skills.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {t.skills.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 11,
                  letterSpacing: '0.24em',
                  color: INK,
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                #{s}
              </span>
            ))}
          </div>
        ) : null}

        <dl
          style={{
            margin: '0 0 32px',
            display: 'grid',
            gap: 0,
            borderTop: `1px solid ${INK}`,
          }}
        >
          {t.universe ? (
            <DetailRow
              k="FROM"
              v={
                HERMOSA_UNIVERSE_LABELS[t.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ??
                t.universe
              }
            />
          ) : null}
          {t.contact_note ? <DetailRow k="NOTE" v={t.contact_note} /> : null}
          <DetailRow
            k="CONTACT"
            v={
              t.contact_email
                ? '可发起 Whisper · 双盲投递'
                : '暂未预留联系通道'
            }
          />
          <DetailRow k="STATUS" v={offline ? '暂停接单 · 不发起 Whisper' : '在岗 · 接受新询问'} />
        </dl>

        {offline ? (
          <div
            style={{
              padding: '20px 22px',
              border: `1px dashed ${HAIRLINE}`,
              fontStyle: 'italic',
              color: INK_MUTED,
              marginBottom: 28,
            }}
          >
            这位接单者暂时切到了 ◯ 暂停接单。可以收藏此页，等她重新营业再来。
          </div>
        ) : t.contact_email ? (
          <WhisperButton talentId={t.id} talentHandle={t.handle} />
        ) : (
          <div
            style={{
              padding: '20px 22px',
              border: `1px dashed ${HAIRLINE}`,
              fontStyle: 'italic',
              color: INK_MUTED,
              marginBottom: 28,
            }}
          >
            她还没预留联系邮箱 —— 暂时无法通过 Whisper 联系。
          </div>
        )}

        <p
          style={{
            marginTop: 48,
            paddingTop: 18,
            borderTop: `1px dotted ${HAIRLINE}`,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            color: INK_MUTED,
            textTransform: 'uppercase',
          }}
        >
          · 双盲机制：项目方永远看不到她的邮箱，她直接 reply 即可联系到对方 ·
        </p>

        <nav style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
          <Link
            href={withBasePath('/her-voice/talents/')}
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11,
              letterSpacing: '0.42em',
              color: INK,
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '12px 22px',
              border: `1px solid ${HAIRLINE}`,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            ← 沙龙名录
          </Link>
          <Link
            href={withBasePath('/her-voice/my/')}
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11,
              letterSpacing: '0.42em',
              color: INK,
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '12px 22px',
              border: `1px solid ${HAIRLINE}`,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            → 写我的接单档案
          </Link>
        </nav>
      </div>
    </main>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr',
        gap: 14,
        padding: '14px 0',
        borderBottom: `1px dotted ${HAIRLINE}`,
      }}
    >
      <dt
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.32em',
          color: INK_MUTED,
          textTransform: 'uppercase',
        }}
      >
        {k}
      </dt>
      <dd style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: INK, lineHeight: 1.6 }}>
        {v}
      </dd>
    </div>
  );
}
