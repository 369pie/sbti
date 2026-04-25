'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import {
  parseChallengeFromUrl,
  getModeDisplayName,
  getModeEmoji,
  type ChallengeData,
} from '@/lib/mirror/challenge';
import { getMirrorResults, type MirrorRecord } from '@/lib/wtf-card';

function ChallengeContent() {
  const searchParams = useSearchParams();
  const challengerData = parseChallengeFromUrl(searchParams);

  const [myResults] = useState<MirrorRecord[]>(() => getMirrorResults());
  const myLatest = myResults[0] ?? null;

  // If no challenge data, show "发起挑战" page
  if (!challengerData) {
    return <NoChallengeView myLatest={myLatest} />;
  }

  // If has challenge data, show "接受挑战" page
  return <ChallengeView challenger={challengerData} myLatest={myLatest} />;
}

function NoChallengeView({ myLatest }: { myLatest: MirrorRecord | null }) {
  return (
    <div className="wtfti-site-shell">
      <section className="wtfti-section pt-16 sm:pt-24">
        <div className="wtfti-container max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="serial-number text-sm">Challenge</span>
            <span className="editorial-rule w-20" />
            <span className="eyebrow">灵镜挑战</span>
          </div>

          <h1 className="wtfti-display text-4xl sm:text-6xl mb-6">
            发起一个
            <span className="block text-rose-deep">灵镜挑战</span>
          </h1>

          <p className="wtfti-copy mb-10">
            先做一次灵镜测试，然后分享给好友，看看谁的风格更有趣。
          </p>

          {myLatest ? (
            <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/60 p-6 sm:p-8 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getModeEmoji(myLatest.mode)}</span>
                <div>
                  <p className="eyebrow text-[0.58rem]">{getModeDisplayName(myLatest.mode)}</p>
                  <p className="text-sm text-text-muted">{myLatest.testedAt}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-text-secondary">{myLatest.summary}</p>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-border-subtle bg-bg-elevated/30 p-8 mb-8">
              <p className="text-text-muted">你还没有做过灵镜测试</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/mirror/" className="btn btn-rose">
              去做灵镜测试
              <span className="opacity-70">→</span>
            </Link>
            <Link href="/mirror/leaderboard/" className="btn btn-ghost">
              查看排行榜
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChallengeView({
  challenger,
  myLatest,
}: {
  challenger: ChallengeData;
  myLatest: MirrorRecord | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="wtfti-site-shell">
      <section className="wtfti-section pt-16 sm:pt-24">
        <div className="wtfti-container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="serial-number text-sm">Challenge</span>
              <span className="editorial-rule w-20" />
              <span className="eyebrow">灵镜挑战</span>
            </div>

            <h1 className="wtfti-display text-4xl sm:text-6xl mb-6">
              有人向你发起
              <span className="block text-rose-deep">灵镜挑战</span>
            </h1>
          </div>

          {/* Challenger's result */}
          <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/60 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{getModeEmoji(challenger.mode)}</span>
              <div>
                <p className="eyebrow text-[0.58rem]">挑战者 · {getModeDisplayName(challenger.mode)}</p>
                <p className="text-sm text-text-muted">{challenger.testedAt}</p>
              </div>
            </div>
            <p className="text-base leading-7 text-text-secondary">{challenger.summary}</p>
          </div>

          {/* My result (if exists) */}
          {myLatest && (
            <div className="rounded-[22px] border border-[var(--color-gold-leaf)]/30 bg-bg-elevated/60 p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{getModeEmoji(myLatest.mode)}</span>
                <div>
                  <p className="eyebrow text-[0.58rem]">你的结果 · {getModeDisplayName(myLatest.mode)}</p>
                  <p className="text-sm text-text-muted">{myLatest.testedAt}</p>
                </div>
              </div>
              <p className="text-base leading-7 text-text-secondary">{myLatest.summary}</p>
            </div>
          )}

          {/* VS divider */}
          {myLatest && (
            <div className="flex items-center gap-4 my-8">
              <span className="h-px flex-1" style={{ background: 'var(--color-gold-leaf)', opacity: 0.3 }} />
              <span className="font-display text-2xl" style={{ color: 'var(--color-gold-leaf)' }}>VS</span>
              <span className="h-px flex-1" style={{ background: 'var(--color-gold-leaf)', opacity: 0.3 }} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            {!myLatest ? (
              <Link href={`/mirror/?mode=${challenger.mode}`} className="btn btn-rose">
                接受挑战，去做测试
                <span className="opacity-70">→</span>
              </Link>
            ) : (
              <Link href="/mirror/" className="btn btn-rose">
                再测一次
                <span className="opacity-70">→</span>
              </Link>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-gold"
            >
              {copied ? '✓ 已复制' : '复制挑战链接'}
            </button>
            <Link href="/mirror/leaderboard/" className="btn btn-ghost">
              查看排行榜
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function MirrorChallengeClient() {
  return (
    <Suspense fallback={
      <div className="wtfti-site-shell">
        <section className="wtfti-section pt-16 sm:pt-24">
          <div className="wtfti-container max-w-2xl mx-auto text-center">
            <p className="text-text-muted">加载中…</p>
          </div>
        </section>
      </div>
    }>
      <ChallengeContent />
    </Suspense>
  );
}
