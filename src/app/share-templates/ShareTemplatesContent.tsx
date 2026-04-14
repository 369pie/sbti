'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadCard, CARD_UNIVERSE_IDS } from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';
import { SHARE_SITE_URL } from '@/lib/site';

const emptySubscribe = () => () => {};

// ─── Template data ───────────────────────────────────────

interface Template {
  id: string;
  title: string;
  emoji: string;
  platform: string;
  generate: (ctx: TemplateContext) => string;
}

interface TemplateContext {
  names: string[];       // personality names across universes
  universeNames: string[];
  totalLit: number;
  totalUniverses: number;
  url: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'xhs-basic',
    title: '小红书 · 基础晒卡',
    emoji: '📕',
    platform: '小红书',
    generate: ctx => {
      const top3 = ctx.names.slice(0, 3);
      return [
        `测了 ${ctx.totalLit} 个宇宙的人格测试，我居然是：`,
        '',
        ...top3.map((n, i) => `${['🥇', '🥈', '🥉'][i]} ${ctx.universeNames[i]}：${n}`),
        ctx.names.length > 3 ? `还有 ${ctx.names.length - 3} 个更离谱的结果……` : '',
        '',
        `每个宇宙都不一样也太好玩了吧 😂`,
        `谁来跟我比一下？WTFTI多宇宙人格测试 👇`,
        '',
        ctx.url,
        '',
        '#WTFTI #人格测试 #MBTI #性格测试 #多宇宙人格 #sb测试',
      ].filter(Boolean).join('\n');
    },
  },
  {
    id: 'xhs-question',
    title: '小红书 · 提问体',
    emoji: '❓',
    platform: '小红书',
    generate: ctx => {
      const rand = ctx.names[Math.floor(Math.random() * ctx.names.length)];
      return [
        `你们觉得我像${rand}吗？？？`,
        '',
        `刚测了一个超准的多宇宙人格测试`,
        `同一个我，在不同宇宙居然是完全不同的人格`,
        '',
        ...ctx.names.slice(0, 4).map((n, i) => `${ctx.universeNames[i]}版的我：${n}`),
        '',
        `有没有姐妹来测测，看看你在每个宇宙是什么 🧐`,
        '',
        ctx.url,
        '',
        '#WTFTI #多宇宙人格测试 #性格测试 #测试游戏 #人格鉴定',
      ].filter(Boolean).join('\n');
    },
  },
  {
    id: 'xhs-roast',
    title: '小红书 · 自嘲体',
    emoji: '🤡',
    platform: '小红书',
    generate: ctx => {
      return [
        `我测了个人格测试，结果被骂了一路`,
        '',
        `这个 WTFTI 多宇宙人格测试也太毒舌了`,
        `${ctx.totalLit} 个宇宙测下来，没一个在夸我 😭`,
        '',
        ...ctx.names.slice(0, 3).map(n => `· ${n}`),
        '',
        `但说实话……每个都挺准的（小声）`,
        `姐妹们快来测测被骂什么 👇`,
        '',
        ctx.url,
        '',
        '#人格测试 #WTFTI #被骂了 #毒舌测试 #sb测试 #性格测试',
      ].join('\n');
    },
  },
  {
    id: 'wechat-friend',
    title: '微信 · 发给闺蜜',
    emoji: '💬',
    platform: '微信',
    generate: ctx => {
      return [
        `你快来测这个！！`,
        `我居然是${ctx.names[0]} 哈哈哈哈`,
        '',
        `而且它有 ${ctx.totalUniverses} 个宇宙，同一个你每个宇宙结果都不一样`,
        `测完还能对比看你和我有多像`,
        '',
        `👉 ${ctx.url}`,
      ].join('\n');
    },
  },
  {
    id: 'wechat-group',
    title: '微信 · 水群神器',
    emoji: '🏠',
    platform: '微信群',
    generate: ctx => {
      return [
        `来来来，看看咱们群最多的是什么人格 🏆`,
        '',
        `WTFTI多宇宙人格测试，测完把你的结果发到群里`,
        `${ctx.totalUniverses} 个宇宙都可以测`,
        '',
        `我的结果：`,
        ...ctx.names.slice(0, 3).map((n, i) => `${ctx.universeNames[i]}版：${n}`),
        '',
        `你们是什么？👉 ${ctx.url}`,
      ].join('\n');
    },
  },
  {
    id: 'douyin',
    title: '抖音 · 评论区引流',
    emoji: '🎵',
    platform: '抖音',
    generate: ctx => {
      return [
        `测了个多宇宙人格测试笑死我了`,
        `我居然在不同宇宙是完全不同的人 😂`,
        '',
        `${ctx.names.slice(0, 2).join(' + ')}`,
        '',
        `搜"WTFTI"或者"sb测试"就能找到`,
        '',
        '#WTFTI #人格测试 #多宇宙 #性格测试 #sb测试',
      ].join('\n');
    },
  },
];

// ─── Template card ───────────────────────────────────────

function TemplateCard({
  template,
  ctx,
  delay,
}: {
  template: Template;
  ctx: TemplateContext;
  delay: number;
}) {
  const [copied, setCopied] = useState(false);
  const text = template.generate(ctx);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ok */ }
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-border-subtle bg-bg-elevated overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{template.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{template.title}</h3>
            <span className="text-[10px] text-text-muted">{template.platform}</span>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-xl p-3 text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {text}
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-3 text-sm font-medium text-accent bg-accent-dim hover:bg-accent/10 transition-colors border-t border-border-subtle cursor-pointer"
      >
        {copied ? '已复制 ✓' : '一键复制'}
      </button>
    </motion.div>
  );
}

// ─── Main content ────────────────────────────────────────

export default function ShareTemplatesContent() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [ctx, setCtx] = useState<TemplateContext | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!mounted) return;

    const card = loadCard();
    const names: string[] = [];
    const universeNames: string[] = [];

    if (card) {
      for (const uid of CARD_UNIVERSE_IDS) {
        const r = card.results[uid];
        if (r) {
          const u = getUniverse(uid);
          const resolved = resolvePersonality(uid, r.slug);
          if (u && resolved) {
            names.push(resolved.name);
            universeNames.push(u.name);
          }
        }
      }
    }

    setCtx({
      names: names.length > 0 ? names : ['情绪小怪兽', '社恐大师', '浪漫泡泡'],
      universeNames: universeNames.length > 0 ? universeNames : ['标准版', 'WTF毒舌版', '修仙2.0'],
      totalLit: names.length || 3,
      totalUniverses: CARD_UNIVERSE_IDS.length,
      url: SHARE_SITE_URL,
    });
  }, [mounted]);

  const platforms = ['all', '小红书', '微信', '微信群', '抖音'];
  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.platform === filter);

  if (!ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          UGC Templates
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
          分享文案模板
        </h1>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          {ctx.names.length > 0 && ctx.totalLit > 0
            ? '基于你的测试结果自动生成，一键复制发到任何平台'
            : '先去测试，结果会自动填入模板'}
        </p>
        {ctx.totalLit === 0 && (
          <Link
            href="/test/"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            先去测一个 →
          </Link>
        )}
      </motion.div>

      {/* Platform filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 justify-center">
        {platforms.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              filter === p
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
            }`}
          >
            {p === 'all' ? '全部' : p}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid gap-4">
        {filtered.map((t, i) => (
          <TemplateCard key={t.id} template={t} ctx={ctx} delay={0.1 + i * 0.05} />
        ))}
      </div>
    </div>
  );
}
