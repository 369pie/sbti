'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from '@/lib/supabase/auth';
import { getLiveUniverses } from '@/lib/universes';
import { Logo } from '@/components/Logo';

// ─── Static data (intent-based 4-category architecture) ──────────────────────

/** Mirror Lab — AI style analysis, standalone category */
const MIRROR_ITEMS = [
  { href: '/mirror/', label: '灵镜实验室', mark: '🔮', desc: '上传照片 · AI 生成风格报告', tag: 'NEW' as const },
];

/** "测自己" — 6 大核心入口（W3 重构：纳入 Mysti / WTFCard） */
const HOT_PICKS = [
  { href: '/wtfti/', label: 'WTFTI 人格神域', mark: 'W', desc: '90 秒召唤你的主神', tag: '主入口' as const },
  { href: '/xpti/', label: 'XPTI 恋爱XP', mark: 'XP', desc: '你的亲密偏好是什么？', tag: '热门' as const },
  { href: '/cpti/', label: 'CPTI 关系深测', mark: 'CP', desc: '你们的关系是什么型？', tag: '深度' as const },
  { href: '/soulti/', label: 'SoulTI 灵魂镜像', mark: 'S', desc: '安静地看见真正的自己', tag: '深度' as const },
  { href: '/mysti/', label: 'Mysti 灵鉴', mark: 'M', desc: '塔罗 × 人格牌 · ¥19/月', tag: '通行证' as const },
  { href: '/card/', label: 'WTF Card 收藏', mark: 'C', desc: '多宇宙人格档案 · ¥9.9', tag: '收藏' as const },
];

type SelfStyleItem = {
  id: string;
  href: string;
  label: string;
  accent: string;
  isUgc?: boolean;
};

/** Style universes (excluding hot-picks and relationship modules) */
const STYLE_UNIVERSES: SelfStyleItem[] = getLiveUniverses()
  .filter(u => !['cpti', 'xpti', 'soulti', 'wtfti', 'mysti'].includes(u.id) && !u.isUgc)
  .map(u => ({ id: u.id, href: u.landingPath, label: u.name, accent: u.accent }));

/** UGC universes */
const UGC_UNIVERSES_NAV: SelfStyleItem[] = getLiveUniverses()
  .filter(u => u.isUgc)
  .map(u => ({ id: u.id, href: u.landingPath, label: u.name, accent: u.accent, isUgc: true as const }));

const SELF_STYLE_ITEMS: SelfStyleItem[] = [...STYLE_UNIVERSES, ...UGC_UNIVERSES_NAV];

/** Quick/casual tests */
const CASUAL_TESTS = [
  { href: '/daily/', label: '今日模式', mark: 'D', desc: '6题秒测今天状态' },
  { href: '/drunk/', label: '酒后人设', mark: 'DR', desc: '喝多了你是谁？' },
  { href: '/work/', label: '打工人设', mark: 'W', desc: '你的职场角色' },
  { href: '/love/', label: '恋爱人设', mark: 'L', desc: '你的恋爱角色' },
];

/** "测关系" — social / multiplayer modules */
const RELATIONSHIP_ITEMS = [
  { href: '/cpti/', label: 'CPTI 关系深测', mark: 'CP', desc: '你们的关系是什么型？', tag: '热推' as const },
  { href: '/cp/', label: 'CP 配对', mark: 'C', desc: '快速匹配默契度' },
  { href: '/identify/', label: '好友鉴定', mark: 'ID', desc: '偷偷测ta是什么人' },
  { href: '/puzzle/', label: '闺蜜拼图', mark: 'FR', desc: '4人组合人格画' },
  { href: '/squad/', label: '组局测试', mark: 'SQ', desc: '拉群一起测' },
  { href: '/rank/', label: '群组排行', mark: 'R', desc: '看看谁最…' },
];

/** "发现" — explore & collect（W3 精简：Mysti / WTFCard 已上移到核心入口） */
const DISCOVER_ITEMS = [
  { href: '/types/', label: '人设图鉴', mark: 'A', desc: '全部人格类型一览' },
  { href: '/combo/', label: '人格拼盘', mark: 'CO', desc: 'SBTI × MBTI × 星座' },
  { href: '/share-templates/', label: '小红书文案', mark: 'XS', desc: '现成分享模板' },
  { href: '/creator/', label: '创作者中心', mark: 'CR', desc: '做你自己的主题宇宙' },
];

// ─── Dropdown hook ───────────────────────────────────────────────────────────

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  const onMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };
  const onMouseLeave = () => {
    timerRef.current = setTimeout(close, 150);
  };

  return { open, setOpen, ref, onMouseEnter, onMouseLeave, close, toggle: () => setOpen(v => !v) };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Navigation() {
  const router = useRouter();
  const selfDD = useDropdown();
  const relDD = useDropdown();
  const discoverDD = useDropdown();
  const userDD = useDropdown();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, displayName, loading: authLoading, refresh } = useAuth();

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // Lazy-import the supabase client only when the user actually logs out.
      // Keeps @supabase/supabase-js (~70 KB gzip) out of the public-page bundle.
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserSupabaseClient();
      const { error } = await signOut(supabase);

      if (error && !error.toLowerCase().includes('auth session missing')) {
        window.alert(`退出失败：${error}`);
        return;
      }

      await refresh();
      userDD.close();
      setMobileOpen(false);
      router.refresh();
    } catch {
      window.alert('退出失败，请稍后重试');
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, refresh, router, userDD]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
    <header className="wtfti-global-nav sticky top-0 z-50 bg-bg-elevated/90 backdrop-blur-md border-b border-border-subtle">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4" aria-label="主导航">

        {/* Logo */}
        <Link
          href="/"
          prefetch={false}
          className="shrink-0 text-text-primary transition-opacity hover:opacity-80"
        >
          <Logo height={26} />
        </Link>

        {/* ── Desktop nav (intent-based 4 categories) ── */}
        <div className="wtfti-global-nav-pill hidden md:flex items-center gap-1 rounded-full border border-border-subtle/90 bg-bg-secondary/75 p-1 shadow-[0_10px_28px_color-mix(in_oklab,var(--color-text-primary)_8%,transparent)] backdrop-blur">

          {/* 测自己 dropdown */}
          <div
            ref={selfDD.ref}
            className="relative"
            onMouseEnter={selfDD.onMouseEnter}
            onMouseLeave={selfDD.onMouseLeave}
          >
            <button
              type="button"
              onClick={() => selfDD.setOpen(v => !v)}
              className={`nav-link inline-flex items-center gap-1.5 ${selfDD.open ? 'nav-link-active' : ''}`}
              aria-expanded={selfDD.open}
              aria-haspopup="true"
            >
              测自己
              <ChevronDown className={selfDD.open ? 'rotate-180' : ''} />
            </button>
            {selfDD.open && (
              <div
                className="nav-dropdown left-0 w-[42rem] max-w-[calc(100vw-3rem)] p-4"
                onMouseEnter={selfDD.onMouseEnter}
                onMouseLeave={selfDD.onMouseLeave}
              >
                <div className="grid grid-cols-[1fr_0.88fr_1.1fr] gap-4">
                  <section className="wtfti-panel rounded-[24px] p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-mono tracking-[0.22em] text-text-muted uppercase">核心宇宙</p>
                        <p className="mt-1 text-xs leading-5 text-text-muted">现阶段的四张主入口，从神域开始最容易上手。</p>
                      </div>
                      <span className="rounded-full border border-border-subtle bg-bg-elevated/80 px-2.5 py-1 text-[10px] font-semibold text-text-secondary shadow-sm">
                        START HERE
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {HOT_PICKS.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={false}
                          onClick={selfDD.close}
                          className="featured-nav-item group flex items-start gap-3 rounded-[22px] px-4 py-3.5"
                        >
                          <NavMark mark={item.mark} />
                          <span className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-primary">{item.label}</span>
                              <span className="rounded-full border border-border-subtle bg-bg-elevated/75 px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                                {item.tag}
                              </span>
                            </div>
                            <span className="mt-1 block text-xs text-text-muted">{item.desc}</span>
                          </span>
                          <ArrowMark className="mt-1 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-border-subtle bg-bg-elevated/90 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-mono tracking-[0.22em] text-text-muted uppercase">AI 灵镜</p>
                        <p className="mt-1 text-xs leading-5 text-text-muted">上传一张照片，AI 帮你找到最适合的发型、色彩与妆容方向。</p>
                      </div>
                      <span className="rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                        NEW
                      </span>
                    </div>
                    {MIRROR_ITEMS.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        onClick={selfDD.close}
                        className="featured-nav-item group flex items-start gap-3 rounded-[22px] px-4 py-3.5"
                      >
                        <NavMark mark="ML" />
                        <span className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary">{item.label}</span>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white bg-gradient-to-r from-pink-400 to-rose-400">
                              {item.tag}
                            </span>
                          </div>
                          <span className="mt-1 block text-xs text-text-muted">{item.desc}</span>
                        </span>
                        <ArrowMark className="mt-1 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </section>

                  <div className="space-y-4">
                    <section className="rounded-[24px] border border-border-subtle bg-bg-elevated/90 p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-mono tracking-[0.22em] text-text-muted uppercase">风格宇宙</p>
                          <p className="mt-1 text-xs leading-5 text-text-muted">同一个你，放进不同宇宙里，会长成完全不同的人设。</p>
                        </div>
                        <span className="rounded-full bg-bg-secondary px-2.5 py-1 text-[10px] font-medium text-text-secondary">
                          {SELF_STYLE_ITEMS.length} 个宇宙
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {SELF_STYLE_ITEMS.map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            onClick={selfDD.close}
                            className="flex min-w-0 items-start gap-3 rounded-[18px] border border-transparent bg-bg-primary/72 px-3.5 py-3 text-sm transition-[background-color,border-color,color] duration-200 hover:bg-bg-secondary hover:border-border-subtle"
                          >
                            <span
                              className="mt-1 h-2.5 w-2.5 rounded-full shrink-0 shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-bg-elevated)_72%,transparent)]"
                              style={{ background: item.accent }}
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-text-primary">
                                {item.label}
                              </span>
                              {item.isUgc && (
                                <span className="mt-0.5 block text-[10px] font-medium tracking-[0.14em] text-text-muted uppercase">
                                  Creator Universe
                                </span>
                              )}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[24px] border border-border-subtle bg-bg-elevated/90 p-4">
                      <div className="mb-3">
                        <p className="text-[10px] font-mono tracking-[0.22em] text-text-muted uppercase">轻松一测</p>
                        <p className="mt-1 text-xs leading-5 text-text-muted">不用进入大宇宙，几分钟也能测到一个有意思的小切面。</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {CASUAL_TESTS.map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            onClick={selfDD.close}
                            className="flex items-start gap-3 rounded-[18px] border border-transparent bg-bg-primary/72 px-3.5 py-3 text-sm transition-[background-color,border-color,color] duration-200 hover:bg-bg-secondary hover:border-border-subtle"
                          >
                            <NavMark mark={item.mark} compact />
                            <span className="min-w-0">
                              <span className="block font-medium text-text-primary">{item.label}</span>
                              <span className="mt-0.5 block text-xs text-text-muted">{item.desc}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 测关系 dropdown */}
          <div
            ref={relDD.ref}
            className="relative"
            onMouseEnter={relDD.onMouseEnter}
            onMouseLeave={relDD.onMouseLeave}
          >
            <button
              type="button"
              onClick={() => relDD.setOpen(v => !v)}
              className={`nav-link inline-flex items-center gap-1.5 ${relDD.open ? 'nav-link-active' : ''}`}
              aria-expanded={relDD.open}
              aria-haspopup="true"
            >
              测关系
              <ChevronDown className={relDD.open ? 'rotate-180' : ''} />
            </button>
            {relDD.open && (
              <div
                className="nav-dropdown w-64 left-0"
                onMouseEnter={relDD.onMouseEnter}
                onMouseLeave={relDD.onMouseLeave}
              >
                {RELATIONSHIP_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={relDD.close}
                    className="nav-dropdown-item"
                  >
                    <NavMark mark={item.mark} compact />
                    <span className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{item.label}</span>
                        {'tag' in item && item.tag && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white bg-gradient-to-r from-pink-500 to-fuchsia-500">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <span className="block text-xs text-text-muted mt-0.5">{item.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 发现 dropdown */}
          <div
            ref={discoverDD.ref}
            className="relative"
            onMouseEnter={discoverDD.onMouseEnter}
            onMouseLeave={discoverDD.onMouseLeave}
          >
            <button
              type="button"
              onClick={() => discoverDD.setOpen(v => !v)}
              className={`nav-link inline-flex items-center gap-1.5 ${discoverDD.open ? 'nav-link-active' : ''}`}
              aria-expanded={discoverDD.open}
              aria-haspopup="true"
            >
              发现
              <ChevronDown className={discoverDD.open ? 'rotate-180' : ''} />
            </button>
            {discoverDD.open && (
              <div
                className="nav-dropdown w-64 left-0"
                onMouseEnter={discoverDD.onMouseEnter}
                onMouseLeave={discoverDD.onMouseLeave}
              >
                {DISCOVER_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={discoverDD.close}
                    className="nav-dropdown-item"
                  >
                    <NavMark mark={item.mark} compact />
                    <span>
                      <span className="font-medium text-text-primary">{item.label}</span>
                      <span className="block text-xs text-text-muted mt-0.5">{item.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 她说 standalone link */}
          <Link
            href="/her-voice/"
            prefetch={false}
            className="nav-link inline-flex items-center gap-1"
          >
            <NavMark mark="HV" compact />
            她说
          </Link>

          {/* 我的 / 用户 */}
          {isAuthenticated ? (
            <div className="relative" ref={userDD.ref}>
              <button
                type="button"
                onClick={userDD.toggle}
                className="user-avatar"
                aria-label="用户菜单"
                aria-expanded={userDD.open}
              >
                {(displayName || '?')[0].toUpperCase()}
              </button>
              {userDD.open && (
                <div className="nav-dropdown right-0 w-44">
                  <div className="px-4 py-2 border-b border-border-subtle">
                    <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
                  </div>
                  <Link href="/me/" prefetch={false} onClick={userDD.close} className="nav-dropdown-item">
                    <NavMark mark="ME" compact /><span>个人中心</span>
                  </Link>
                  <Link href="/card/" prefetch={false} onClick={userDD.close} className="nav-dropdown-item">
                    <NavMark mark="CD" compact /><span>我的 WTF Card</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="nav-dropdown-item w-full text-left text-red-500 hover:text-red-600"
                  >
                    <NavMark mark="OUT" compact /><span>{isLoggingOut ? '退出中…' : '退出登录'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/card/" prefetch={false} className="nav-link">
              我的
            </Link>
          )}
        </div>

        {/* Desktop CTA / Login */}
        {!authLoading && !isAuthenticated ? (
          <Link
            href="/auth/login/"
            className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-bg-primary text-sm font-medium hover:bg-accent/90 transition-colors shrink-0"
          >
            登录
          </Link>
        ) : (
          <Link
            href="/wtfti/galaxy/test/"
            className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-bg-primary text-sm font-medium hover:bg-accent/90 transition-colors shrink-0"
          >
            召唤主神
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}

        {/* ── Mobile hamburger ── */}
        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </nav>
    </header>

    {/* ── Mobile full-screen menu ── */}
    {mobileOpen && (
      <div className="wtfti-mobile-menu md:hidden fixed inset-0 top-14 z-50 bg-bg-elevated overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-8 space-y-8">

            {/* Mobile CTA / Auth */}
            {!authLoading && !isAuthenticated ? (
              <div className="space-y-3">
                <Link
                  href="/auth/login/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-accent text-bg-primary font-medium text-base"
                >
                  登录 / 注册
                </Link>
                <Link
                  href="/wtfti/galaxy/test/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-border text-text-secondary font-medium text-sm"
                >
                  不登录，直接召唤主神
                  <ArrowMark />
                </Link>
              </div>
            ) : (
              <>
                {isAuthenticated && (
                  <div className="flex items-center gap-3 px-1 pb-2 border-b border-border-subtle mb-2">
                    <div className="user-avatar">{(displayName || '?')[0].toUpperCase()}</div>
                    <span className="text-sm font-medium text-text-primary truncate">{displayName}</span>
                  </div>
                )}
                <Link
                  href="/wtfti/galaxy/test/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-accent text-bg-primary font-medium text-base"
                >
                  召唤主神
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}

            {/* 测自己 — 热门推荐 */}
            <MobileSection title="测自己" subtitle="了解真实的自己">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {HOT_PICKS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="wtfti-card flex items-center gap-3 rounded-2xl px-3 py-3 text-text-primary"
                  >
                    <NavMark mark={item.mark} compact />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
              {/* AI 灵镜 */}
              <p className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">AI 灵镜</p>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {MIRROR_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-pink-200/50 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
                  >
                    <span className="text-lg">🔮</span>
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary">{item.label}</span>
                      <span className="block text-xs text-text-muted mt-0.5">{item.desc}</span>
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white bg-gradient-to-r from-pink-400 to-rose-400">
                      NEW
                    </span>
                  </Link>
                ))}
              </div>
              {/* Style universes */}
              <p className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">风格宇宙</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[...STYLE_UNIVERSES, ...UGC_UNIVERSES_NAV].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-bg-secondary hover:bg-bg-elevated transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: item.accent }}
                    />
                    <span className="text-sm font-medium text-text-primary truncate">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
              {/* Casual tests */}
              <p className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">轻松一测</p>
              <div className="grid grid-cols-2 gap-2">
                {CASUAL_TESTS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-bg-secondary hover:bg-bg-elevated transition-colors"
                  >
                    <NavMark mark={item.mark} compact />
                    <span className="text-sm font-medium text-text-primary truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </MobileSection>

            {/* 测关系 */}
            <MobileSection title="测关系" subtitle="和别人一起才好玩">
              <div className="grid grid-cols-2 gap-2">
                {RELATIONSHIP_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-bg-secondary hover:bg-bg-elevated transition-colors"
                  >
                    <NavMark mark={item.mark} compact />
                    <span className="text-sm font-medium text-text-primary truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </MobileSection>

            {/* 她说 */}
            <Link
              href="/her-voice/"
              prefetch={false}
              onClick={() => setMobileOpen(false)}
              className="wtfti-panel flex items-center gap-3 rounded-2xl px-4 py-3.5"
            >
              <NavMark mark="HV" compact />
              <span className="flex-1">
                <span className="font-medium text-sm text-text-primary">她说 · Her Voice</span>
                <span className="mt-0.5 block text-xs text-text-muted">女性声音广场 · 你的态度被听见</span>
              </span>
              <ArrowMark className="text-text-muted" />
            </Link>

            {/* 发现 */}
            <MobileSection title="发现" subtitle="探索更多人格玩法">
              <div className="grid grid-cols-2 gap-2">
                {DISCOVER_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-bg-secondary hover:bg-bg-elevated transition-colors"
                  >
                    <NavMark mark={item.mark} compact />
                    <span className="text-sm font-medium text-text-primary truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </MobileSection>

            {/* 更多 */}
            <MobileSection title="更多">
              <div className="space-y-1">
                {[
                  { href: '/me/', label: '个人中心' },
                  { href: '/card/', label: '我的 WTF Card' },
                  { href: '/guide/', label: '测试说明' },
                  { href: '/about/', label: '关于 WTFTI' },
                  { href: '/contact/', label: '联系我们' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    disabled={isLoggingOut}
                    className="block w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {isLoggingOut ? '退出中…' : '退出登录'}
                  </button>
                )}
              </div>
            </MobileSection>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavMark({ mark, compact = false }: { mark: string; compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-full border border-border-subtle bg-bg-elevated/75 text-center font-mono font-semibold uppercase tracking-[0.08em] text-text-muted ${
        compact
          ? 'grid h-7 w-7 place-items-center text-[9px]'
          : 'grid h-11 w-11 place-items-center text-[11px]'
      }`}
    >
      {mark}
    </span>
  );
}

function ArrowMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function MobileSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-text-muted mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}

function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
