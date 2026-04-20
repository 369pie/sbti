'use client';

/**
 * ContemporaryDeityBadge · 现世化身徽章
 *
 * 第三层「明面 · 现世化身」UI：在 Galaxy 主预览之后、深度档案 CTA 之前出现。
 *
 * 设计动机参考 ../../lib/wtfi/contemporary-deities.ts 顶部注释。
 *
 * Brand voice：
 * - 视觉沿用 Editorial Atelier（玫瑰陶土 / 金箔 / 暮紫底）
 * - 文字升锐：第一人称宣言体咒语 + 一键复制 XHS 评论暗号
 * - 与古典主神不撕裂：用 bridgeFromDeity 一句话承接
 */

import { useCallback, useState } from 'react';

import {
  getContemporaryDeity,
  type ContemporaryDeity,
} from '@/lib/wtfi/contemporary-deities';
import { getDeity } from '@/lib/wtfi/pantheon';
import { trackGalaxyEvent } from '@/lib/wtfi/galaxy-analytics';

interface Props {
  homeSlug: string;
  resultId?: string;
  /** 是否已召唤暗面副形——为真且当前现世化身定义了 shadowEcho 时显示 */
  hasShadow?: boolean;
}

export function ContemporaryDeityBadge({ homeSlug, resultId, hasShadow }: Props) {
  const incarnation = getContemporaryDeity(homeSlug);
  const deity = getDeity(homeSlug);
  if (!incarnation) return null;

  return (
    <section
      aria-label={`现世化身 · ${incarnation.name}`}
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '8px 20px 0',
      }}
    >
      <article
        style={{
          position: 'relative',
          borderRadius: 24,
          padding: '32px 26px 28px',
          background:
            'linear-gradient(170deg, rgba(192,122,142,0.14) 0%, rgba(26,21,48,0) 60%), radial-gradient(ellipse at top, rgba(20,12,60,0.85), rgba(8,5,18,0.95))',
          border: '1px solid rgba(192,122,142,0.32)',
          boxShadow:
            '0 18px 60px rgba(192,122,142,0.18), inset 0 0 0 1px rgba(245,240,232,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* 玫瑰光晕 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-30% -10% auto auto',
            width: 280,
            height: 280,
            background:
              'radial-gradient(circle, rgba(192,122,142,0.55) 0%, transparent 70%)',
            filter: 'blur(60px)',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        <Eyebrow tag={incarnation.tag} />

        <h3
          style={{
            position: 'relative',
            margin: '12px 0 6px',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            fontSize: 28,
            lineHeight: 1.2,
            fontWeight: 500,
            color: '#F5F0E8',
            textAlign: 'center',
          }}
        >
          <span
            aria-hidden
            style={{
              fontStyle: 'normal',
              fontSize: 28,
              marginRight: 10,
              verticalAlign: 'baseline',
            }}
          >
            {incarnation.glyph}
          </span>
          {incarnation.name}
        </h3>

        <p
          style={{
            position: 'relative',
            margin: '0 0 4px',
            textAlign: 'center',
            fontFamily: "'SF Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(212,181,138,0.78)',
          }}
        >
          {incarnation.latinName}
        </p>

        {/* Mantra · 咒语 */}
        <blockquote
          style={{
            position: 'relative',
            margin: '22px auto 8px',
            padding: '18px 22px',
            maxWidth: 520,
            borderRadius: 16,
            background: 'rgba(26,21,48,0.55)',
            border: '1px solid rgba(201,166,118,0.22)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
              fontSize: 20,
              lineHeight: 1.5,
              fontWeight: 500,
              color: '#F5F0E8',
              letterSpacing: '0.02em',
            }}
          >
            「{incarnation.mantra}」
          </p>
        </blockquote>

        {/* Shadow echo · 暗面合体附加 */}
        {hasShadow && incarnation.shadowEcho ? (
          <p
            style={{
              position: 'relative',
              margin: '0 auto 18px',
              maxWidth: 460,
              textAlign: 'center',
              fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: 1.6,
              color: '#9C7CFF',
              letterSpacing: '0.02em',
            }}
          >
            ☽ 暗面合体：「{incarnation.shadowEcho}」
          </p>
        ) : null}

        {/* Bridge from classical deity — 不撕裂叙事 */}
        {deity && (
          <p
            style={{
              position: 'relative',
              margin: '4px auto 22px',
              maxWidth: 460,
              textAlign: 'center',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 12.5,
              lineHeight: 1.7,
              color: 'rgba(245,240,232,0.55)',
              fontStyle: 'italic',
            }}
          >
            ✦ 来自{deity.eastern.name} · {deity.western.name}：
            {incarnation.bridgeFromDeity}
          </p>
        )}

        {/* Creed · 三条信条 */}
        <CreedList items={incarnation.creed} />

        {/* Echoes · 同好暗号一键复制 */}
        <EchoesBlock
          incarnation={incarnation}
          resultId={resultId}
          homeSlug={homeSlug}
        />

        {/* XHS one-click compose · 一键贴小红书评论 */}
        <XhsCompose
          incarnation={incarnation}
          resultId={resultId}
          homeSlug={homeSlug}
        />
      </article>
    </section>
  );
}

function Eyebrow({ tag }: { tag: string }) {
  return (
    <p
      style={{
        position: 'relative',
        margin: 0,
        textAlign: 'center',
        fontFamily: "'SF Mono', ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        color: '#C07A8E',
      }}
    >
      ✦ Contemporary Incarnation · 现世化身 · {tag}
    </p>
  );
}

function CreedList({ items }: { items: readonly string[] }) {
  return (
    <ul
      aria-label="信条"
      style={{
        position: 'relative',
        listStyle: 'none',
        padding: 0,
        margin: '0 auto 22px',
        display: 'grid',
        gap: 10,
        maxWidth: 520,
      }}
    >
      {items.map((line, idx) => (
        <li
          key={idx}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 14.5,
            lineHeight: 1.65,
            color: 'rgba(245,240,232,0.86)',
          }}
        >
          <span
            aria-hidden
            style={{
              flex: '0 0 auto',
              marginTop: 6,
              fontFamily: "'SF Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: '0.18em',
              color: '#C9A676',
            }}
          >
            {romanize(idx + 1)}
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function EchoesBlock({
  incarnation,
  resultId,
  homeSlug,
}: {
  incarnation: ContemporaryDeity;
  resultId?: string;
  homeSlug: string;
}) {
  return (
    <div
      style={{
        position: 'relative',
        borderTop: '1px dashed rgba(201,166,118,0.25)',
        paddingTop: 18,
      }}
    >
      <p
        style={{
          margin: '0 0 10px',
          textAlign: 'center',
          fontFamily: "'SF Mono', ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: '0.42em',
          textTransform: 'uppercase',
          color: 'rgba(212,181,138,0.78)',
        }}
      >
        ✦ Echo Codex · 同好暗号 · 一键复制贴评论区
      </p>
      <div
        style={{
          display: 'grid',
          gap: 8,
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        {incarnation.echoes.map((echo, idx) => (
          <EchoChip
            key={idx}
            text={echo}
            tag={incarnation.tag}
            resultId={resultId}
            homeSlug={homeSlug}
            echoIndex={idx}
          />
        ))}
      </div>
    </div>
  );
}

function EchoChip({
  text,
  tag,
  resultId,
  homeSlug,
  echoIndex,
}: {
  text: string;
  tag: string;
  resultId?: string;
  homeSlug: string;
  echoIndex: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      try {
        trackGalaxyEvent('galaxy_echo_copy', {
          slug: homeSlug,
          props: { resultId, echoIndex, tag },
        });
      } catch {
        /* analytics best-effort */
      }
    } catch {
      // 浏览器不支持 / 用户拒绝；静默失败
    }
  }, [text, tag, homeSlug, resultId, echoIndex]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`复制暗号：${text}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        width: '100%',
        padding: '11px 16px',
        borderRadius: 999,
        border: copied
          ? '1px solid rgba(201,166,118,0.6)'
          : '1px solid rgba(245,240,232,0.16)',
        background: copied
          ? 'rgba(201,166,118,0.18)'
          : 'rgba(245,240,232,0.04)',
        color: '#F5F0E8',
        fontFamily: '"Noto Serif SC", serif',
        fontSize: 13.5,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 160ms ease, border-color 160ms ease',
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.5 }}>{text}</span>
      <span
        aria-hidden
        style={{
          flex: '0 0 auto',
          fontFamily: "'SF Mono', ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: copied ? '#C9A676' : 'rgba(212,181,138,0.7)',
        }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </span>
    </button>
  );
}

function XhsCompose({
  incarnation,
  resultId,
  homeSlug,
}: {
  incarnation: ContemporaryDeity;
  resultId?: string;
  homeSlug: string;
}) {
  const [copied, setCopied] = useState(false);

  // 整段 XHS 文案：mantra + tags + 全部暗号 + 出处
  const composeBody = useCallback(() => {
    const tagSlug = incarnation.tag.replace(/[^A-Z0-9·]+/g, '');
    return [
      `「${incarnation.mantra}」`,
      '',
      `我是 #${incarnation.name}# · WTFTI 现世化身`,
      '',
      ...incarnation.echoes.map((e) => `· ${e}`),
      '',
      `#WTFTI #${tagSlug} #女性人格 #女巫准则`,
    ].join('\n');
  }, [incarnation]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(composeBody());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      try {
        trackGalaxyEvent('galaxy_xhs_compose_copy', {
          slug: homeSlug,
          props: { resultId, tag: incarnation.tag },
        });
      } catch {
        /* analytics best-effort */
      }
    } catch {
      // 浏览器拒绝 / 无 clipboard：静默
    }
  }, [composeBody, homeSlug, resultId, incarnation.tag]);

  return (
    <div
      style={{
        position: 'relative',
        marginTop: 18,
        textAlign: 'center',
      }}
    >
      <button
        type="button"
        onClick={handleCopy}
        aria-label="复制整段 · 贴到小红书"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 22px',
          borderRadius: 999,
          border: 'none',
          background: copied
            ? 'linear-gradient(120deg, #C9A676, #C07A8E)'
            : 'linear-gradient(120deg, #C07A8E, #9C7CFF)',
          color: '#1A1530',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.12em',
          cursor: 'pointer',
          boxShadow: '0 12px 28px rgba(192,122,142,0.32)',
          transition: 'transform 160ms ease',
        }}
      >
        <span aria-hidden style={{ fontSize: 14 }}>✦</span>
        {copied ? '已复制 · 去小红书发帖' : '一键复制整段 · 贴到小红书'}
        <span aria-hidden style={{ fontSize: 14 }}>✦</span>
      </button>
      <p
        style={{
          margin: '10px auto 0',
          maxWidth: 480,
          fontSize: 11,
          lineHeight: 1.7,
          color: 'rgba(245,240,232,0.55)',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        包含咒语 · 身份标签 · 全部暗号 · #WTFTI 话题串
      </p>
    </div>
  );
}

function romanize(n: number): string {
  return ['I', 'II', 'III', 'IV', 'V'][n - 1] ?? String(n);
}
