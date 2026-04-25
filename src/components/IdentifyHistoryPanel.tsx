'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { identifyApi, type IdentifyAssessmentEntry, type IdentifyHistoryResponse } from '@/lib/identify/api';
import { getIdentifyPersonaBySlug } from '@/lib/identify/personas';

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffHours = Math.floor((now - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return '刚刚';
  if (diffHours < 24) return `${diffHours} 小时前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
}

function AssessmentRow({
  entry,
  mode,
  direction,
}: {
  entry: IdentifyAssessmentEntry;
  mode: 'sent' | 'received';
  direction: 'home' | 'card';
}) {
  const persona = getIdentifyPersonaBySlug(entry.personaSlug);
  if (!persona) return null;

  const title = mode === 'sent'
    ? `你鉴定了 ${entry.subjectDisplayName || 'ta'}`
    : `${entry.actorDisplayName || '你的朋友'} 鉴定了你`;

  const subtitle = mode === 'sent'
    ? `${persona.name} · ${persona.tagline}`
    : `${persona.name} · ${entry.subjectDisplayName || '你'} 在 ta 眼里是这样`;

  return (
    <Link
      href={`/identify/result/${entry.personaSlug}/?r=${encodeURIComponent(entry.shareToken)}`}
      className="block rounded-2xl border border-border-subtle bg-bg-elevated p-4 hover:border-pink-500/25 hover:bg-pink-500/5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: `${persona.color}14`,
              color: persona.color,
            }}
          >
            {persona.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{title}</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{subtitle}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[11px] font-mono tracking-wide" style={{ color: persona.color }}>
            {persona.code}
          </p>
          <p className="text-[11px] text-text-muted mt-1">{formatDateLabel(entry.createdAt)}</p>
          {mode === 'received' && !entry.subjectViewedAt && (
            <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[10px] font-medium">
              NEW
            </span>
          )}
        </div>
      </div>

      {direction === 'card' && mode === 'sent' && entry.challengeOpenedAt && (
        <p className="text-[11px] text-emerald-500 mt-3">对方已经打开过这份鉴定</p>
      )}
    </Link>
  );
}

export function IdentifyHistoryPanel({
  variant = 'home',
  onLoaded,
}: {
  variant?: 'home' | 'card';
  onLoaded?: (hasAny: boolean) => void;
}) {
  const [data, setData] = useState<IdentifyHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    identifyApi
      .getHistory()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        onLoaded?.(Boolean(result && (result.summary.sentCount > 0 || result.summary.receivedCount > 0)));
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        onLoaded?.(false);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onLoaded]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasAny = data.summary.sentCount > 0 || data.summary.receivedCount > 0;
  if (!hasAny) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            🔍 {variant === 'card' ? '灵鉴档案' : '最近的灵鉴资产'}
          </h3>
          <p className="text-xs text-text-muted mt-1">
            我鉴定过的人，以及别人留给你的鉴定
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-mono text-text-muted">发起 {data.summary.sentCount}</p>
          <p className="text-[11px] font-mono text-text-muted">收到 {data.summary.receivedCount}</p>
        </div>
      </div>

      {data.summary.receivedCount > 0 && data.summary.receivedLocked && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-sm font-medium text-text-primary">
            有 {data.summary.receivedCount} 人鉴定了你
          </p>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            先认领账号，再看是谁分析了你。这样这些被鉴定记录才不会丢。
          </p>
          <Link
            href="/auth/claimed?next=/identify/"
            className="inline-flex mt-3 px-4 py-2 rounded-full bg-rose-500 text-bg-primary text-sm font-medium hover:bg-rose-600 transition-colors"
          >
            登录查看谁鉴定了你
          </Link>
        </div>
      )}

      {!data.summary.receivedLocked && data.summary.unreadReceivedCount > 0 && (
        <div className="rounded-2xl border border-pink-500/20 bg-pink-500/6 p-4">
          <p className="text-sm font-medium text-text-primary">有人新鉴定了你</p>
          <p className="text-xs text-text-muted mt-1">
            你有 {data.summary.unreadReceivedCount} 条还没看的灵鉴记录。
          </p>
        </div>
      )}

      {data.sent.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono tracking-wider text-text-muted uppercase">我鉴定过的人</p>
            <span className="text-[11px] text-text-muted">最近 {Math.min(data.sent.length, 20)} 条</span>
          </div>
          <div className="space-y-3">
            {data.sent.slice(0, variant === 'home' ? 3 : 6).map((entry) => (
              <AssessmentRow key={entry.id} entry={entry} mode="sent" direction={variant} />
            ))}
          </div>
        </div>
      )}

      {!data.summary.receivedLocked && data.received.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono tracking-wider text-text-muted uppercase">鉴定我的人</p>
            <span className="text-[11px] text-text-muted">最近 {Math.min(data.received.length, 20)} 条</span>
          </div>
          <div className="space-y-3">
            {data.received.slice(0, variant === 'home' ? 3 : 6).map((entry) => (
              <AssessmentRow key={entry.id} entry={entry} mode="received" direction={variant} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}