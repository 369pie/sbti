'use client';

/**
 * CptiPairEntryPanel
 * ─────────────────────────────────────────────────────────────
 * Sprint 1 (2026-04-19) — viral funnel rewrite.
 *
 * Replaces the old InviteAndStealthCTA monolith on the result page.
 * Two cards side-by-side:
 *   A) 发链接给 ta              — directed invite (link)
 *   B) 六位匹配码 + 海报         — public broadcast (pair code, auto-generated)
 *
 * Rules:
 *   - Card B auto-generates the pair code on mount (no extra click).
 *   - Copy is relationship-agnostic: 情侣 / 闺蜜 / 妈 / 同事 / 死对头 都能用.
 *   - Tracks: cpti_pair_panel_viewed, cpti_pair_link_generated,
 *             cpti_pair_code_auto_generated, cpti_pair_code_copied,
 *             cpti_pair_poster_downloaded.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { encodeCptiInvite } from '@/lib/cpti/cpti-invite';
import { loadCptiProfile } from '@/lib/cpti/cpti-profile';
import { cptiApi } from '@/lib/cpti/cpti-api';
import { trackCptiEvent } from '@/lib/cpti/analytics';
import { getSiteUrl } from '@/lib/site';
import type { CptiPersonalityType } from '@/lib/cpti/personalities';

const SCENARIOS = [
  {
    key: 'lover',
    label: '👫 对象 / 暧昧',
    texts: [
      '测测我俩在 25 种关系里是哪一种 →',
      '我俩是灵魂伴侣还是相爱相杀？3 分钟测一下 →',
      '官方鉴定一下，我们到底是 SOUL 还是 LOVERS（欢喜冤家） →',
    ],
  },
  {
    key: 'bestie',
    label: '👯 闺蜜 / 死党',
    texts: [
      '快来测测我们是塑料姐妹还是灵魂伴侣 →',
      '姐妹来鉴定 —— 我们是 TWINS（双子星）还是 PLASTIC（塑料）？',
      '不测就是塑料姐妹，3 分钟见真章 →',
    ],
  },
  {
    key: 'family',
    label: '👨\u200d👩\u200d👧 家人',
    texts: [
      '我俩是 25 种关系里的哪一种？来测一测 →',
      '妈/爸/兄弟姐妹，来给咱们的关系起个新名字 →',
      'cpti 母子/母女版，看看官方怎么定义我们 →',
    ],
  },
  {
    key: 'work',
    label: '💼 同事 / 队友',
    texts: [
      '测测我们的合作关系（25 种里挑一个） →',
      '是 ALLIES（战略同盟）还是 INMATE（狱友）？测一下 →',
      '比团建有用：3 分钟看看我们到底是哪种工作关系 →',
    ],
  },
  {
    key: 'enemy',
    label: '⚔️ 死对头',
    texts: [
      '看看 25 种关系里我俩到底是哪一种 →',
      '到底是 RIVALS（相爱相杀）还是 ENEMIES（塑料死敌）？敢测吗 →',
      '小红书都在搜的 cpti 桃园结义，你我是哪一种 →',
    ],
  },
] as const;

type ScenarioKey = (typeof SCENARIOS)[number]['key'];

interface Props {
  personality: CptiPersonalityType;
}

export function CptiPairEntryPanel({ personality }: Props) {
  const [scenario, setScenario] = useState<ScenarioKey>('lover');
  const [scriptIdx, setScriptIdx] = useState(0);
  const [nickname, setNickname] = useState('');

  // Helper: current invite text based on scenario + script index
  const currentScripts =
    SCENARIOS.find((s) => s.key === scenario)?.texts ?? [''];
  const currentScript = currentScripts[scriptIdx % currentScripts.length] ?? '';
  const cycleScript = useCallback(() => {
    setScriptIdx((i) => (i + 1) % currentScripts.length);
  }, [currentScripts.length]);

  // Card A — invite link
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  // Card B — pair code (auto-generated)
  const [pairCode, setPairCode] = useState('');
  const [pairCodeError, setPairCodeError] = useState(false);
  const [pairCodeCopied, setPairCodeCopied] = useState(false);
  const [posterDownloading, setPosterDownloading] = useState(false);
  const generationStartedRef = useRef(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Fire panel-viewed exactly once when in viewport
  useEffect(() => {
    const node = panelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      trackCptiEvent('cpti_pair_panel_viewed', { personality: personality.slug });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            trackCptiEvent('cpti_pair_panel_viewed', { personality: personality.slug });
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [personality.slug]);

  // Auto-generate pair code on mount (idempotent)
  useEffect(() => {
    if (generationStartedRef.current) return;
    generationStartedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const profile = loadCptiProfile();
        await cptiApi.bootstrap();
        const result = await cptiApi.createPairCode({
          mode: 'direct',
          personalitySlug: profile?.slug ?? personality.slug,
          dimensionScores: profile?.dimensions,
          source: 'self_test',
        });
        if (cancelled) return;
        setPairCode(result.code);
        trackCptiEvent('cpti_pair_code_auto_generated', {
          personality: personality.slug,
          code: result.code,
        });
      } catch (err) {
        if (cancelled) return;
        console.warn('[CPTI] auto pair-code generation failed:', err);
        setPairCodeError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [personality.slug]);

  // ── Card A: invite link ─────────────────────────────────────
  const generateInviteLink = useCallback(() => {
    const profile = loadCptiProfile();
    if (!profile) return;
    const code = encodeCptiInvite({
      nickname: nickname.trim() || '朋友',
      dimensions: profile.dimensions,
      personalitySlug: profile.slug,
    });
    const link = getSiteUrl(`/cpti/invite/?code=${code}`);
    setInviteLink(link);
    trackCptiEvent('cpti_pair_link_generated', {
      personality: personality.slug,
      scenario,
      hasNickname: nickname.trim().length > 0,
    });
  }, [nickname, personality.slug, scenario]);

  const copyInviteLink = useCallback(async () => {
    if (!inviteLink) return;
    const text = `${currentScript}\n${inviteLink}`;
    try {
      await navigator.clipboard.writeText(text);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }, [inviteLink, currentScript]);

  const shareInviteLink = useCallback(async () => {
    if (!inviteLink) return;
    const text = currentScript;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'CPTI · 关系测试', text, url: inviteLink });
        return;
      } catch {
        /* user cancelled */
      }
    }
    void copyInviteLink();
  }, [inviteLink, currentScript, copyInviteLink]);

  // ── Card B: pair code & poster ──────────────────────────────
  const copyPairCode = useCallback(async () => {
    if (!pairCode) return;
    try {
      await navigator.clipboard.writeText(pairCode);
      setPairCodeCopied(true);
      trackCptiEvent('cpti_pair_code_copied', {
        personality: personality.slug,
        method: 'code',
      });
      setTimeout(() => setPairCodeCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }, [pairCode, personality.slug]);

  const copyPairCodeText = useCallback(async () => {
    if (!pairCode) return;
    const link = getSiteUrl(`/cpti/join/`);
    const text =
      `${currentScript}\n` +
      `配对码：${pairCode}\n` +
      `去 ${link.replace(/^https?:\/\//, '')} 输入即可（或点开链接）`;
    try {
      await navigator.clipboard.writeText(text);
      setPairCodeCopied(true);
      trackCptiEvent('cpti_pair_code_copied', {
        personality: personality.slug,
        method: 'text',
      });
      setTimeout(() => setPairCodeCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }, [pairCode, personality.slug, currentScript]);

  const downloadPoster = useCallback(async () => {
    if (!pairCode || posterDownloading) return;
    setPosterDownloading(true);
    try {
      // Lazy load to keep result-page LCP small (project already ships html-to-image)
      const { toPng } = await import('html-to-image');
      const node = document.getElementById('cpti-paircode-poster');
      if (!node) return;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#fdfcfa',
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cpti-paircode-${pairCode}.png`;
      link.click();
      trackCptiEvent('cpti_pair_poster_downloaded', {
        personality: personality.slug,
        code: pairCode,
      });
    } catch (err) {
      console.warn('[CPTI] poster download failed:', err);
    } finally {
      setPosterDownloading(false);
    }
  }, [pairCode, personality.slug, posterDownloading]);

  return (
    <div ref={panelRef} className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
          想知道你和 ta 是 <span className="text-rose-500">25 种关系</span> 里的哪一种？
        </h2>
        <p className="text-sm text-text-muted">
          情侣 · 闺蜜 · 妈 · 同事 · 死对头 — 任何一段关系都能测
        </p>
      </div>

      {/* Scenario chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setScenario(s.key);
              setScriptIdx(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all cursor-pointer border ${
              scenario === s.key
                ? 'border-rose-500/60 bg-rose-500/10 text-rose-500'
                : 'border-border-subtle bg-bg-secondary/40 text-text-muted hover:text-text-secondary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Invite script preview + cycle */}
      <div className="rounded-xl bg-bg-secondary/40 border border-border-subtle px-4 py-3 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">💬</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
            邀请文案 ({(scriptIdx % currentScripts.length) + 1}/{currentScripts.length})
          </div>
          <p className="text-sm text-text-secondary leading-snug">{currentScript}</p>
        </div>
        <button
          onClick={cycleScript}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-text-secondary hover:text-rose-500 hover:border-rose-500/40 transition-colors"
          title="换一个文案"
        >
          换一句 ↻
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ── Card A: 发链接给 ta ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 sm:p-6 flex flex-col"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-mono tracking-wider text-rose-500 uppercase mb-1">Card A</div>
              <h3 className="text-base font-semibold">发链接给 ta</h3>
            </div>
            <span className="text-2xl">💌</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-4">
            适合发给特定的人 · 私聊 / 微信 / 评论区
          </p>

          {!inviteLink ? (
            <div className="space-y-2 mt-auto">
              <input
                type="text"
                placeholder="你的昵称（对方会看到，可不填）"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2.5 rounded-xl border border-border-subtle bg-bg-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-500/40"
              />
              <button
                onClick={generateInviteLink}
                className="w-full py-2.5 rounded-xl bg-rose-500 text-bg-primary font-medium text-sm hover:bg-rose-600 transition-colors cursor-pointer"
              >
                生成专属邀请链接
              </button>
            </div>
          ) : (
            <div className="space-y-2 mt-auto">
              <div className="rounded-xl border border-border-subtle bg-bg-elevated p-2.5">
                <div className="text-[10px] text-text-muted mb-1">邀请链接</div>
                <div className="text-[11px] text-text-secondary break-all font-mono leading-relaxed line-clamp-2">
                  {inviteLink}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyInviteLink}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs text-text-secondary hover:bg-bg-secondary/50 cursor-pointer"
                >
                  {inviteCopied ? '已复制 ✓' : '复制'}
                </button>
                <button
                  onClick={shareInviteLink}
                  className="flex-1 py-2.5 rounded-xl border border-rose-500/40 text-xs text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                >
                  分享给 ta
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Card B: 六位匹配码 + 海报 ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 flex flex-col"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-mono tracking-wider text-amber-500 uppercase mb-1">Card B</div>
              <h3 className="text-base font-semibold">六位匹配码</h3>
            </div>
            <span className="text-2xl">🎫</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-4">
            适合发到群聊 / 小红书 / 朋友圈 — 不限定特定的人
          </p>

          {pairCodeError ? (
            <div className="text-xs text-text-muted text-center py-4">
              生成失败，请刷新重试
            </div>
          ) : !pairCode ? (
            <div className="flex items-center justify-center py-6 text-xs text-text-muted">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
              生成中...
            </div>
          ) : (
            <div className="space-y-2 mt-auto">
              <div className="rounded-xl border border-amber-500/30 bg-bg-elevated p-3 text-center">
                <div className="text-[10px] text-text-muted mb-1">配对码</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold tracking-[0.32em] text-amber-500">
                  {pairCode}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={copyPairCode}
                  className="py-2.5 rounded-xl border border-border text-xs text-text-secondary hover:bg-bg-secondary/50 cursor-pointer"
                >
                  {pairCodeCopied ? '✓' : '复制码'}
                </button>
                <button
                  onClick={copyPairCodeText}
                  className="py-2.5 rounded-xl border border-border text-xs text-text-secondary hover:bg-bg-secondary/50 cursor-pointer"
                >
                  小红书文案
                </button>
                <button
                  onClick={downloadPoster}
                  disabled={posterDownloading}
                  className="py-2.5 rounded-xl border border-amber-500/40 text-xs text-amber-500 hover:bg-amber-500/10 cursor-pointer disabled:opacity-60"
                >
                  {posterDownloading ? '生成…' : '下载海报'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Hidden poster template (off-screen, used by html2canvas) */}
      {pairCode ? (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: -10000,
            left: -10000,
            width: 1080,
            height: 1440,
            pointerEvents: 'none',
          }}
        >
          <PairCodePoster
            pairCode={pairCode}
            personality={personality}
            scenarioText={currentScript}
          />
        </div>
      ) : null}
    </div>
  );
}

/* ── Poster template (1080x1440, 3:4 for Xiaohongshu) ── */
function PairCodePoster({
  pairCode,
  personality,
  scenarioText,
}: {
  pairCode: string;
  personality: CptiPersonalityType;
  scenarioText: string;
}) {
  return (
    <div
      id="cpti-paircode-poster"
      style={{
        width: 1080,
        height: 1440,
        background:
          'linear-gradient(180deg, #fdfcfa 0%, #fdf2f4 60%, #fef3c7 100%)',
        padding: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-display, "Noto Serif SC", serif)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div>
        <div style={{ fontSize: 28, letterSpacing: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          CPTI · 关系图鉴
        </div>
        <div style={{ marginTop: 16, fontSize: 56, fontWeight: 600, lineHeight: 1.1, maxWidth: 760 }}>
          {scenarioText || '测测我俩在 25 种关系里是哪一种'}
        </div>
        <div style={{ marginTop: 24, fontSize: 24, color: 'var(--color-text-muted)' }}>
          5 维度 · 16 角色 · 25 种关系类型
        </div>
      </div>

      <div
        style={{
          alignSelf: 'center',
          padding: '64px 96px',
          borderRadius: 48,
          background: 'color-mix(in oklab, var(--color-bg-primary) 85%, transparent)',
          border: '4px solid rgba(245,158,11,0.5)',
          boxShadow: '0 32px 80px -32px rgba(245,158,11,0.4)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, color: 'var(--color-text-muted)', letterSpacing: 6, marginBottom: 24 }}>
          PAIR CODE
        </div>
        <div
          style={{
            fontSize: 168,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: 16,
            color: '#d97706',
            lineHeight: 1,
          }}
        >
          {pairCode}
        </div>
        <div style={{ marginTop: 20, fontSize: 22, color: 'var(--color-text-muted)' }}>
          打开 wtfti.com/cpti/join 输入即可
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>发起人</div>
          <div style={{ fontSize: 36, fontWeight: 600, marginTop: 8 }}>
            {personality.code} · {personality.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>WTFTI</div>
          <div style={{ fontSize: 28, color: 'var(--color-text-primary)', fontWeight: 600, marginTop: 8 }}>
            wtfti.com/cpti
          </div>
        </div>
      </div>
    </div>
  );
}
