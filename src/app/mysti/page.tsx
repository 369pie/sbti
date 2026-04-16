'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { WTFTI_PERSONALITIES, getWtftiPersonality } from '@/lib/wtfti-personalities';
import { getMystiTarotData } from '@/lib/mysti/tarot-mapping';
import { trackMystiEvent } from '@/lib/mysti/analytics';

function MystiLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSlug, setSelectedSlug] = useState<string>('');

  // Partner slug from URL (the person who shared)
  const partnerSlug = searchParams.get('slug') || '';
  const partnerPersonality = partnerSlug ? getWtftiPersonality(partnerSlug) : undefined;
  const partnerData = partnerPersonality ? getMystiTarotData(partnerPersonality.slug) : null;

  // Track return landing flow
  useEffect(() => {
    if (partnerSlug && partnerPersonality) {
      trackMystiEvent('mysti_return_landing', { partnerSlug });
    }
  }, [partnerSlug, partnerPersonality]);

  const handleStart = () => {
    if (!selectedSlug) return;
    if (partnerSlug && partnerPersonality) {
      trackMystiEvent('mysti_return_complete', { selectedSlug, partnerSlug });
    }
    const url = partnerSlug
      ? `/mysti/result/${selectedSlug}?partner=${partnerSlug}`
      : `/mysti/result/${selectedSlug}`;
    router.push(url);
  };

  const handleRandom = () => {
    const idx1 = Math.floor(Math.random() * WTFTI_PERSONALITIES.length);
    let idx2 = Math.floor(Math.random() * (WTFTI_PERSONALITIES.length - 1));
    if (idx2 >= idx1) idx2 += 1;
    const p1 = WTFTI_PERSONALITIES[idx1];
    const p2 = WTFTI_PERSONALITIES[idx2];
    router.push(`/mysti/result/${p1.slug}?partner=${p2.slug}`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(180deg, #0B0D17 0%, #12152B 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#F3EFE6' }}>
            WTFTI <span style={{ color: '#C9A86C' }}>·</span> 灵鉴
          </h1>
          <p className="text-sm" style={{ color: '#A7B0C8' }}>
            用塔罗重新翻译你的人格
          </p>
        </div>

        {/* Return flow: partner card preview */}
        {partnerPersonality && partnerData && (
          <div
            className="rounded-2xl border p-5 mb-5 text-center"
            style={{
              background: 'rgba(18,21,43,0.8)',
              borderColor: 'rgba(201,168,108,0.35)',
              boxShadow: '0 0 40px rgba(123,97,255,0.12)',
            }}
          >
            <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: '#C9A86C' }}>
              TA 的灵魂牌
            </div>
            <div className="text-4xl font-serif mb-1" style={{ color: '#C9A86C' }}>
              {partnerData.majorArcana.name.slice(0, 1)}
            </div>
            <div className="text-2xl mb-1">{partnerPersonality.emoji}</div>
            <div className="text-base font-semibold mb-1" style={{ color: '#F3EFE6' }}>
              {partnerData.majorArcana.name}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <span className="font-mono text-sm" style={{ color: '#A7B0C8' }}>{partnerPersonality.code}</span>
              <span style={{ color: '#A7B0C8' }}>·</span>
              <span className="text-sm" style={{ color: '#F3EFE6' }}>{partnerPersonality.wtftiName}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {partnerData.majorArcana.keywords.slice(0, 3).map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-[11px] border"
                  style={{
                    borderColor: 'rgba(201,168,108,0.35)',
                    background: 'rgba(201,168,108,0.22)',
                    color: '#C9A86C',
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Selection area */}
          <div
            className="rounded-xl px-4 py-3 border"
            style={{ background: 'rgba(18,21,43,0.8)', borderColor: 'rgba(201,168,108,0.35)' }}
          >
            <label className="block text-xs mb-1.5" style={{ color: '#C9A86C' }}>
              {partnerPersonality ? '你是哪张牌？' : '你的人格'}
            </label>
            <select
              value={selectedSlug}
              onChange={e => setSelectedSlug(e.target.value)}
              className="w-full bg-transparent outline-none cursor-pointer text-sm"
              style={{ color: '#F3EFE6' }}
            >
              <option value="" style={{ background: '#12152B' }}>
                {partnerPersonality ? '选择你的灵魂牌' : '请选择你的 WTFTI 人格'}
              </option>
              {WTFTI_PERSONALITIES.map(p => (
                <option key={p.slug} value={p.slug} style={{ background: '#12152B' }}>
                  {p.emoji} {p.wtftiName}
                </option>
              ))}
            </select>
          </div>

          {!partnerPersonality && (
            <div
              className="rounded-xl px-4 py-3 border"
              style={{ background: 'rgba(18,21,43,0.8)', borderColor: 'rgba(201,168,108,0.35)' }}
            >
              <label className="block text-xs mb-1.5" style={{ color: '#C9A86C' }}>
                对方人格 / 单人留空
              </label>
              <select
                value=""
                onChange={e => {
                  if (e.target.value) {
                    router.push(`/mysti/result/${selectedSlug}?partner=${e.target.value}`);
                  }
                }}
                className="w-full bg-transparent outline-none cursor-pointer text-sm"
                style={{ color: '#F3EFE6' }}
              >
                <option value="" style={{ background: '#12152B' }}>单人解读</option>
                {WTFTI_PERSONALITIES.map(p => (
                  <option key={p.slug} value={p.slug} style={{ background: '#12152B' }}>
                    {p.emoji} {p.wtftiName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Primary CTA */}
          <button
            onClick={handleStart}
            disabled={!selectedSlug}
            className="w-full py-3.5 rounded-xl text-white font-medium text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(90deg, #7B61FF, #C9A86C)' }}
          >
            {partnerPersonality ? '✦ 开始合盘' : '🔮 开始解读'}
          </button>

          {/* Secondary CTA */}
          <Link
            href="/wtfti/test/?mode=mysti"
            className="block w-full py-3 rounded-xl border text-sm font-medium text-center hover:bg-white/5 transition-all"
            style={{ borderColor: 'rgba(123,97,255,0.45)', color: '#B8B0FF' }}
          >
            🃏 还没测过？开始测试
          </Link>
        </div>

        {/* Tertiary actions - compact row */}
        {!partnerPersonality && (
          <div className="mt-5 flex items-center gap-2.5">
            <button
              onClick={handleRandom}
              className="flex-1 py-2.5 rounded-lg border text-xs font-medium hover:bg-white/5 transition-all"
              style={{ borderColor: 'rgba(201,168,108,0.3)', color: '#C9A86C' }}
            >
              🎲 随机
            </button>
            <Link
              href="/mysti/daily/"
              className="flex-1 py-2.5 rounded-lg border text-xs font-medium text-center hover:bg-white/5 transition-all"
              style={{ borderColor: 'rgba(201,168,108,0.3)', color: '#C9A86C' }}
            >
              ✦ 每日一牌
            </Link>
            <Link
              href="/mysti/gacha/"
              className="flex-1 py-2.5 rounded-lg border text-xs font-medium text-center hover:bg-white/5 transition-all"
              style={{ borderColor: 'rgba(123,97,255,0.3)', color: '#B8B0FF' }}
            >
              🎴 抽卡
            </Link>
          </div>
        )}

        <p className="text-center text-[11px] mt-6" style={{ color: 'rgba(167,176,200,0.5)' }}>
          {partnerPersonality
            ? '测试你的灵魂牌，解锁双人合盘解读'
            : '选择两个人格，探索你们的灵魂绑定'}
        </p>
      </div>
    </div>
  );
}

export default function MystiLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0B0D17 0%, #12152B 100%)' }}><div className="text-sm" style={{ color: '#A7B0C8' }}>加载中…</div></div>}>
      <MystiLandingContent />
    </Suspense>
  );
}
