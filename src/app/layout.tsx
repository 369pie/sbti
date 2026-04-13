import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Geist, Geist_Mono, Playfair_Display, Space_Grotesk } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${spaceGrotesk.variable} h-full antialiased`}
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
                  name: 'WTFTI',
                  url: getSiteUrl('/'),
                  description: 'WTFTI 多宇宙人格测试平台。同一个你，在不同主题宇宙里有完全不同的人格翻译。',
                  inLanguage: 'zh-CN',
                },
                {
                  '@type': 'Organization',
                  name: 'WTFTI',
                  url: getSiteUrl('/'),
                  logo: getSiteUrl('/favicon.ico'),
                  description: 'WTFTI 多宇宙人格测试平台，提供经典、修仙、毒舌、社畜等多种主题人格测试。',
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
              <Link href="/guide/" prefetch={false} className="hover:text-text-primary transition-colors">测试说明</Link>
              <Link href="/about/" prefetch={false} className="hover:text-text-primary transition-colors">关于测试</Link>
              <Link href="/types/" prefetch={false} className="hover:text-text-primary transition-colors">人设图鉴</Link>
              <Link href="/contact/" prefetch={false} className="hover:text-text-primary transition-colors">联系与社群</Link>
              <Link href="/privacy/" prefetch={false} className="hover:text-text-primary transition-colors">隐私说明</Link>
              <Link href="/terms/" prefetch={false} className="hover:text-text-primary transition-colors">使用条款</Link>
            </div>
            <p>WTFTI 更适合拿来娱乐和自我观察，不适合作为严肃的心理诊断结果。</p>
            <p className="mt-2 opacity-60">What&apos;s The F* Type Inside</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
