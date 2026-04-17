'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { SHARE_SITE_URL, withBasePath } from '@/lib/site';
import type { WtftiPersonality } from '@/lib/wtfti-personalities';
import { MYSTI_THEMES } from '@/lib/mysti/themes';
import type { MystiTheme, MystiShareImageGeneratorHandle } from '@/lib/mysti/types';
import { getMystiTarotData } from '@/lib/mysti/tarot-mapping';
import { getDualInterpretation } from '@/lib/mysti/dual-interpretation';
import { trackMystiEvent } from '@/lib/mysti/analytics';
import {
  SHARE_CARD_TIERS,
  SHARE_CARD_TIER_LABEL,
  type ShareCardTier,
} from '@/lib/share-card-tiers';
import { isUnlocked, SKU_PRICES, type MystiSku } from '@/lib/mysti/unlock';

const CARD_WIDTH = 540;
const MAX_H = 4000;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_SERIF = 'Georgia, "Songti SC", "SimSun", serif';

/**
 * 给一张已经渲染好的卡片 dataUrl 套上 L3 档位的视觉装饰：
 *   - plus    : 烫金双线内框 + PLUS · MYSTI 顶部小标 + 遮去站点水印行
 *   - atelier : 双层金箔外框 + N° 编号印戳 + 衬线"ATELIER"题头 + 遮水印
 *
 * 不会重新跑底层 canvas 渲染，只在结果像素上做 paint-over，保持非破坏性。
 */
async function applyTierOverlay(
  baseDataUrl: string,
  tier: 'plus' | 'atelier',
  bgColor: string,
): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('overlay base image load failed'));
    img.src = baseDataUrl;
  });
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('overlay canvas ctx unavailable');
  ctx.drawImage(img, 0, 0);

  // 1. 抹掉底部最后 ~5% 的水印条
  const watermarkH = Math.round(img.height * 0.05);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, img.height - watermarkH, img.width, watermarkH);

  // 2. 内描边
  const isAtelier = tier === 'atelier';
  const inset = isAtelier ? 22 : 14;
  const goldOuter = '#C9A86C';
  const goldInner = '#E5C98A';
  ctx.strokeStyle = goldOuter;
  ctx.lineWidth = isAtelier ? 4 : 2.5;
  ctx.strokeRect(inset, inset, img.width - inset * 2, img.height - inset * 2);
  if (isAtelier) {
    ctx.strokeStyle = goldInner;
    ctx.lineWidth = 1;
    const inset2 = inset + 6;
    ctx.strokeRect(inset2, inset2, img.width - inset2 * 2, img.height - inset2 * 2);
  }

  // 3. 顶部 ribbon / 题头
  ctx.textBaseline = 'middle';
  if (isAtelier) {
    ctx.font = `italic 600 ${Math.round(img.width * 0.034)}px Fraunces, "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = goldInner;
    ctx.textAlign = 'center';
    ctx.fillText('— N° ATELIER · MYSTI —', img.width / 2, inset + 30);
  } else {
    ctx.font = `600 ${Math.round(img.width * 0.026)}px ${FONT_SANS}`;
    ctx.fillStyle = goldOuter;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.32em';
    ctx.fillText('PLUS · MYSTI', img.width / 2, inset + 22);
  }

  // 4. 底部 tier 自定义水印
  ctx.font = `${Math.round(img.width * 0.022)}px ${FONT_SERIF}`;
  ctx.fillStyle = isAtelier ? goldInner : goldOuter;
  ctx.textAlign = 'center';
  const footY = img.height - inset - 18;
  if (isAtelier) {
    const numero = `N° ${(Math.floor(Math.random() * 8888) + 1).toString().padStart(4, '0')} · MYSTI ATELIER`;
    ctx.fillText(numero, img.width / 2, footY);
  } else {
    ctx.fillText('MYSTI · PLUS EDITION', img.width / 2, footY);
  }

  return c.toDataURL('image/png');
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function hexToRgba(hex: string, alpha: number) {
  const n = hex.replace('#', '');
  const v = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const r = Number.parseInt(v.slice(0, 2), 16);
  const g = Number.parseInt(v.slice(2, 4), 16);
  const b = Number.parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, stroke: string, width = 1) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    const onLoad = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error(`Failed to load ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onErr); };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onErr);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* best-effort */ }
  return img;
}

function getCachedImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = loadImage(src).catch(e => { imageCache.delete(src); throw e; });
  imageCache.set(src, p);
  return p;
}

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = text.split('');
  const lines: string[] = [];
  let line = '';
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawOrnaments(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = `10px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', x + 4, y + 4);
  ctx.fillText('✦', x + w - 4, y + 4);
  ctx.fillText('✦', x + 4, y + h - 4);
  ctx.fillText('✦', x + w - 4, y + h - 4);
}

function drawTarotFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: MystiTheme,
) {
  // glow
  ctx.save();
  ctx.shadowColor = hexToRgba(theme.accent, 0.18);
  ctx.shadowBlur = 24;
  fillRoundedRect(ctx, x, y, w, h, 10, theme.cardSurface);
  ctx.restore();

  // outer border
  strokeRoundedRect(ctx, x, y, w, h, 10, theme.cardBorder, 1.5);
  // inner border
  strokeRoundedRect(ctx, x + 6, y + 6, w - 12, h - 12, 6, hexToRgba(theme.divider, 0.6), 1);
  // ornaments
  drawOrnaments(ctx, x + 2, y + 2, w - 4, h - 4, theme.accent);
}

function drawPersonalityBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  personality: WtftiPersonality,
  theme: MystiTheme,
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `24px ${FONT_SANS}`;
  ctx.fillStyle = theme.text;
  ctx.fillText(`${personality.emoji} ${personality.code} · ${personality.wtftiName}`, x, y);
}

function drawTagline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tagline: string,
  theme: MystiTheme,
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `italic 18px ${FONT_SERIF}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(`〜 ${tagline} 〜`, x, y);
}

function drawKeywords(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  keywords: string[],
  theme: MystiTheme,
) {
  ctx.font = `13px ${FONT_SANS}`;
  let x = cx;
  const gap = 10;
  const paddings = [10, 6]; // h, v

  // measure total width
  let totalW = 0;
  const widths: number[] = [];
  for (const kw of keywords) {
    const w = ctx.measureText(kw).width + paddings[0] * 2;
    widths.push(w);
    totalW += w;
  }
  totalW += (keywords.length - 1) * gap;
  x = cx - totalW / 2;

  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i];
    const w = widths[i];
    fillRoundedRect(ctx, x, y, w, 26, 13, theme.accentSoft);
    ctx.fillStyle = theme.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(kw, x + w / 2, y + 13);
    x += w + gap;
  }
}

function drawShadowCard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  w: number,
  shadowArcana: { name: string; keywords: string[] },
  theme: MystiTheme,
  shadowReading?: string,
): number {
  const padY = 12;
  const kwLineH = 20;
  // Calculate height based on content
  let contentH = padY + 20 + kwLineH; // top pad + header + keywords line

  // Shadow reading text lines
  let readingLines: string[] = [];
  if (shadowReading) {
    ctx.font = `12px ${FONT_SANS}`;
    readingLines = wrapText(ctx, shadowReading, w - 40);
    contentH += 10 + readingLines.length * 17; // gap + lines
  }
  contentH += padY; // bottom pad

  const x = cx - w / 2;
  fillRoundedRect(ctx, x, y, w, contentH, 8, hexToRgba(theme.cardSurface, 0.6));
  strokeRoundedRect(ctx, x, y, w, contentH, 8, hexToRgba(theme.divider, 0.5), 1);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(`Shadow · ${shadowArcana.name}`, cx, y + padY);

  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = hexToRgba(theme.textMuted, 0.85);
  const kwText = shadowArcana.keywords.join(' · ');
  ctx.fillText(kwText, cx, y + padY + 20);

  if (readingLines.length > 0) {
    ctx.font = `12px ${FONT_SANS}`;
    ctx.fillStyle = hexToRgba(theme.textMuted, 0.75);
    let ry = y + padY + 20 + kwLineH + 6;
    for (const line of readingLines) {
      ctx.fillText(line, cx, ry);
      ry += 17;
    }
  }

  return contentH;
}

function drawQrAndFooter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  qrDataUrl: string,
  theme: MystiTheme,
) {
  const qrSize = 84;
  const qrX = cx - qrSize / 2;

  // qr background circle (subtle)
  ctx.beginPath();
  ctx.arc(cx, y + qrSize / 2, qrSize / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = theme.cardSurface;
  ctx.fill();
  ctx.strokeStyle = theme.divider;
  ctx.lineWidth = 1;
  ctx.stroke();

  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  // qrDataUrl is a data URL so it's already loaded synchronously enough for drawImage in most browsers,
  // but to be safe we only call this after awaiting toDataURL in the render function.
  ctx.drawImage(qrImg, qrX, y, qrSize, qrSize);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('wtfti.com/mysti', cx, y + qrSize + 10);

  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('扫码解锁你的灵魂卡牌', cx, y + qrSize + 32);
}

async function createQrImage(slug?: string, partnerSlug?: string): Promise<string> {
  let url = `${SHARE_SITE_URL}mysti/`;
  if (slug) {
    url += `?slug=${encodeURIComponent(slug)}`;
    if (partnerSlug) {
      url += `&partner=${encodeURIComponent(partnerSlug)}`;
    }
  }
  return toQrDataUrl(url, { width: 200, margin: 1, color: { dark: '#2D2A26', light: '#FFF9F2' } });
}

async function renderMystiShareImage(
  personality: WtftiPersonality,
  partner: WtftiPersonality | undefined,
  themeId: MystiTheme['id'],
  reading?: string,
  bondTagline?: string,
  dynamics?: string,
): Promise<string> {
  const theme = MYSTI_THEMES[themeId];
  const data = getMystiTarotData(personality.slug);
  if (!data) throw new Error(`No Mysti tarot mapping for slug: ${personality.slug}`);

  const partnerData = partner ? getMystiTarotData(partner.slug) : null;
  if (partner && !partnerData) throw new Error(`No Mysti tarot mapping for slug: ${partner.slug}`);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = MAX_H * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // base scale
  ctx.scale(CARD_SCALE, CARD_SCALE);

  // background
  const grad = ctx.createLinearGradient(0, 0, 0, MAX_H);
  grad.addColorStop(0, theme.gradientBg[0]);
  grad.addColorStop(1, theme.gradientBg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  // decorative radial glow (subtle)
  const glow = ctx.createRadialGradient(CARD_WIDTH / 2, 300, 40, CARD_WIDTH / 2, 300, 360);
  glow.addColorStop(0, hexToRgba(theme.accent, 0.08));
  glow.addColorStop(1, hexToRgba(theme.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, 800);

  // Load images
  const qrDataUrl = await createQrImage(personality.slug, partner?.slug);
  const tarotUrl = withBasePath(`/images/mysti/tarot/${theme.tarotDir}${personality.slug}.png`);
  const tarotImg = await getCachedImage(tarotUrl).catch(() => null);
  const partnerTarotImg = partner
    ? await getCachedImage(withBasePath(`/images/mysti/tarot/${theme.tarotDir}${partner.slug}.png`)).catch(() => null)
    : null;

  const W = CARD_WIDTH;
  const cx = W / 2;

  if (!partner) {
    // ─── Single mode ───
    let y = 44;

    // brand
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `14px ${FONT_SANS}`;
    ctx.fillStyle = theme.textMuted;
    ctx.fillText('WTFTI · 灵鉴', cx, y);
    y += 42;

    // arcana header
    ctx.font = `12px ${FONT_SANS}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText('大阿卡纳', cx, y);
    y += 20;
    ctx.font = `bold 26px ${FONT_SANS}`;
    ctx.fillStyle = theme.text;
    ctx.fillText(data.majorArcana.name, cx, y);
    y += 36;

    // divider
    ctx.beginPath();
    ctx.moveTo(cx - 60, y);
    ctx.lineTo(cx + 60, y);
    ctx.strokeStyle = theme.divider;
    ctx.lineWidth = 1;
    ctx.stroke();
    y += 24;

    // tarot image
    const tw = 264;
    const th = 396;
    const tx = cx - tw / 2;
    drawTarotFrame(ctx, tx, y, tw, th, theme);
    if (tarotImg) {
      drawImageContain(ctx, tarotImg, tx + 10, y + 10, tw - 20, th - 20);
    } else {
      // placeholder
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = theme.textMuted;
      ctx.font = `64px ${FONT_SERIF}`;
      ctx.fillText(data.majorArcana.name.slice(0, 1), cx, y + th / 2 - 12);
      ctx.font = `18px ${FONT_SANS}`;
      ctx.fillText(personality.emoji, cx, y + th / 2 + 42);
      ctx.restore();
    }
    y += th + 24;

    // badge
    drawPersonalityBadge(ctx, cx, y, personality, theme);
    y += 38;

    // tagline
    drawTagline(ctx, cx, y, data.tagline, theme);
    y += 32;

    // reading quote card
    if (reading) {
      const quotePadX = 28;
      const quotePadY = 24;
      const quoteW = 460;
      const quoteInnerW = quoteW - quotePadX * 2;
      ctx.font = `14px ${FONT_SANS}`;
      const readingLines = wrapText(ctx, reading, quoteInnerW);
      const lineH = 20;
      const quoteH = readingLines.length * lineH + quotePadY * 2 + 16;
      const qx = cx - quoteW / 2;

      fillRoundedRect(ctx, qx, y, quoteW, quoteH, 12, theme.accentSoft);

      // decorative left quote mark
      ctx.font = `bold 32px ${FONT_SERIF}`;
      ctx.fillStyle = theme.accent;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('\u201C', qx + 12, y + 6);

      // text
      ctx.font = `14px ${FONT_SANS}`;
      ctx.fillStyle = theme.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      let ry = y + quotePadY + 8;
      for (const line of readingLines) {
        ctx.fillText(line, cx, ry);
        ry += lineH;
      }

      // decorative right quote mark
      ctx.font = `bold 32px ${FONT_SERIF}`;
      ctx.fillStyle = theme.accent;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('\u201D', qx + quoteW - 12, y + quoteH - 10);

      y += quoteH + 20;
    }

    // keywords
    drawKeywords(ctx, cx, y, data.majorArcana.keywords, theme);
    y += 42;

    // shadow card
    const shadowH = drawShadowCard(ctx, cx, y, 292, data.shadowArcana, theme, data.shadowReading);
    y += shadowH + 24;

    // qr & footer
    drawQrAndFooter(ctx, cx, y, qrDataUrl, theme);
    y += 140;

    const cropH = Math.max(y + 24, 880);
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = canvas.width;
    croppedCanvas.height = cropH * CARD_SCALE;
    const cctx = croppedCanvas.getContext('2d');
    if (!cctx) throw new Error('Crop canvas context unavailable');
    cctx.drawImage(canvas, 0, 0, canvas.width, croppedCanvas.height, 0, 0, canvas.width, croppedCanvas.height);
    return croppedCanvas.toDataURL('image/png');
  }

  // ─── Dual mode ───
  let y = 44;

  // brand
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `14px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('WTFTI · 灵鉴', cx, y);
  y += 42;

  // dual title
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText('双魂共振', cx, y);
  y += 20;
  ctx.font = `bold 26px ${FONT_SANS}`;
  ctx.fillStyle = theme.text;
  ctx.fillText('关系灵鉴', cx, y);
  y += 36;

  // divider
  ctx.beginPath();
  ctx.moveTo(cx - 60, y);
  ctx.lineTo(cx + 60, y);
  ctx.strokeStyle = theme.divider;
  ctx.lineWidth = 1;
  ctx.stroke();
  y += 24;

  // two tarot frames
  const cardW = 198;
  const cardH = 297;
  const gap = 24;
  const leftX = cx - cardW - gap / 2;
  const rightX = cx + gap / 2;

  drawTarotFrame(ctx, leftX, y, cardW, cardH, theme);
  if (tarotImg) {
    drawImageContain(ctx, tarotImg, leftX + 8, y + 8, cardW - 16, cardH - 16);
  } else {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textMuted;
    ctx.font = `48px ${FONT_SERIF}`;
    ctx.fillText(data.majorArcana.name.slice(0, 1), leftX + cardW / 2, y + cardH / 2 - 8);
    ctx.font = `16px ${FONT_SANS}`;
    ctx.fillText(personality.emoji, leftX + cardW / 2, y + cardH / 2 + 32);
    ctx.restore();
  }

  drawTarotFrame(ctx, rightX, y, cardW, cardH, theme);
  if (partnerTarotImg) {
    drawImageContain(ctx, partnerTarotImg, rightX + 8, y + 8, cardW - 16, cardH - 16);
  } else {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textMuted;
    ctx.font = `48px ${FONT_SERIF}`;
    ctx.fillText(partnerData!.majorArcana.name.slice(0, 1), rightX + cardW / 2, y + cardH / 2 - 8);
    ctx.font = `16px ${FONT_SANS}`;
    ctx.fillText(partner.emoji, rightX + cardW / 2, y + cardH / 2 + 32);
    ctx.restore();
  }
  y += cardH + 18;

  // badges
  drawPersonalityBadge(ctx, leftX + cardW / 2, y, personality, theme);
  drawPersonalityBadge(ctx, rightX + cardW / 2, y, partner, theme);
  y += 38;

  // keywords
  drawKeywords(ctx, leftX + cardW / 2, y, data.majorArcana.keywords, theme);
  drawKeywords(ctx, rightX + cardW / 2, y, partnerData!.majorArcana.keywords, theme);
  y += 42;

  // bond tagline - archetype
  if (bondTagline) {
    const dualInterp = getDualInterpretation(personality.slug, partner.slug, data, partnerData!);
    const archetype = dualInterp.archetype;

    // archetype display
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold 18px ${FONT_SANS}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`${archetype.emoji} ${archetype.name}`, cx, y);
    y += 30;

    // bond tagline (italic)
    ctx.font = `italic 15px ${FONT_SERIF}`;
    ctx.fillStyle = theme.text;
    ctx.fillText(bondTagline, cx, y);
    y += 28;

    // dynamics quote card
    if (dynamics) {
      const dynPadX = 28;
      const dynPadY = 20;
      const dynW = 460;
      const dynInnerW = dynW - dynPadX * 2;
      ctx.font = `13px ${FONT_SANS}`;
      const dynLines = wrapText(ctx, dynamics, dynInnerW);
      const lineH = 19;
      const dynH = dynLines.length * lineH + dynPadY * 2 + 12;
      const dx = cx - dynW / 2;

      fillRoundedRect(ctx, dx, y, dynW, dynH, 12, theme.accentSoft);

      // text
      ctx.font = `13px ${FONT_SANS}`;
      ctx.fillStyle = theme.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      let dy = y + dynPadY + 4;
      for (const line of dynLines) {
        ctx.fillText(line, cx, dy);
        dy += lineH;
      }

      y += dynH + 18;
    }
  } else {
    // fallback: original bond tagline
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `italic 16px ${FONT_SERIF}`;
    ctx.fillStyle = theme.accent;
    ctx.fillText(`✦ ${data.majorArcana.name} × ${partnerData!.majorArcana.name} ✦`, cx, y);
    y += 26;
    ctx.font = `14px ${FONT_SANS}`;
    ctx.fillStyle = theme.textMuted;
    ctx.fillText('命运让两张牌相遇', cx, y);
    y += 36;
  }

  // combined shadow card
  const shadowW = 360;
  const shadowPadY = 12;
  let shadowContentH = shadowPadY + 20 + 20 + 20; // header + keywords + subtext

  // calculate shadow reading teaser heights
  const shadowTeaser1 = data.shadowReading ? data.shadowReading.split('。')[0] + '。' : '';
  const shadowTeaser2 = partnerData!.shadowReading ? partnerData!.shadowReading.split('。')[0] + '。' : '';
  let teaser1Lines: string[] = [];
  let teaser2Lines: string[] = [];
  if (shadowTeaser1) {
    ctx.font = `11px ${FONT_SANS}`;
    teaser1Lines = wrapText(ctx, shadowTeaser1, shadowW - 40);
    shadowContentH += 8 + teaser1Lines.length * 15;
  }
  if (shadowTeaser2) {
    ctx.font = `11px ${FONT_SANS}`;
    teaser2Lines = wrapText(ctx, shadowTeaser2, shadowW - 40);
    shadowContentH += 8 + teaser2Lines.length * 15;
  }
  shadowContentH += shadowPadY;

  const sx = cx - shadowW / 2;
  fillRoundedRect(ctx, sx, y, shadowW, shadowContentH, 8, hexToRgba(theme.cardSurface, 0.6));
  strokeRoundedRect(ctx, sx, y, shadowW, shadowContentH, 8, hexToRgba(theme.divider, 0.5), 1);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(`Shadow · ${data.shadowArcana.name} × ${partnerData!.shadowArcana.name}`, cx, y + shadowPadY);

  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillStyle = hexToRgba(theme.textMuted, 0.85);
  const leftKws = data.shadowArcana.keywords.slice(0, 2).join(' · ');
  const rightKws = partnerData!.shadowArcana.keywords.slice(0, 2).join(' · ');
  ctx.fillText(`${leftKws}  —  ${rightKws}`, cx, y + shadowPadY + 20);
  ctx.fillText('两人的阴影，亦是共同的课题', cx, y + shadowPadY + 40);

  let sty = y + shadowPadY + 60;
  if (teaser1Lines.length > 0) {
    ctx.font = `11px ${FONT_SANS}`;
    ctx.fillStyle = hexToRgba(theme.textMuted, 0.7);
    sty += 4;
    for (const line of teaser1Lines) { ctx.fillText(line, cx, sty); sty += 15; }
  }
  if (teaser2Lines.length > 0) {
    ctx.font = `11px ${FONT_SANS}`;
    ctx.fillStyle = hexToRgba(theme.textMuted, 0.7);
    sty += 4;
    for (const line of teaser2Lines) { ctx.fillText(line, cx, sty); sty += 15; }
  }
  y += shadowContentH + 22;

  // qr & footer
  drawQrAndFooter(ctx, cx, y, qrDataUrl, theme);
  y += 140;

  const cropH = Math.max(y + 24, 960);
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = canvas.width;
  croppedCanvas.height = cropH * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Crop canvas context unavailable');
  cctx.drawImage(canvas, 0, 0, canvas.width, croppedCanvas.height, 0, 0, canvas.width, croppedCanvas.height);
  return croppedCanvas.toDataURL('image/png');
}

interface Props {
  personality: WtftiPersonality;
  partner?: WtftiPersonality;
  themeId?: MystiTheme['id'];
  /** L3 分享卡档位；free=奇迹奇迹奥 plus=烫金精修 atelier=N° 藏品 */
  defaultTier?: ShareCardTier;
  /** 是否允许用户切换档位（默认 true） */
  allowTierSwitch?: boolean;
}

const TIER_TO_SKU: Record<Exclude<ShareCardTier, 'free'>, MystiSku> = {
  plus: 'share-plus',
  atelier: 'share-atelier',
};

export const MystiShareImageGenerator = forwardRef<MystiShareImageGeneratorHandle, Props>(
  function MystiShareImageGenerator(
    { personality, partner, themeId = 'celestial', defaultTier = 'free', allowTierSwitch = true },
    ref,
  ) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const [tier, setTier] = useState<ShareCardTier>(defaultTier);

    const theme = MYSTI_THEMES[themeId];
    const tierTokens = SHARE_CARD_TIERS[tier];
    const resourceId = partner ? `${personality.slug}-${partner.slug}` : personality.slug;

    const tierUnlocked = useCallback(
      (t: ShareCardTier) => t === 'free' || isUnlocked(TIER_TO_SKU[t as 'plus' | 'atelier'], resourceId),
      [resourceId],
    );

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      // Gating: 付费档位未解锁 → 直接调起支付（同 MystiPaywall 流程）
      if (tier !== 'free' && !tierUnlocked(tier)) {
        const sku = TIER_TO_SKU[tier as 'plus' | 'atelier'];
        trackMystiEvent('mysti_share_tier_unlock_click', { tier, sku, resourceId });
        try {
          setGenerating(true);
          const res = await fetch('/api/mysti/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku, resourceId, paymentType: 'wxpay' }),
          });
          const data = (await res.json()) as { url?: string; error?: string };
          if (data.url && typeof window !== 'undefined') {
            window.location.href = data.url;
            return;
          }
          setSaveHint(data.error || '支付下单失败，请稍后再试。');
        } catch (e) {
          setSaveHint(`支付下单失败：${String(e)}`);
        } finally {
          setGenerating(false);
        }
        return;
      }
      setGenerating(true);
      setSaveHint(null);
      const isDual = !!partner;
      trackMystiEvent('mysti_share_generate', { isDual, personality: personality.slug, partner: partner?.slug, tier });
      try {
        // Compute reading for single mode
        const readingText = !partner ? (getMystiTarotData(personality.slug)?.reading) : undefined;
        // Compute dual interpretation for dual mode
        let bondTaglineText: string | undefined;
        let dynamicsText: string | undefined;
        if (partner) {
          const dataA = getMystiTarotData(personality.slug);
          const dataB = getMystiTarotData(partner.slug);
          if (dataA && dataB) {
            const dualInterp = getDualInterpretation(personality.slug, partner.slug, dataA, dataB);
            bondTaglineText = dualInterp.bondTagline;
            dynamicsText = dualInterp.dynamics;
          }
        }
        const dataUrl = await renderMystiShareImage(personality, partner, themeId, readingText, bondTaglineText, dynamicsText);
        const finalUrl = tier === 'free' ? dataUrl : await applyTierOverlay(dataUrl, tier, theme.bg);
        setPreviewUrl(finalUrl);
      } catch (e) {
        console.error('Mysti share image generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [generating, personality, partner, themeId, tier, tierUnlocked, resourceId, theme.bg]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      const code = partner ? `${personality.code}-${partner.code}` : personality.code;
      const tierSuffix = tier === 'free' ? '' : `-${tier}`;
      return new File([blob], `Mysti-${code}${tierSuffix}.png`, { type: 'image/png' });
    }, [personality.code, partner, previewUrl, tier]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      trackMystiEvent('mysti_share_download', { personality: personality.slug, partner: partner?.slug, tier });
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: file.name });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
        setSaveHint('请长按上方图片保存到相册。');
        return;
      }
      const link = document.createElement('a');
      const code = partner ? `${personality.code}-${partner.code}` : personality.code;
      const tierSuffix = tier === 'free' ? '' : `-${tier}`;
      link.download = `Mysti-${code}${tierSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, partner, previewUrl, tier]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      trackMystiEvent('mysti_share_native', { personality: personality.slug, partner: partner?.slug });
      try {
        const file = await createPreviewFile();
        const title = partner
          ? `我们的灵鉴结果：${personality.wtftiName} × ${partner.wtftiName}`
          : `我的灵鉴结果：${personality.wtftiName}`;
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, partner, personality.wtftiName]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
        {allowTierSwitch && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {(['free', 'plus', 'atelier'] as const).map(t => {
              const active = tier === t;
              const unlocked = tierUnlocked(t);
              const label = SHARE_CARD_TIER_LABEL[t];
              const sku = t === 'free' ? null : TIER_TO_SKU[t];
              const price = sku ? SKU_PRICES[sku].price : 0;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={[
                    'rounded-xl border px-2 py-2 text-left transition-all cursor-pointer',
                    active
                      ? 'border-white/60 bg-white/15 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.45)]'
                      : 'border-white/15 bg-white/5 hover:border-white/35 hover:bg-white/10',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-1 text-[11px] font-medium text-white">
                    {t !== 'free' && !unlocked && <span aria-hidden>🔒</span>}
                    {label.name}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-white/55 line-clamp-1">
                    {label.tagline}
                  </div>
                  {t !== 'free' && (
                    <div className={`mt-1 text-[10px] font-semibold ${unlocked ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {unlocked ? '已解锁' : `¥${price.toFixed(1)}`}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-xl text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})` }}
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              生成中…
            </>
          ) : tier !== 'free' && !tierUnlocked(tier) ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {SHARE_CARD_TIER_LABEL[tier].cta} · ¥{SKU_PRICES[TIER_TO_SKU[tier as 'plus' | 'atelier']].price.toFixed(1)}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {tier === 'free' ? '📸 生成灵鉴卡牌' : `📸 生成 ${SHARE_CARD_TIER_LABEL[tier].name} 卡`}
            </>
          )}
        </button>

        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center"
            onClick={() => setPreviewUrl(null)}
          >
            <div
              className="relative w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-3 right-3 rounded-full bg-black/55 p-2 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 z-10"
                aria-label="关闭"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className={`rounded-2xl overflow-hidden shadow-2xl mb-4 ${tierTokens.containerClass}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="灵鉴分享卡片" className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-pink-400 mb-3 px-4 leading-5">
                  {saveHint}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl border border-white/30 text-sm text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  保存图片
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})` }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </button>
              </div>

              <p className="text-center text-xs text-white/60 mt-4">
                点击空白处关闭
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);
