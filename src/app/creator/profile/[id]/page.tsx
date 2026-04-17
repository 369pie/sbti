import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/site';
import { ProfileShareButton } from './ProfileShareButton';

type PageProps = {
  params: Promise<{ id: string }>;
};

type CreatorUniverseCard = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string | null;
  primary_color: string;
  total_tests: number;
  total_shares: number;
  published_at: string | null;
};

type RecommendedUniverseCard = CreatorUniverseCard & {
  creator: {
    id: string;
    name: string;
    is_verified: boolean;
  } | null;
};

function normalizeLinkedCreator(value: unknown): RecommendedUniverseCard['creator'] {
  if (!value || typeof value !== 'object') return null;

  if (Array.isArray(value)) {
    const first = value[0];
    if (!first || typeof first !== 'object') return null;
    return {
      id: String((first as { id?: string }).id ?? ''),
      name: String((first as { name?: string }).name ?? ''),
      is_verified: Boolean((first as { is_verified?: boolean }).is_verified),
    };
  }

  return {
    id: String((value as { id?: string }).id ?? ''),
    name: String((value as { name?: string }).name ?? ''),
    is_verified: Boolean((value as { is_verified?: boolean }).is_verified),
  };
}

function formatJoinLabel(createdAt: string) {
  const date = new Date(createdAt);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月入驻`;
}

function buildIdentityTags(options: {
  isVerified: boolean;
  universeCount: number;
  totalTests: number;
  shareRate: number;
}) {
  const tags: string[] = [];

  if (options.isVerified) tags.push('平台认证创作者');
  if (options.universeCount >= 3) tags.push('持续连载型作者');
  if (options.totalTests >= 500) tags.push('高热度宇宙玩家');
  if (options.shareRate >= 12) tags.push('高转发内容体质');

  return tags.length > 0 ? tags : ['新锐人格创作者'];
}

function getLatestUniverse(universes: CreatorUniverseCard[]) {
  return universes.reduce<CreatorUniverseCard | null>((latest, current) => {
    if (!latest) return current;
    const latestTime = latest.published_at ? new Date(latest.published_at).getTime() : 0;
    const currentTime = current.published_at ? new Date(current.published_at).getTime() : 0;
    return currentTime > latestTime ? current : latest;
  }, null);
}

async function loadCreatorProfile(id: string) {
  const supabase = await createServerSupabaseClient();

  const [creatorResult, universesResult, recommendedResult] = await Promise.all([
    supabase
      .from('creators')
      .select('id, name, avatar_url, social_link, bio, is_verified, created_at')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('creator_universes')
      .select('id, slug, name, emoji, description, primary_color, total_tests, total_shares, published_at')
      .eq('creator_id', id)
      .eq('status', 'published')
      .order('total_tests', { ascending: false }),
    supabase
      .from('creator_universes')
      .select('id, slug, name, emoji, description, primary_color, total_tests, total_shares, published_at, creators(id, name, is_verified)')
      .neq('creator_id', id)
      .eq('status', 'published')
      .order('total_tests', { ascending: false })
      .limit(4),
  ]);

  if (creatorResult.error || !creatorResult.data) return null;

  const creator = creatorResult.data;
  const universes = (universesResult.data ?? []) as CreatorUniverseCard[];
  const featuredUniverse = universes[0] ?? null;
  const latestUniverse = getLatestUniverse(universes);

  const totals = universes.reduce(
    (acc, universe) => {
      acc.totalTests += universe.total_tests as number;
      acc.totalShares += universe.total_shares as number;
      return acc;
    },
    { totalTests: 0, totalShares: 0 },
  );

  const shareRate = totals.totalTests > 0
    ? Number(((totals.totalShares / totals.totalTests) * 100).toFixed(1))
    : 0;

  const recommendations = ((recommendedResult.data ?? []) as Array<CreatorUniverseCard & { creators?: unknown }>)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      emoji: item.emoji,
      description: item.description,
      primary_color: item.primary_color,
      total_tests: item.total_tests,
      total_shares: item.total_shares,
      published_at: item.published_at,
      creator: normalizeLinkedCreator(item.creators),
    }))
    .filter((item) => item.creator?.id);

  return {
    creator,
    universes,
    featuredUniverse,
    latestUniverse,
    recommendations,
    shareRate,
    joinedLabel: formatJoinLabel(creator.created_at),
    identityTags: buildIdentityTags({
      isVerified: creator.is_verified,
      universeCount: universes.length,
      totalTests: totals.totalTests,
      shareRate,
    }),
    ...totals,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await loadCreatorProfile(id);

  if (!profile) {
    return { title: '创作者不存在' };
  }

  const title = `${profile.creator.name} · 创作者主页`;
  const description = profile.creator.bio ?? `${profile.creator.name} 在 WTFTI 发布的人格宇宙合集。`;

  return {
    title,
    description,
    alternates: { canonical: `/creator/profile/${id}/` },
    openGraph: {
      title,
      description,
      url: getSiteUrl(`/creator/profile/${id}/`),
    },
  };
}

export default async function CreatorPublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await loadCreatorProfile(id);

  if (!profile) notFound();

  const {
    creator,
    universes,
    totalTests,
    totalShares,
    shareRate,
    featuredUniverse,
    latestUniverse,
    recommendations,
    joinedLabel,
    identityTags,
  } = profile;
  const profileUrl = getSiteUrl(`/creator/profile/${id}/`);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="relative overflow-hidden rounded-[32px] border border-border-subtle bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-8 sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="w-20 h-20 rounded-3xl bg-bg-tertiary overflow-hidden flex items-center justify-center text-3xl shrink-0">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{creator.name.slice(0, 1)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full border border-border-subtle bg-bg-secondary text-[11px] uppercase tracking-[0.2em] text-text-secondary">
                  Creator Profile
                </span>
                <span className="text-sm text-text-muted">{joinedLabel}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{creator.name}</h1>
                {creator.is_verified && (
                  <span className="px-2 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs">已认证</span>
                )}
              </div>
              <p className="text-sm text-text-muted mt-2">TA 在 WTFTI 的人格宇宙展示页，可以从这里直接进入代表作和最新作品。</p>
              {creator.bio && (
                <p className="text-sm text-text-secondary leading-7 mt-4 max-w-2xl">{creator.bio}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {identityTags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-bg-secondary text-xs text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 mt-6 sm:grid-cols-3 text-sm">
                <div className="rounded-2xl bg-bg-tertiary ring-1 ring-border-subtle px-4 py-4 min-w-[110px]">
                  <div className="text-2xl font-semibold">{universes.length}</div>
                  <div className="text-text-muted text-xs mt-1">已发布宇宙</div>
                </div>
                <div className="rounded-2xl bg-bg-tertiary ring-1 ring-border-subtle px-4 py-4 min-w-[110px]">
                  <div className="text-2xl font-semibold">{totalTests}</div>
                  <div className="text-text-muted text-xs mt-1">总测试数</div>
                </div>
                <div className="rounded-2xl bg-bg-tertiary ring-1 ring-border-subtle px-4 py-4 min-w-[110px]">
                  <div className="text-2xl font-semibold">{shareRate}%</div>
                  <div className="text-text-muted text-xs mt-1">整体分享率</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {featuredUniverse && (
                  <Link
                    href={`/c/${featuredUniverse.slug}/test/`}
                    className="px-4 py-2.5 rounded-xl bg-text-primary text-bg-primary text-sm font-medium hover:bg-text-primary/85 transition-colors"
                  >
                    先测代表作
                  </Link>
                )}
                {creator.social_link && (
                  <a
                    href={creator.social_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary text-sm transition-colors"
                  >
                    关注作者 ↗
                  </a>
                )}
                <ProfileShareButton title={`${creator.name} · WTFTI 创作者主页`} url={profileUrl} />
              </div>
            </div>

            <div className="lg:w-[320px] shrink-0 space-y-4">
              {featuredUniverse && (
                <div className="rounded-3xl border border-border-subtle bg-bg-tertiary p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Start Here</div>
                  <div className="mt-3 flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${featuredUniverse.primary_color}24`, border: `1px solid ${featuredUniverse.primary_color}` }}
                    >
                      {featuredUniverse.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-medium truncate">{featuredUniverse.name}</div>
                      <div className="text-xs text-text-muted mt-1">当前代表作 · {featuredUniverse.total_tests} 次测试</div>
                    </div>
                  </div>
                  {featuredUniverse.description && (
                    <p className="text-sm text-text-secondary leading-7 mt-4 line-clamp-3">{featuredUniverse.description}</p>
                  )}
                </div>
              )}

              {latestUniverse && latestUniverse.id !== featuredUniverse?.id && (
                <div className="rounded-3xl border border-border-subtle bg-bg-secondary/60 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Latest Release</div>
                  <div className="mt-3 text-lg font-medium">{latestUniverse.emoji} {latestUniverse.name}</div>
                  <div className="text-xs text-text-muted mt-1">
                    {latestUniverse.published_at ? new Date(latestUniverse.published_at).toLocaleDateString('zh-CN') : '最近发布'}
                  </div>
                  {latestUniverse.description && (
                    <p className="text-sm text-text-secondary leading-7 mt-3 line-clamp-2">{latestUniverse.description}</p>
                  )}
                  <Link href={`/c/${latestUniverse.slug}/test/`} className="inline-flex mt-4 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    去看新作 →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {creator.social_link && (
          <section className="mt-6 rounded-[28px] border border-border-subtle bg-bg-secondary/60 px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Follow Creator</div>
                <h2 className="text-xl font-semibold mt-2">关注作者，持续接住后续宇宙更新</h2>
                <p className="text-sm text-text-secondary mt-2 leading-7">
                  如果你喜欢这个作者的题感、文案或视觉风格，后续更新通常会先在 TA 的外部主页和社媒账号出现。
                </p>
              </div>
              <a
                href={creator.social_link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-4 py-2.5 rounded-xl bg-text-primary text-bg-primary text-sm font-medium hover:bg-text-primary/85 transition-colors"
              >
                去关注作者 ↗
              </a>
            </div>
          </section>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">作品矩阵</h2>
            <p className="text-sm text-text-muted mt-1">按测试热度排序，先看最能代表 TA 风格的宇宙。</p>
          </div>
          <Link href="/creator/leaderboard/" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
            返回排行榜
          </Link>
        </div>

        {universes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border-subtle bg-bg-secondary px-5 py-8 text-text-muted text-sm">
            这位创作者暂时还没有公开宇宙。
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {universes.map((universe) => (
              <Link
                key={universe.id}
                href={`/c/${universe.slug}/test/`}
                className="rounded-[28px] border border-border-subtle bg-bg-secondary p-5 hover:bg-bg-tertiary transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${universe.primary_color}20`, border: `1px solid ${universe.primary_color}` }}
                  >
                    {universe.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">{universe.name}</div>
                    {universe.description && (
                      <div className="text-sm text-text-muted mt-1 line-clamp-2">{universe.description}</div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-text-muted mt-3">
                      <span>{universe.total_tests} 次测试</span>
                      <span>{universe.total_shares} 次分享</span>
                      <span>
                        {universe.total_tests > 0
                          ? `${((universe.total_shares / universe.total_tests) * 100).toFixed(1)}% 分享率`
                          : '0% 分享率'}
                      </span>
                      {universe.published_at && <span>{new Date(universe.published_at).toLocaleDateString('zh-CN')} 发布</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">继续逛这些宇宙</h2>
                <p className="text-sm text-text-muted mt-1">看完这个作者，也顺手逛逛当前站内表现最好的其他创作者作品。</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {recommendations.map((universe) => (
                <div key={universe.id} className="rounded-[28px] border border-border-subtle bg-bg-secondary/60 p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${universe.primary_color}20`, border: `1px solid ${universe.primary_color}` }}
                    >
                      {universe.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/c/${universe.slug}/test/`} className="font-medium text-text-primary hover:text-text-secondary transition-colors">
                        {universe.name}
                      </Link>
                      {universe.description && (
                        <div className="text-sm text-text-muted mt-1 line-clamp-2">{universe.description}</div>
                      )}
                      {universe.creator && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                          <Link href={`/creator/profile/${universe.creator.id}/`} className="hover:text-text-secondary transition-colors">
                            {universe.creator.name}
                          </Link>
                          {universe.creator.is_verified && <span className="text-blue-300">已认证</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border-subtle text-xs text-text-muted">
                    <div className="flex gap-3 flex-wrap">
                      <span>{universe.total_tests} 次测试</span>
                      <span>{universe.total_shares} 次分享</span>
                    </div>
                    <Link href={`/c/${universe.slug}/test/`} className="text-text-secondary hover:text-text-secondary transition-colors">
                      去测试 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}