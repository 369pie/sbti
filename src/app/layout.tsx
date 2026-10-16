import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import Script from "next/script";
import { Noto_Serif_SC, Noto_Sans_SC, Cormorant_Garamond, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/components/AuthProvider";
import { FollowMeInline } from '@/components/FollowMeLinks';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';
import {
  WtftiThemeProvider,
} from '@/components/wtfti/WtftiThemeProvider';
import { WtftiThemeNoFlashScript } from '@/components/wtfti/WtftiThemeScript';
import { WtftiThemeToggle } from '@/components/wtfti/WtftiThemeToggle';
import { getLegacyRedirectScript, getSiteLabel, getSiteOrigin, getSiteUrl, isLegacyPagesBuild } from "@/lib/site";

// ─── Typography system v3: Editorial Feminine ──────────────────────────────
// Weights trimmed 2026-04-18 perf pass: CJK families (Noto Serif/Sans SC) are
// the heaviest assets on this site, so we keep only the weights actually
// referenced by globals.css + components.
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-serif-sc",
  preload: false,
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans-sc",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-cormorant",
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  display: "swap",
  variable: "--font-fraunces",
  preload: false,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-mono-ui",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: getSiteOrigin() ? new URL(getSiteOrigin()) : undefined,
  title: {
    default: "WTFTI — 女生的情绪陪伴站 · 情侣关系沟通报告",
    template: "%s | WTFTI",
  },
  description: "先听懂今天的自己，再看清一段关系。每日一牌安顿情绪，XPTI 情侣关系报告帮你读懂 ta 的沟通方式，也被 ta 读懂。",
  keywords: ["WTFTI", "情侣关系测试", "关系沟通", "XPTI", "情侣报告", "每日一牌", "塔罗", "情绪陪伴", "人格测试", "性格测试", "MBTI", "恋爱测试"],
  verification: {
    google: 'BzRtTDBXJV_X_JIZsMs0jPNwGrHIj7flfmUMjuJ1IwY',
  },
  robots: isLegacyPagesBuild
    ? {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
  openGraph: {
    title: "WTFTI — 女生的情绪陪伴站 · 情侣关系沟通报告",
    description: "先听懂今天的自己，再看清一段关系。每日一牌安顿情绪，XPTI 情侣关系报告帮你读懂 ta 的沟通方式，也被 ta 读懂。",
    type: "website",
    siteName: "WTFTI",
    locale: "zh_CN",
    url: getSiteUrl('/'),
  },
  twitter: {
    card: "summary_large_image",
    title: "WTFTI — 女生的情绪陪伴站 · 情侣关系沟通报告",
    description: "先听懂今天的自己，再看清一段关系。每日一牌安顿情绪，XPTI 情侣关系报告帮你读懂 ta 的沟通方式，也被 ta 读懂。",
  },
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    apple: { url: '/favicon.svg', type: 'image/svg+xml' },
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className={`${notoSerifSC.variable} ${notoSansSC.variable} ${cormorant.variable} ${fraunces.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col paper-texture"
        data-theme="wtfti-light"
        data-wtfti-theme="light"
        suppressHydrationWarning
      >
        <WtftiThemeNoFlashScript />
        <Script
          id="root-schema-json"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'WTFTI',
                  url: getSiteUrl('/'),
                  description: 'WTFTI 是写给女生的情绪陪伴站：每日一牌安顿情绪，情侣关系报告帮你看懂你和 ta 怎么沟通、怎么靠近。',
                  inLanguage: 'zh-CN',
                },
                {
                  '@type': 'Organization',
                  name: 'WTFTI',
                  url: getSiteUrl('/'),
                  logo: getSiteUrl('/favicon.svg'),
                  description: 'WTFTI 女生情绪陪伴与情侣关系沟通测试：每日一牌、XPTI 情侣关系报告、三分钟经典人格测试。',
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <Script
          id="legacy-github-pages-redirect"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getLegacyRedirectScript() }}
        />
        {isLegacyPagesBuild && (
          <noscript>
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--color-accent)',
                color: 'var(--color-bg-primary)',
                textAlign: 'center',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              旧地址已迁移，请访问{' '}
              <a href={getSiteUrl('/')} style={{ color: 'var(--color-bg-primary)', fontWeight: 700, textDecoration: 'underline' }}>
                {getSiteLabel()}
              </a>{' '}
              查看最新内容。
            </div>
          </noscript>
        )}
        <AuthProvider>
          <WtftiThemeProvider>
            <WtftiThemeToggle />
            <Navigation />
            <main className="flex-1">{children}</main>
          <footer className="border-t border-border-subtle py-8 px-6 text-center text-text-muted text-sm">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4 text-sm">
                <Link href="/card/" prefetch={false} className="hover:text-text-primary transition-colors">我的 WTF Card</Link>
                <Link href="/types/" prefetch={false} className="hover:text-text-primary transition-colors">人设图鉴</Link>
                <Link href="/guide/" prefetch={false} className="hover:text-text-primary transition-colors">测试说明</Link>
                <Link href="/about/" prefetch={false} className="hover:text-text-primary transition-colors">关于测试</Link>
                <Link href="/contact/" prefetch={false} className="hover:text-text-primary transition-colors">联系与社群</Link>
                <Link href="/privacy/" prefetch={false} className="hover:text-text-primary transition-colors">隐私说明</Link>
                <Link href="/terms/" prefetch={false} className="hover:text-text-primary transition-colors">使用条款</Link>
              </div>
              <FollowMeInline />
              <p>WTFTI 更适合拿来娱乐和自我观察，不适合作为严肃的心理诊断结果。</p>
              <p className="mt-2 opacity-60">What&apos;s The F* Type Inside</p>
              <p className="mt-2 opacity-50">SBTI 主题原创作者：B站 @Q肉儿串儿、如有侵权请联系</p>
            </div>
          </footer>
          </WtftiThemeProvider>
        </AuthProvider>
        <Analytics />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
