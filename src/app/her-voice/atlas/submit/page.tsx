import type { Metadata } from 'next';
import Link from 'next/link';
import { PillarBreadcrumb } from '@/components/PillarBreadcrumb';
import { withBasePath } from '@/lib/site';
import {
  ACCENT,
  HerVoiceMobileStyles,
  accentRuleStyle,
  datelineRuleStyle,
  datelineStyle,
  eyebrowStyle,
  ledeStyle,
  pageStyle,
  primaryLinkStyle,
  secondaryLinkStyle,
  shellStyle,
  titleStyle,
} from '../../_editorial-styles';
import { AtlasSubmitClient } from './AtlasSubmitClient';

export const metadata: Metadata = {
  title: '递交一条极光星图 · HER AURORA',
  description: '把一件还没有名字、但你想留下来的事，先递进编辑部的 atlas 投稿池。',
  alternates: { canonical: '/her-voice/atlas/submit/' },
  robots: { index: false, follow: false },
};

export default function AtlasSubmitPage() {
  return (
    <>
      <PillarBreadcrumb pillar="III" label="HER AURORA · 极光星图投稿池" hint="Atlas 提交预热入口" />
      <main className="hv-page" style={pageStyle}>
        <HerVoiceMobileStyles />
        <div style={{ ...shellStyle, maxWidth: 960 }}>
          <div style={datelineStyle}>
            <span>HER AURORA · ATLAS · SUBMIT · PRE-Q3</span>
            <span className="hv-dateline-r">编辑部 review 池 · 不即时公开</span>
          </div>
          <div style={datelineRuleStyle} />

          <header>
            <div style={eyebrowStyle}>§ HER AURORA · 递交一条极光星图</div>
            <h1 style={titleStyle}>
              先替那件事<br />
              <span style={{ color: ACCENT }}>起一个名字。</span>
            </h1>
            <div style={accentRuleStyle} />
            <p style={ledeStyle}>
              词条不是百科腔，也不是投稿比赛。它更像一张给编辑部的长纸条：
              你先把某种共同经验命名，等它慢慢长成一条会被她保存下来的词条。
            </p>

            <div className="hv-actions" style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link href={withBasePath('/her-voice/atlas/')} style={secondaryLinkStyle}>
                返回她词条
              </Link>
              <Link href={withBasePath('/her-voice/')} style={primaryLinkStyle}>
                回到沙龙
              </Link>
            </div>
          </header>

          <AtlasSubmitClient />
        </div>
      </main>
    </>
  );
}