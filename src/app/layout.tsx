import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import Script from "next/script";
import { Noto_Serif_SC, Noto_Sans_SC, Cormorant_Garamond, Fraunces, JetBrains_Mono, ZCOOL_XiaoWei, Long_Cang } from "next/font/google";
import "./globals.css";
import "./skins.css";
import { HerNav } from "@/components/HerNav";
import { AuthProvider } from "@/components/AuthProvider";
import { FollowMeInline } from '@/components/FollowMeLinks';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';
import {
  WtftiThemeProvider,
} from '@/components/wtfti/WtftiThemeProvider';
import { WtftiThemeNoFlashScript } from '@/components/wtfti/WtftiThemeScript';
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

// Design system v3 (journal skin): headline + handwritten accent faces.
const xiaowei = ZCOOL_XiaoWei({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-xiaowei",
  preload: false,
});

const longcang = Long_Cang({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-longcang",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: getSiteOrigin() ? new URL(getSiteOrigin()) : undefined,
  title: {
    default: "WTFTI — 懂你的女生私人顾问",
    template: "%s | WTFTI",
  },
  description: "看清自己、变好看、有地方说心里话。90 秒人格测试，每天一张为你写的今日卡，还有一个敢说话的树洞。",
  keywords: ["WTFTI", "女性人格测试", "人格测试", "性格测试", "MBTI", "今日运势", "塔罗", "掌纹", "色彩季型", "穿搭建议", "妆容建议", "树洞", "自我探索"],
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
    title: "WTFTI — 懂你的女生私人顾问",
    description: "看清自己、变好看、有地方说心里话。",
    type: "website",
    siteName: "WTFTI",
    locale: "zh_CN",
    url: getSiteUrl('/'),
  },
  twitter: {
    card: "summary_large_image",
    title: "WTFTI — 懂你的女生私人顾问",
    description: "看清自己、变好看、有地方说心里话。",
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
      className={`${notoSerifSC.variable} ${notoSansSC.variable} ${cormorant.variable} ${fraunces.variable} ${jetbrains.variable} ${xiaowei.variable} ${longcang.variable} h-full antialiased`}
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
                  description: '懂你的女生私人顾问：人格测试、今日运势、穿搭妆容建议与树洞。',
                  inLanguage: 'zh-CN',
                },
                {
                  '@type': 'Organization',
                  name: 'WTFTI',
                  url: getSiteUrl('/'),
                  logo: getSiteUrl('/favicon.svg'),
                  description: '懂你的女生私人顾问：人格测试、今日运势、穿搭妆容建议与树洞。',
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
            <HerNav />
            <main className="flex-1">{children}</main>
          <footer className="border-t border-border-subtle py-8 px-6 text-center text-text-muted text-sm">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4 text-sm">
                <Link href="/about/" prefetch={false} className="hover:text-text-primary transition-colors">关于</Link>
                <Link href="/contact/" prefetch={false} className="hover:text-text-primary transition-colors">联系我们</Link>
                <Link href="/privacy/" prefetch={false} className="hover:text-text-primary transition-colors">隐私说明</Link>
                <Link href="/terms/" prefetch={false} className="hover:text-text-primary transition-colors">使用条款</Link>
              </div>
              <FollowMeInline />
              <p>测试与玄学内容仅供娱乐与自我探索，不能替代专业的心理或医疗建议。</p>
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
