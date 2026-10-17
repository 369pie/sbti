'use client';

/**
 * /mirror · 美我 hub（P2 slice · refocus §4 美我）
 * journal skin；入口：色彩季型 / 妆容脸型 / 静态换装 / 掌纹
 */

import Link from 'next/link';
import { useEffect } from 'react';

import { trackFunnelEvent } from '@/lib/analytics/funnel';

import styles from './mirror-hub.module.css';

const CARDS = [
  {
    href: '/mirror/color/',
    title: '色彩季型',
    badge: '写入档案',
    desc: '三道小问题（可加自拍），告诉你适合什么颜色——写进「她的档案」，今日幸运色会更准。',
    cta: '测我的季型 →',
    tone: 'accent' as const,
  },
  {
    href: '/mirror/atelier/?mode=beauty',
    title: '脸型 · 妆容',
    badge: '灵镜 Atelier',
    desc: '上传一张照片，AI 给妆发建议。深度报告按次扣灵币（付费点稍后接会员额度）。',
    cta: '去做妆容诊断 →',
    tone: 'muted' as const,
  },
  {
    href: '/mirror/atelier/?mode=compare',
    title: '静态换装',
    badge: '附属功能',
    desc: '单张试衣约十几秒。尝鲜用，不做实时视频——按次付费。',
    cta: '换一身试试 →',
    tone: 'muted' as const,
  },
  {
    href: '/mirror/palm/',
    title: '掌纹',
    badge: '仪式感',
    desc: '拍一张手掌，在照片上标出你的四条主线。照片只用于本次，处理完即丢弃。',
    cta: '去看掌纹 →',
    tone: 'accent' as const,
  },
] as const;

export function MirrorHubClient() {
  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/mirror' });
  }, []);

  return (
    <main className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className="s-eyebrow">美我 · MIRROR</p>
          <h1 className={`s-title ${styles.hi}`}>
            变好看，从<em>认识自己</em>开始
          </h1>
          <p className={styles.lead}>
            色彩、妆容、换装、掌纹——每一项都会写进你的档案，让「今日」更像为你写的。
          </p>
        </header>

        <div className={styles.grid}>
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              prefetch={false}
              className={`s-card ${c.href.includes('color') ? 's-card--lined' : ''} ${styles.card}`}
            >
              {c.href.includes('color') ? <span className="s-tape s-tape--peach" aria-hidden /> : null}
              <div className={styles.cardTop}>
                <h2 className={`s-title ${styles.cardTitle}`}>{c.title}</h2>
                <span className={`${styles.badge} ${c.tone === 'muted' ? styles.badgeMuted : ''}`}>
                  {c.badge}
                </span>
              </div>
              <p className={styles.desc}>{c.desc}</p>
              <span className={styles.cta}>{c.cta}</span>
            </Link>
          ))}
        </div>

        <p className={styles.note}>
          人脸 / 掌纹 / 全身照只用于本次生成，处理完即删除，不入库、不公开展示。未满 18
          岁不做泳装内衣类换装。
        </p>
      </div>
    </main>
  );
}
