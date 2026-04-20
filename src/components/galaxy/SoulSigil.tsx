'use client';

/**
 * SoulSigil · 灵魂印记 SVG 渲染 + 长按下载 + 锁屏壁纸导出
 *
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §6
 */

import { useCallback, useMemo, useState } from 'react';

import type { GalaxyResult } from '@/lib/wtfi/galaxy-types';
import {
  generateSoulSigilString,
  generateSoulSigilSvg,
} from '@/lib/wtfi/sigil';

interface Props {
  galaxy: GalaxyResult;
  /** 显示尺寸，默认 320 */
  size?: number;
}

export function SoulSigil({ galaxy, size = 320 }: Props) {
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const svgInline = useMemo(
    () => generateSoulSigilSvg(galaxy, { size, background: null }),
    [galaxy, size],
  );
  const sigilString = useMemo(() => generateSoulSigilString(galaxy), [galaxy]);

  const downloadSvg = useCallback(
    (wallpaper: boolean) => {
      const svgStr = generateSoulSigilSvg(galaxy, {
        size: wallpaper ? 1080 : 1024,
        wallpaper,
        background: wallpaper ? '#1a1530' : null,
      });
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wtfti-sigil-${galaxy.homePlanet.slug}${wallpaper ? '-wallpaper' : ''}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 1800);
    },
    [galaxy],
  );

  const downloadPng = useCallback(
    async (mode: 'square' | 'wallpaper') => {
      const isWall = mode === 'wallpaper';
      const targetW = isWall ? 1080 : 1024;
      const targetH = isWall ? 1920 : 1024;
      const sigilBox = isWall ? 900 : 1000;
      const svgStr = generateSoulSigilSvg(galaxy, {
        size: sigilBox,
        wallpaper: false,
        background: null,
      });
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('svg load failed'));
          img.src = svgUrl;
        });
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // background
        const grad = ctx.createRadialGradient(
          targetW / 2,
          targetH * 0.42,
          80,
          targetW / 2,
          targetH * 0.42,
          Math.max(targetW, targetH) * 0.85,
        );
        grad.addColorStop(0, '#2a1f4f');
        grad.addColorStop(0.55, '#1a1530');
        grad.addColorStop(1, '#0a0820');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetW, targetH);

        // draw sigil centered upper
        const drawSize = Math.min(targetW * 0.86, sigilBox);
        const dx = (targetW - drawSize) / 2;
        const dy = isWall ? targetH * 0.18 : (targetH - drawSize) / 2;
        ctx.drawImage(img, dx, dy, drawSize, drawSize);

        // watermark
        ctx.fillStyle = 'rgba(245,240,232,0.65)';
        ctx.font = `${isWall ? 28 : 22}px "Cormorant Garamond", serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          `✦ ${sigilString} · WTFTI`,
          targetW / 2,
          isWall ? targetH * 0.78 : targetH - 60,
        );
        ctx.fillStyle = 'rgba(212,181,138,0.55)';
        ctx.font = `${isWall ? 16 : 14}px Inter, sans-serif`;
        ctx.fillText(
          'wtfti.app · your soul sigil',
          targetW / 2,
          isWall ? targetH * 0.82 : targetH - 36,
        );

        const pngBlob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png'),
        );
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `wtfti-sigil-${galaxy.homePlanet.slug}-${
          isWall ? '1080x1920-wallpaper' : '1024'
        }.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        setDownloaded(true);
        window.setTimeout(() => setDownloaded(false), 1800);
      } catch {
        // noop
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    },
    [galaxy, sigilString],
  );

  const copyString = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `我的灵魂印记 ${sigilString} · WTFTI 人格星图 · wtfti.com`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }, [sigilString]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <div
        role="img"
        aria-label={`你的灵魂印记 ${sigilString} — 唐一程序生成几何咒符`}
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle at 50% 50%, #20183a 0%, #1a1530 75%)',
          borderRadius: '50%',
          padding: 10,
          boxShadow:
            '0 0 80px 4px rgba(192, 122, 142, 0.18), inset 0 0 60px rgba(201, 166, 118, 0.08)',
        }}
        // SVG generated locally from typed inputs (axes vector + slug); all dynamic content is XML-escaped in sigil.ts.
        dangerouslySetInnerHTML={{ __html: svgInline }}
      />

      <p
        style={{
          fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
          fontSize: 32,
          letterSpacing: 8,
          color: '#C9A676',
          margin: 0,
          fontStyle: 'italic',
        }}
      >
        {sigilString}
      </p>

      <p
        style={{
          fontSize: 12,
          color: 'rgba(245, 240, 232, 0.55)',
          margin: 0,
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.6,
        }}
      >
        ✦ Soul Sigil · 这是只属于你的几何咒符
        <br />
        由你的人格轴向 + 主神归属 + 月相位置共同生成
      </p>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => downloadPng('square')}
          aria-label={downloaded ? '已保存印记 PNG' : '保存印记 PNG 到本地'}
          style={btnStyle('primary')}
        >
          {downloaded ? '✓ 已保存' : '☆ 保存印记 PNG'}
        </button>
        <button
          type="button"
          onClick={() => downloadPng('wallpaper')}
          aria-label="下载 1080×1920 锁屏壁纸"
          style={btnStyle('secondary')}
        >
          ☆ 锁屏壁纸 1080×1920
        </button>
        <button
          type="button"
          onClick={() => downloadSvg(false)}
          aria-label="下载超高清 SVG矢量文件"
          style={btnStyle('ghost')}
        >
          ☆ 超高清 SVG
        </button>
        <button
          type="button"
          onClick={copyString}
          aria-label={copied ? '已复制到剪贴板' : `复制印记字符串 ${sigilString}`}
          style={btnStyle('ghost')}
        >
          {copied ? '✓ 已复制' : `复制 ${sigilString}`}
        </button>
      </div>
    </div>
  );
}

function btnStyle(variant: 'primary' | 'secondary' | 'ghost'): React.CSSProperties {
  if (variant === 'primary') {
    return {
      padding: '8px 16px',
      borderRadius: 999,
      border: '1px solid rgba(192,122,142,0.55)',
      background: 'linear-gradient(135deg, #C07A8E 0%, #B08576 100%)',
      color: '#1a1530',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 1,
      cursor: 'pointer',
    };
  }
  if (variant === 'secondary') {
    return {
      padding: '8px 16px',
      borderRadius: 999,
      border: '1px solid rgba(201,166,118,0.55)',
      background: 'transparent',
      color: '#C9A676',
      fontSize: 13,
      letterSpacing: 1,
      cursor: 'pointer',
    };
  }
  return {
    padding: '8px 16px',
    borderRadius: 999,
    border: '1px solid rgba(245,240,232,0.18)',
    background: 'transparent',
    color: 'rgba(245,240,232,0.7)',
    fontSize: 13,
    letterSpacing: 1,
    cursor: 'pointer',
  };
}
