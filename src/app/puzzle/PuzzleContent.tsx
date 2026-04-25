'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PERSONALITY_TYPES, getTypeThumbnailImage } from '@/lib/personalities';
import {
  analyzePuzzle,
  encodePuzzleParams,
  decodePuzzleParams,
  generatePuzzleShareText,
} from '@/lib/puzzle';
import type { PuzzleData, PuzzlePiece } from '@/lib/puzzle';
import { getSiteUrl } from '@/lib/site';

// ─── Puzzle grid ────────────────────────────────────────

const CORNER_LABELS = ['左上', '右上', '左下', '右下'];
const CORNER_POSITIONS = [
  'rounded-tl-3xl rounded-br-lg',
  'rounded-tr-3xl rounded-bl-lg',
  'rounded-bl-3xl rounded-tr-lg',
  'rounded-br-3xl rounded-tl-lg',
];
const CORNER_COLORS = ['#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b'];

function PuzzleGrid({
  data,
  onFillSlot,
}: {
  data: PuzzleData;
  onFillSlot: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
      {[0, 1, 2, 3].map(i => {
        const piece = data.pieces[i];
        const p = piece ? PERSONALITY_TYPES.find(t => t.slug === piece.slug) : null;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            {p && piece ? (
              <div
                className={`${CORNER_POSITIONS[i]} border-2 p-4 text-center min-h-[140px] flex flex-col items-center justify-center`}
                style={{ borderColor: p.color, background: `${p.color}08` }}
              >
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden mb-2"
                  style={{ background: `${p.color}15` }}
                >
                  <NextImage
                    src={getTypeThumbnailImage(piece.slug)}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs font-medium text-text-primary">{piece.name}</div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: p.color }}>{p.name}</div>
              </div>
            ) : (
              <button
                onClick={() => onFillSlot(i)}
                className={`${CORNER_POSITIONS[i]} border-2 border-dashed p-4 text-center min-h-[140px] flex flex-col items-center justify-center transition-all hover:bg-bg-secondary/50 cursor-pointer group`}
                style={{ borderColor: `${CORNER_COLORS[i]}40` }}
              >
                <div className="text-3xl mb-2 opacity-30 group-hover:opacity-60 transition-opacity">❓</div>
                <div className="text-xs text-text-muted">{CORNER_LABELS[i]}</div>
                <div className="text-xs text-accent mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  点击加入
                </div>
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Fill slot form ──────────────────────────────────────

function FillSlotForm({
  slotIndex,
  onFill,
  onBack,
}: {
  slotIndex: number;
  onFill: (piece: PuzzlePiece) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const regular = PERSONALITY_TYPES.filter(p => !p.isSpecial);

  const handleSubmit = () => {
    if (!name.trim() || !selectedSlug) return;
    onFill({ name: name.trim(), slug: selectedSlug });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-text-muted hover:text-text-secondary cursor-pointer">
          ← 返回拼图
        </button>
        <span className="text-xs text-text-muted">填入{CORNER_LABELS[slotIndex]}位置</span>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-primary mb-1">加入拼图</h2>
        <p className="text-sm text-text-muted">
          选择你的人格加入
          <br />
          <Link href="/test/" className="text-accent hover:underline">还没测？先去测一下</Link>
        </p>
      </div>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && selectedSlug && handleSubmit()}
        placeholder="你的昵称"
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
            <div className="w-12 h-12 mx-auto mb-1 rounded-lg overflow-hidden" style={{ background: `${p.color}15` }}>
              <NextImage src={getTypeThumbnailImage(p.slug)} alt={p.name} width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div className="text-[10px] font-mono tracking-wider truncate" style={{ color: p.color }}>{p.code}</div>
            <div className="text-xs text-text-primary truncate">{p.name}</div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !selectedSlug}
          className="px-8 py-2.5 rounded-xl bg-accent text-bg-primary font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-all cursor-pointer"
        >
          放入拼图 🧩
        </button>
      </div>
    </div>
  );
}

// ─── Create step ─────────────────────────────────────────

function CreateStep({ onNext }: { onNext: (title: string) => void }) {
  const [title, setTitle] = useState('');

  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold mb-2">给你们的拼图取个名</h2>
      <p className="text-sm text-text-muted mb-6">闺蜜团名 / 宿舍名 / CP名 …</p>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && title.trim() && onNext(title.trim())}
        placeholder="例：最佳损友 / 命运四人组"
        maxLength={20}
        className="w-full max-w-xs mx-auto block rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-center text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      <button
        onClick={() => title.trim() && onNext(title.trim())}
        disabled={!title.trim()}
        className="mt-6 px-8 py-2.5 rounded-xl bg-accent text-bg-primary font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-all cursor-pointer"
      >
        创建拼图
      </button>
    </div>
  );
}

// ─── Main content ────────────────────────────────────────

export default function PuzzleContent() {
  const searchParams = useSearchParams();
  const restored = useMemo(() => decodePuzzleParams(searchParams), [searchParams]);

  const [data, setData] = useState<PuzzleData | null>(restored);
  const [fillingSlot, setFillingSlot] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const result = useMemo(() => data ? analyzePuzzle(data) : null, [data]);

  const shareUrl = data
    ? getSiteUrl(`/puzzle/?${encodePuzzleParams(data)}`)
    : '';

  const handleCreate = useCallback((title: string) => {
    const d: PuzzleData = { title, pieces: [null, null, null, null] };
    setData(d);
    setFillingSlot(0); // auto-open first slot
  }, []);

  const handleFill = useCallback((piece: PuzzlePiece) => {
    if (fillingSlot === null || !data) return;
    const newPieces = [...data.pieces];
    newPieces[fillingSlot] = piece;
    const newData: PuzzleData = { ...data, pieces: newPieces };
    setData(newData);
    setFillingSlot(null);
    // Update URL
    const params = encodePuzzleParams(newData);
    window.history.replaceState(null, '', `?${params}`);
  }, [fillingSlot, data]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ok */ }
  }, [shareUrl]);

  const handleCopyText = useCallback(async () => {
    if (!result) return;
    try {
      const text = generatePuzzleShareText(result, shareUrl);
      await navigator.clipboard.writeText(text);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
    } catch { /* ok */ }
  }, [result, shareUrl]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12 text-center"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-2">
          Bestie Puzzle
        </span>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-2">
          闺蜜人格拼图
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-md mx-auto">
          4 个人 · 4 块拼图 · 1 张闺蜜卡<br />
          每人填一块，拼完看化学反应
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Create puzzle */}
        {!data && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <CreateStep onNext={handleCreate} />
          </motion.div>
        )}

        {/* Step 2: Fill slot form */}
        {data && fillingSlot !== null && (
          <motion.div
            key="fill"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <FillSlotForm
              slotIndex={fillingSlot}
              onFill={handleFill}
              onBack={() => setFillingSlot(null)}
            />
          </motion.div>
        )}

        {/* Step 3: Puzzle view */}
        {data && fillingSlot === null && (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">{data.title}</h2>
              <p className="text-sm text-text-muted mt-1">
                {result ? `${result.filledCount}/4 · ${result.isComplete ? '拼图完成！' : '等待更多人加入'}` : '点击空位加入'}
              </p>
            </div>

            <PuzzleGrid data={data} onFillSlot={setFillingSlot} />

            {/* Chemistry result (when complete) */}
            {result?.isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border-2 border-accent/30 bg-gradient-to-b from-accent-dim to-transparent p-6 text-center"
              >
                <div className="text-4xl mb-2">{result.chemistryEmoji}</div>
                <h3 className="text-lg font-bold text-text-primary">{result.chemistryType}</h3>
                <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto">
                  {result.chemistryDesc}
                </p>
              </motion.div>
            )}

            {/* Incomplete toast */}
            {result && !result.isComplete && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                <p className="text-sm text-text-secondary">
                  还差 <span className="font-bold text-amber-600">{4 - result.filledCount}</span> 人
                  <br />
                  <span className="text-xs text-text-muted">复制链接发给闺蜜，让ta填入自己的人格</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-2.5 rounded-xl bg-accent text-bg-primary font-medium text-sm hover:bg-accent/90 transition-all cursor-pointer"
                >
                  {copied ? '已复制 ✓' : '📩 复制拼图邀请链接'}
                </button>
                {result && (
                  <button
                    onClick={handleCopyText}
                    className="px-6 py-2.5 rounded-xl border border-accent/20 bg-accent-dim text-accent text-sm font-medium hover:bg-accent/10 transition-all cursor-pointer"
                  >
                    {textCopied ? '已复制 ✓' : '复制文案'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
