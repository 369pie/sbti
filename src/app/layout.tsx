import type { Metadata } from "next";
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
  title: "SBTI 人格测试 — 测测你是哪种抽象人格",
  description: "SBTI (Silly Behavioral Type Indicator) 是一个轻松向的人格测试。5 组切面、15 个维度、27 种人格，找到最像你的那一个。",
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
    : undefined,
  openGraph: {
    title: "SBTI 人格测试",
    description: "测测你到底是哪种抽象人格？27 种结果等你来解锁。",
    type: "website",
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
          id="legacy-github-pages-redirect"
          dangerouslySetInnerHTML={{ __html: getLegacyRedirectScript() }}
        />
        {isLegacyPagesBuild && (
          <noscript>
            <div
              style={{
                padding: '12px 16px',
                background: '#f59e0b',
                color: '#0c0a09',
                textAlign: 'center',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              旧地址已迁移，请访问{' '}
              <a href={getSiteUrl('/')} style={{ color: '#0c0a09', fontWeight: 700, textDecoration: 'underline' }}>
                {getSiteLabel()}
              </a>{' '}
              查看最新内容。
            </div>
          </noscript>
        )}
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border-subtle py-8 px-6 text-center text-text-muted text-sm">
          <p>SBTI 更适合拿来娱乐和自我观察，不适合作为严肃的心理诊断结果。</p>
          <p className="mt-2 opacity-60">Silly Behavioral Type Indicator</p>
        </footer>
      </body>
    </html>
  );
}
