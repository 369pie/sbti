'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getLiveUniverses } from '@/lib/universes';

// ─── Static data ─────────────────────────────────────────────────────────────

const UNIVERSE_ITEMS = getLiveUniverses().map(u => ({
  href: u.testPath,
  label: u.name,
  emoji: u.emoji,
  accent: u.accent,
  desc: getUniverseDesc(u.id),
}));

function getUniverseDesc(id: string): string {
  const map: Record<string, string> = {
    standard: '15 维 27 种人格基线测试',
    xiuxian: '修仙体质 × 人格维度',
    wtfti: '直接骂醒你的毒舌版',
    banti: '社畜宇宙 · 职场人格',
    kings: '王者峡谷 × 人格联名',
    bird: '测测你是哪种禽',
    flower: '测测你像哪朵花',
    delta: '三角洲行动 × 人格联名',
    jueti: '镜像觉察 · 深度人格',
    xpti: '恋爱 XP 人格鉴定',
  };
  return map[id] ?? '';
}

const FUN_ITEMS = [
  { href: '/cp/', label: 'CP 配对', emoji: '💕', desc: '看看谁和你最配' },
  { href: '/work/', label: '打工人设', emoji: '💼', desc: '你的职场角色' },
  { href: '/love/', label: '恋爱人设', emoji: '💗', desc: '你的恋爱角色' },
  { href: '/daily/', label: '今日模式', emoji: '🎲', desc: '每天换一种人格' },
  { href: '/drunk/', label: '酒后人设', emoji: '🍺', desc: '喝多了你变什么样' },
  { href: '/identify/', label: '好友鉴定', emoji: '🔍', desc: '帮朋友鉴定人格' },
  { href: '/squad/', label: '组局测试', emoji: '🎯', desc: '朋友一起来测' },
  { href: '/combo/', label: '人格拼盘', emoji: '🧩', desc: '拼出你的多面人格' },
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

  return { open, setOpen, ref, onMouseEnter, onMouseLeave, close };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Navigation() {
  const universeDD = useDropdown();
  const funDD = useDropdown();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
    <header className="sticky top-0 z-50 bg-bg-elevated/90 backdrop-blur-md border-b border-border-subtle">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4" aria-label="主导航">

        {/* Logo */}
        <Link
          href="/"
          prefetch={false}
          className="text-sm font-bold tracking-wider shrink-0 transition-colors hover:opacity-80"
        >
          <span style={{ color: '#ff4d6d' }}>WTF</span>
          <span className="text-text-primary">TI</span>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-1">

          {/* 测试宇宙 dropdown */}
          <div
            ref={universeDD.ref}
            className="relative"
            onMouseEnter={universeDD.onMouseEnter}
            onMouseLeave={universeDD.onMouseLeave}
          >
            <button
              onClick={() => universeDD.setOpen(v => !v)}
              className="nav-link inline-flex items-center gap-1"
              aria-expanded={universeDD.open}
              aria-haspopup="true"
            >
              测试宇宙
              <ChevronDown className={universeDD.open ? 'rotate-180' : ''} />
            </button>
            {universeDD.open && (
              <div className="nav-dropdown w-72 left-0">
                {UNIVERSE_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={universeDD.close}
                    className="nav-dropdown-item"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ background: item.accent }}
                    />
                    <span>
                      <span className="font-medium text-text-primary">
                        {item.emoji && <>{item.emoji} </>}{item.label}
                      </span>
                      {item.desc && (
                        <span className="block text-xs text-text-muted mt-0.5">{item.desc}</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 趣味玩法 dropdown */}
          <div
            ref={funDD.ref}
            className="relative"
            onMouseEnter={funDD.onMouseEnter}
            onMouseLeave={funDD.onMouseLeave}
          >
            <button
              onClick={() => funDD.setOpen(v => !v)}
              className="nav-link inline-flex items-center gap-1"
              aria-expanded={funDD.open}
              aria-haspopup="true"
            >
              趣味玩法
              <ChevronDown className={funDD.open ? 'rotate-180' : ''} />
            </button>
            {funDD.open && (
              <div className="nav-dropdown w-64 left-0">
                {FUN_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={funDD.close}
                    className="nav-dropdown-item"
                  >
                    <span className="text-base leading-none shrink-0">{item.emoji}</span>
                    <span>
                      <span className="font-medium text-text-primary">{item.label}</span>
                      <span className="block text-xs text-text-muted mt-0.5">{item.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 图鉴 */}
          <Link href="/types/" prefetch={false} className="nav-link">
            图鉴
          </Link>
        </div>

        {/* Desktop CTA */}
        <Link
          href="/test/"
          className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors shrink-0"
        >
          开始测试
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* ── Mobile hamburger ── */}
        <button
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
      <div className="md:hidden fixed inset-0 top-14 z-50 bg-bg-elevated overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-8 space-y-8">

            {/* Mobile CTA */}
            <Link
              href="/test/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-accent text-white font-medium text-base"
            >
              开始测试
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* 测试宇宙 */}
            <MobileSection title="测试宇宙" subtitle="选择一个主题宇宙开始测试">
              <div className="grid grid-cols-2 gap-2">
                {UNIVERSE_ITEMS.map(item => (
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
                      {item.emoji && <>{item.emoji} </>}{item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </MobileSection>

            {/* 趣味玩法 */}
            <MobileSection title="趣味玩法" subtitle="基于人格结果的二次衍生">
              <div className="grid grid-cols-2 gap-2">
                {FUN_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl bg-bg-secondary hover:bg-bg-elevated transition-colors"
                  >
                    <span className="text-base leading-none">{item.emoji}</span>
                    <span className="text-sm font-medium text-text-primary truncate">{item.label}</span>
                  </Link>
                ))}
              </div>
            </MobileSection>

            {/* 更多 */}
            <MobileSection title="更多">
              <div className="space-y-1">
                {[
                  { href: '/types/', label: '人设图鉴' },
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
              </div>
            </MobileSection>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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
