import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { getLegacyRedirectScript, getSiteLabel, getSiteOrigin, getSiteUrl, isLegacyPagesBuild } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteOrigin() ? new URL(getSiteOrigin()) : undefined,
  title: {
    default: "SBTI 人格测试 — 测测你是哪种抽象人格",
    template: "%s | SBTI",
  },
  description: "SBTI (Silly Behavioral Type Indicator) 是一个轻松向的人格测试。5 组切面、15 个维度、27 种人格，找到最像你的那一个。",
  keywords: ["SBTI", "SBTI 人格测试", "SBTI 在线测试", "SBTI 人格测试在线测试", "人格测试", "性格测试", "抽象人格", "MBTI", "打工人格", "CP配对", "心理测试"],
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
    title: "SBTI 人格测试 — 测测你是哪种抽象人格",
    description: "5 组切面 · 15 个维度 · 27 种人格，不套术语，只看你平时怎么想、怎么爱、怎么活。",
    type: "website",
    siteName: "SBTI 人格测试",
    locale: "zh_CN",
    url: getSiteUrl('/'),
  },
  twitter: {
    card: "summary_large_image",
    title: "SBTI 人格测试 — 测测你是哪种抽象人格",
    description: "5 组切面 · 15 个维度 · 27 种人格，不套术语，只看你平时怎么想、怎么爱、怎么活。",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'SBTI 人格测试',
                  url: getSiteUrl('/'),
                  description: 'SBTI (Silly Behavioral Type Indicator) 是一个轻松向的人格测试。5 组切面、15 个维度、27 种人格，找到最像你的那一个。',
                  inLanguage: 'zh-CN',
                },
                {
                  '@type': 'Organization',
                  name: 'SBTI 人格测试',
                  url: getSiteUrl('/'),
                  logo: getSiteUrl('/favicon.ico'),
                  description: '一个轻松向的人格测试站点，提供 SBTI、打工人设和今日模式等测试内容。',
                },
              ],
            }),
          }}
        />
        <script
          id="legacy-github-pages-redirect"
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
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border-subtle py-8 px-6 text-center text-text-muted text-sm">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4 text-sm">
              <Link href="/guide" className="hover:text-text-primary transition-colors">测试说明</Link>
              <Link href="/about" className="hover:text-text-primary transition-colors">关于测试</Link>
              <Link href="/types" className="hover:text-text-primary transition-colors">人设图鉴</Link>
              <Link href="/contact" className="hover:text-text-primary transition-colors">联系与社群</Link>
              <Link href="/privacy" className="hover:text-text-primary transition-colors">隐私说明</Link>
              <Link href="/terms" className="hover:text-text-primary transition-colors">使用条款</Link>
            </div>
            <p>SBTI 更适合拿来娱乐和自我观察，不适合作为严肃的心理诊断结果。</p>
            <p className="mt-2 opacity-60">Silly Behavioral Type Indicator</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
