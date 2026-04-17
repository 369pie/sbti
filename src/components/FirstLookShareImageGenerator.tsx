'use client';

import { forwardRef, useCallback, useImperativeHandle } from 'react';
import type { FirstLookArchetype } from '@/lib/first-look/archetypes';
import { withBasePath } from '@/lib/site';

export interface FirstLookShareImageGeneratorHandle {
  download: () => Promise<void>;
}

interface Props {
  archetype: FirstLookArchetype;
}

const CARD_W = 1080;
const CARD_H = 1350;

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

async function renderFirstLookShareImage(archetype: FirstLookArchetype): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.textBaseline = 'top';

  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, '#FFFDF9');
  bg.addColorStop(1, '#F8F2EA');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const glow = ctx.createRadialGradient(CARD_W / 2, 260, 30, CARD_W / 2, 260, 480);
  glow.addColorStop(0, `${archetype.accent}55`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, 780);

  ctx.strokeStyle = `${archetype.accent}55`;
  ctx.lineWidth = 2;
  roundRect(ctx, 36, 36, CARD_W - 72, CARD_H - 72, 28);
  ctx.stroke();

  ctx.fillStyle = '#7E756D';
  ctx.font = '500 26px "Noto Sans SC", "PingFang SC", sans-serif';
  drawCenterText(ctx, 'W T F T I   ·   F I R S T   L O O K', 110);

  ctx.fillStyle = '#2A2520';
  ctx.font = '700 44px "Noto Serif SC", serif';
  drawCenterText(ctx, `N° ${archetype.code}`, 188);

  ctx.fillStyle = archetype.accent;
  ctx.font = '700 176px "Noto Serif SC", serif';
  drawCenterText(ctx, archetype.glyph, 290);

  ctx.fillStyle = '#1F1914';
  ctx.font = '700 92px "Noto Serif SC", serif';
  drawCenterText(ctx, archetype.name, 510);

  ctx.fillStyle = '#7E756D';
  ctx.font = '600 34px "Noto Sans SC", "PingFang SC", sans-serif';
  drawCenterText(ctx, `#${archetype.code} · ${archetype.nameEn}`, 635);

  ctx.fillStyle = '#3E352E';
  ctx.font = '500 42px "Noto Serif SC", serif';
  drawWrappedCenterText(ctx, `“${archetype.tagline}”`, CARD_W / 2, 720, 820, 58, 2);

  ctx.fillStyle = '#5B5048';
  ctx.font = '500 34px "Noto Sans SC", "PingFang SC", sans-serif';
  drawWrappedCenterText(ctx, archetype.prose, CARD_W / 2, 860, 860, 50, 4);

  ctx.fillStyle = `${archetype.accent}22`;
  roundRect(ctx, 128, 1110, CARD_W - 256, 94, 46);
  ctx.fill();
  ctx.fillStyle = archetype.accent;
  ctx.font = '600 34px "Noto Sans SC", "PingFang SC", sans-serif';
  drawCenterText(ctx, `仅 ${archetype.holdRate}% 的人是这张`, 1140);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.wtfti.com';
  const link = `${origin}${withBasePath(`/test/result/${archetype.slug}/`)}`;

  ctx.fillStyle = '#877C73';
  ctx.font = '500 26px "Noto Sans SC", "PingFang SC", sans-serif';
  drawCenterText(ctx, '测你的初见牌：', 1248);
  ctx.fillStyle = '#5F554D';
  ctx.font = '500 24px "JetBrains Mono", ui-monospace, monospace';
  drawCenterText(ctx, link, 1286);

  return canvas.toDataURL('image/png');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCenterText(ctx: CanvasRenderingContext2D, text: string, y: number): void {
  const w = ctx.measureText(text).width;
  ctx.fillText(text, (CARD_W - w) / 2, y);
}

function drawWrappedCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): void {
  const chars = text.split('');
  const lines: string[] = [];
  let current = '';

  for (const ch of chars) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = ch;
      if (lines.length >= maxLines - 1) break;
    } else {
      current = test;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    const w = ctx.measureText(line).width;
    ctx.fillText(line, centerX - w / 2, y + i * lineHeight);
  }
}

export const FirstLookShareImageGenerator = forwardRef<FirstLookShareImageGeneratorHandle, Props>(
  function FirstLookShareImageGenerator({ archetype }, ref) {
    const download = useCallback(async () => {
      const dataUrl = await renderFirstLookShareImage(archetype);
      if (isMobile()) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `WTFti-FirstLook-${archetype.code}.png`, { type: 'image/png' });
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: `我的初见牌：${archetype.name}` });
            return;
          }
        } catch {
          // fallback to direct download below
        }
      }
      const link = document.createElement('a');
      link.download = `WTFti-FirstLook-${archetype.code}.png`;
      link.href = dataUrl;
      link.click();
    }, [archetype]);

    useImperativeHandle(ref, () => ({ download }), [download]);
    return null;
  },
);
