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
    default: "WTFTI — 多宇宙人格测试平台",
    template: "%s | WTFTI",
  },
  description: "WTFTI (What's The F* Type Inside) 多宇宙人格测试平台。同一个你，在不同主题宇宙里有完全不同的人格翻译。经典版、修仙版、毒舌版、社畜版、鸟类版……来测测你到底是哪种人。",
  keywords: ["WTFTI", "WTFTI 人格测试", "多宇宙人格测试", "人格测试", "性格测试", "MBTI", "人格类型", "CP配对", "打工人格", "心理测试", "修仙人格", "鸟类人格"],
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
    title: "WTFTI — 多宇宙人格测试平台",
    description: "同一个你，在不同主题宇宙里有完全不同的人格翻译。经典、修仙、毒舌、社畜、鸟类……来测测你到底是哪种人。",
    type: "website",
    siteName: "WTFTI",
    locale: "zh_CN",
    url: getSiteUrl('/'),
  },
  twitter: {
    card: "summary_large_image",
    title: "WTFTI — 多宇宙人格测试平台",
    description: "同一个你，在不同主题宇宙里有完全不同的人格翻译。经典、修仙、毒舌、社畜、鸟类……来测测你到底是哪种人。",
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
    >
      <body className="min-h-full flex flex-col paper-texture">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'WTFTI',
                  url: getSiteUrl('/'),
                  description: 'WTFTI 多宇宙人格测试平台。同一个你，在不同主题宇宙里有完全不同的人格翻译。',
                  inLanguage: 'zh-CN',
                },
                {
                  '@type': 'Organization',
                  name: 'WTFTI',
                  url: getSiteUrl('/'),
                  logo: getSiteUrl('/favicon.svg'),
                  description: 'WTFTI 多宇宙人格测试平台，提供经典、修仙、毒舌、社畜等多种主题人格测试。',
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
                background: '#e06088',
                color: '#FFFFFF',
                textAlign: 'center',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              旧地址已迁移，请访问{' '}
              <a href={getSiteUrl('/')} style={{ color: '#FFFFFF', fontWeight: 700, textDecoration: 'underline' }}>
                {getSiteLabel()}
              </a>{' '}
              查看最新内容。
            </div>
          </noscript>
        )}
        <AuthProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border-subtle py-8 px-6 text-center text-text-muted text-sm">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4 text-sm">
                <Link href="/card/" prefetch={false} className="hover:text-text-primary transition-colors">我的 WTF Card</Link>
                <Link href="/types/" prefetch={false} className="hover:text-text-primary transition-colors">人设图鉴</Link>
                <Link href="/guide/" prefetch={false} className="hover:text-text-primary transition-colors">测试说明</Link>
                <Link href="/about/" prefetch={false} className="hover:text-text-primary transition-colors">关于测试</Link>
                <Link href="/creator/" prefetch={false} className="hover:text-text-primary transition-colors">创作者中心</Link>
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
        </AuthProvider>
        <Analytics />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
