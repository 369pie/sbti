'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PERSONALITY_TYPES, getTypeImage } from '@/lib/personalities';
import type { PersonalityType } from '@/lib/personalities';
import { MODEL_COLORS, DIMENSIONS } from '@/lib/dimensions';
import type { ModelType } from '@/lib/dimensions';
import {
  analyzeSquad,
  encodeSquadParams,
  decodeSquadParams,
  getSquadPersonalityImage,
} from '@/lib/squad';
import type { SquadMember, SquadAnalysis } from '@/lib/squad';
import { getSiteUrl } from '@/lib/site';
import { SquadShareImageGenerator } from '@/components/SquadShareImageGenerator';
import type { SquadShareImageGeneratorHandle } from '@/components/SquadShareImageGenerator';

// ─── Step indicator ──────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'w-8 bg-accent' : i === current ? 'w-8 bg-accent/50' : 'w-4 bg-bg-tertiary'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Group naming step ───────────────────────────────────

function GroupNameStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold mb-2">给你们这群人取个名</h2>
      <p className="text-sm text-text-muted mb-6">宿舍号、闺蜜团、部门名 …… 随便起</p>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && onNext()}
        placeholder="例：306宿舍 / 摆烂三人组"
        maxLength={20}
        className="w-full max-w-xs mx-auto block rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-center text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="mt-6 px-8 py-2.5 rounded-xl bg-accent text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-all cursor-pointer"
      >
        下一步
      </button>
    </div>
  );
}

// ─── Add members step ────────────────────────────────────

function AddMembersStep({
  members,
  onAdd,
  onRemove,
  onDone,
  onBack,
}: {
  members: SquadMember[];
  onAdd: (member: SquadMember) => void;
  onRemove: (index: number) => void;
  onDone: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const regular = PERSONALITY_TYPES.filter(p => !p.isSpecial);

  const handleAdd = () => {
    if (!name.trim() || !selectedSlug) return;
    onAdd({ name: name.trim(), slug: selectedSlug });
    setName('');
    setSelectedSlug(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-sm text-text-muted hover:text-text-secondary cursor-pointer">
          ← 返回
        </button>
        <span className="text-xs text-text-muted font-mono">{members.length}/8 人</span>
      </div>

      <h2 className="text-lg font-semibold mb-2 text-center">添加成员</h2>
      <p className="text-sm text-text-muted text-center mb-6">
        每人填昵称 + 选人格类型，至少 2 人
        <br />
        <Link href="/test" className="text-accent hover:underline">还没测？先去测一下</Link>
      </p>

      {/* Current members */}
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {members.map((m, i) => {
            const p = PERSONALITY_TYPES.find(t => t.slug === m.slug);
            return (
              <motion.div
                key={`${m.name}-${m.slug}-${i}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-secondary pl-1.5 pr-2 py-1"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden" style={{ background: `${p?.color}15` }}>
                  <NextImage src={getTypeImage(m.slug)} alt="" width={24} height={24} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs text-text-primary">{m.name}</span>
                <button
                  onClick={() => onRemove(i)}
                  className="text-text-muted hover:text-red-400 text-xs ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {members.length < 8 && (
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="昵称（例：小明）"
            maxLength={10}
            className="w-full max-w-xs mx-auto block rounded-xl border border-border-subtle bg-bg-secondary px-4 py-2.5 text-center text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {regular.map(p => (
              <button
                key={p.slug}
                onClick={() => setSelectedSlug(p.slug)}
                className={`group relative rounded-xl border p-2 text-center transition-all cursor-pointer ${
                  selectedSlug === p.slug
                    ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                    : 'border-border-subtle hover:border-border hover:bg-bg-secondary/50'
                }`}
              >
                <div className="w-14 h-14 mx-auto mb-1 rounded-lg overflow-hidden" style={{ background: `${p.color}15` }}>
                  <NextImage src={getTypeImage(p.slug)} alt={p.name} width={56} height={56} className="w-full h-full object-contain" />
                </div>
                <div className="text-[10px] font-mono tracking-wider truncate" style={{ color: p.color }}>{p.code}</div>
                <div className="text-xs text-text-primary truncate">{p.name}</div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleAdd}
              disabled={!name.trim() || !selectedSlug}
              className="px-6 py-2 rounded-xl bg-accent/15 text-accent font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/25 transition-all cursor-pointer"
            >
              + 添加成员
            </button>
          </div>
        </div>
      )}

      {/* Done button */}
      <div className="text-center mt-8">
        <button
          onClick={onDone}
          disabled={members.length < 2}
          className="px-8 py-2.5 rounded-xl bg-accent text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-all cursor-pointer"
        >
          生成群像 →
        </button>
        {members.length < 2 && members.length > 0 && (
          <p className="text-xs text-text-muted mt-2">至少需要 2 人</p>
        )}
      </div>
    </div>
  );
}

// ─── Metric bar ──────────────────────────────────────────

function MetricBar({ metric }: { metric: { label: string; value: number; emoji: string; comment: string } }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-primary">
          {metric.emoji} {metric.label}
        </span>
        <span className="text-text-muted text-xs">{metric.comment}</span>
      </div>
      <div className="h-2.5 rounded-full bg-bg-tertiary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${metric.value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full bg-accent"
        />
      </div>
      <div className="text-right">
        <span className="text-xs font-mono text-accent">{metric.value}%</span>
      </div>
    </div>
  );
}

// ─── Model radar (simplified horizontal) ─────────────────

function ModelScoresDisplay({ modelScores }: { modelScores: Record<ModelType, number> }) {
  const MODEL_LABELS: Record<ModelType, string> = {
    self: '自我',
    emotion: '情感',
    attitude: '态度',
    action: '行动',
    social: '社交',
  };

  return (
    <div className="space-y-3">
      {(Object.keys(MODEL_LABELS) as ModelType[]).map(model => (
        <div key={model} className="flex items-center gap-3">
          <span className="text-xs w-10 text-right" style={{ color: MODEL_COLORS[model].base }}>
            {MODEL_LABELS[model]}
          </span>
          <div className="flex-1 h-2 rounded-full bg-bg-tertiary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${modelScores[model]}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: MODEL_COLORS[model].base }}
            />
          </div>
          <span className="text-xs font-mono w-8" style={{ color: MODEL_COLORS[model].base }}>
            {Math.round(modelScores[model])}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Result display ──────────────────────────────────────

function SquadResultDisplay({
  analysis,
  onReset,
  onShare,
}: {
  analysis: SquadAnalysis;
  onReset: () => void;
  onShare: () => void;
}) {
  const shareUrl = getSiteUrl(`/squad?${encodeSquadParams(analysis.groupName, analysis.members)}`);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select + copy
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative space-y-8"
    >
      {/* Top-right share button */}
      <button
        onClick={onShare}
        className="absolute -top-2 right-0 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-accent transition-all cursor-pointer z-10"
        title="生成分享图片"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          Squad Result
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
          {analysis.groupName}
        </h2>
        <p className="text-lg text-accent font-medium">「{analysis.title}」</p>
      </div>

      {/* Squad Personality Hero Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border-2 p-6 sm:p-8 text-center"
        style={{ borderColor: analysis.squadPersonality.color, background: `${analysis.squadPersonality.color}08` }}
      >
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl overflow-hidden border-2"
          style={{ borderColor: `${analysis.squadPersonality.color}40`, background: `${analysis.squadPersonality.color}12` }}
        >
          <NextImage
            src={getSquadPersonalityImage(analysis.squadPersonality.code)}
            alt={analysis.squadPersonality.name}
            width={112}
            height={112}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to emoji display
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span style="font-size:3.5rem;line-height:1;display:flex;align-items:center;justify-content:center;height:100%">${analysis.squadPersonality.emoji}</span>`;
              }
            }}
          />
        </div>
        <div
          className="text-lg sm:text-xl font-mono font-extrabold tracking-wider mb-1"
          style={{ color: analysis.squadPersonality.color }}
        >
          {analysis.squadPersonality.code}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">{analysis.squadPersonality.name}</h3>
        <p className="text-sm text-text-secondary mb-3">「{analysis.squadPersonality.tagline}」</p>
        <p className="text-sm text-text-muted leading-relaxed max-w-md mx-auto">{analysis.squadPersonality.description}</p>
      </motion.div>

      {/* Members row */}
      <div className="flex flex-wrap justify-center gap-3">
        {analysis.members.map((m, i) => (
          <motion.div
            key={`${m.slug}-${i}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
            className="text-center"
          >
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 mx-auto mb-1.5"
              style={{ borderColor: m.personality.color, background: `${m.personality.color}10` }}
            >
              <NextImage
                src={getTypeImage(m.slug)}
                alt={m.personality.name}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-xs text-text-primary font-medium">{m.name}</div>
            <div className="text-[10px] font-mono" style={{ color: m.personality.color }}>{m.personality.code}</div>
          </motion.div>
        ))}
      </div>

      {/* Metrics */}
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 sm:p-6 space-y-5">
        <h3 className="text-sm font-semibold text-text-muted">群体指标</h3>
        {analysis.metrics.map((metric) => (
          <MetricBar key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Model average scores */}
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-muted">五大模型均值</h3>
        <ModelScoresDisplay modelScores={analysis.modelScores} />
      </div>

      {/* Highlights */}
      {analysis.highlights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-muted">群体发现</h3>
          {analysis.highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-xl border border-border-subtle bg-bg-secondary p-4 flex gap-3 items-start"
            >
              <span className="text-xl shrink-0">{h.emoji}</span>
              <div>
                <div className="text-sm font-medium text-text-primary">{h.title}</div>
                <div className="text-xs text-text-muted mt-0.5">{h.detail}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <button
          onClick={onShare}
          className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-all cursor-pointer"
        >
          保存群像卡 🖼️
        </button>
        <button
          onClick={handleCopyLink}
          className="px-6 py-2.5 rounded-xl border border-border-subtle text-text-secondary font-medium text-sm hover:bg-bg-secondary transition-all cursor-pointer"
        >
          {copied ? '已复制 ✓' : '复制分享链接'}
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-xl border border-border-subtle text-text-muted font-medium text-sm hover:bg-bg-secondary transition-all cursor-pointer"
        >
          重新组局
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main content ────────────────────────────────────────

export default function SquadContent() {
  const searchParams = useSearchParams();
  const shareRef = useRef<SquadShareImageGeneratorHandle>(null);

  // Try to restore from URL params
  const restored = useMemo(() => decodeSquadParams(searchParams), [searchParams]);

  const [step, setStep] = useState(restored ? 2 : 0); // 0=name, 1=members, 2=result
  const [groupName, setGroupName] = useState(restored?.groupName ?? '');
  const [members, setMembers] = useState<SquadMember[]>(restored?.members ?? []);
  const [analysis, setAnalysis] = useState<SquadAnalysis | null>(() => {
    if (restored) return analyzeSquad(restored.groupName, restored.members);
    return null;
  });

  const handleAddMember = useCallback((member: SquadMember) => {
    setMembers(prev => [...prev, member]);
  }, []);

  const handleRemoveMember = useCallback((index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleGenerate = useCallback(() => {
    const result = analyzeSquad(groupName, members);
    if (result) {
      setAnalysis(result);
      setStep(2);
      // Update URL without navigation
      const params = encodeSquadParams(groupName, members);
      window.history.replaceState(null, '', `?${params}`);
    }
  }, [groupName, members]);

  const handleReset = useCallback(() => {
    setStep(0);
    setGroupName('');
    setMembers([]);
    setAnalysis(null);
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleShare = useCallback(() => {
    shareRef.current?.generate();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header — only show on builder steps */}
      {step < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
            Squad Test
          </span>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
            组局测试
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-md mx-auto">
            拉上你的宿舍/闺蜜/同事，看看你们这群人组合在一起到底有多抽象。
          </p>
        </motion.div>
      )}

      {step < 2 && <StepIndicator current={step} total={2} />}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <GroupNameStep
              value={groupName}
              onChange={setGroupName}
              onNext={() => setStep(1)}
            />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <AddMembersStep
              members={members}
              onAdd={handleAddMember}
              onRemove={handleRemoveMember}
              onDone={handleGenerate}
              onBack={() => setStep(0)}
            />
          </motion.div>
        )}

        {step === 2 && analysis && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SquadResultDisplay
              analysis={analysis}
              onReset={handleReset}
              onShare={handleShare}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {analysis && (
        <SquadShareImageGenerator ref={shareRef} analysis={analysis} />
      )}
    </div>
  );
}
