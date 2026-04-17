/**
 * Share card generator — produces a 1080×1920 (9:16) PNG for Xiaohongshu.
 *
 * Uses the browser Canvas API (zero external deps). Runs entirely client-side;
 * the exported Blob is offered as a download or can be opened in a new tab
 * for mobile users to long-press-save.
 *
 * Layout (top → bottom):
 *  - Gradient background (card accent)
 *  - Corner ornaments ✦
 *  - Top: tab emoji + label (eyebrow)
 *  - Center 60%: character image (from same-origin public/images/types/…)
 *  - Bottom 30%: code · name (bold) · tagline · WTFTI watermark
 */

export interface ShareCardOptions {
  imageSrc: string;     // same-origin path, e.g. /images/types/sbti/thumbs/solo.webp
  name: string;
  tagline: string;
  code: string;
  accentColor: string;  // hex, e.g. '#e8729c'
  tabLabel: string;
  tabEmoji: string;
}

const W = 1080;
const H = 1920;

/** Hex → [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Load an image from a same-origin URL as ImageBitmap. */
async function loadBitmap(src: string): Promise<ImageBitmap | null> {
  try {
    const resp = await fetch(src);
    const blob = await resp.blob();
    return await createImageBitmap(blob);
  } catch {
    return null;
  }
}

/** Wrap text at a given px width, return array of lines. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('');  // Chinese — split by character
  const lines: string[] = [];
  let current = '';
  for (const ch of words) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateShareCard(opts: ShareCardOptions): Promise<Blob> {
  const { imageSrc, name, tagline, code, accentColor, tabLabel, tabEmoji } = opts;
  const [r, g, b] = hexToRgb(accentColor);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background gradient ─────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
  bg.addColorStop(0, `rgba(${r},${g},${b},0.22)`);
  bg.addColorStop(0.55, `rgba(${r},${g},${b},0.06)`);
  bg.addColorStop(1, 'rgba(248,245,240,1)');
  ctx.fillStyle = 'rgb(248,245,240)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle grid texture (thin lines) ────────────────────────────────
  ctx.strokeStyle = `rgba(${r},${g},${b},0.06)`;
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Corner ornaments ✦ ───────────────────────────────────────────────
  const PAD = 72;
  ctx.fillStyle = `rgba(${r},${g},${b},0.45)`;
  ctx.font = '60px serif';
  ctx.fillText('✦', PAD - 20, PAD + 20);
  ctx.fillText('✦', W - PAD - 40, PAD + 20);
  ctx.fillText('✦', PAD - 20, H - PAD);
  ctx.fillText('✦', W - PAD - 40, H - PAD);

  // ── Eyebrow (tab label) ──────────────────────────────────────────────
  ctx.fillStyle = `rgba(${r},${g},${b},0.80)`;
  ctx.font = '500 42px monospace';
  ctx.textAlign = 'left';
  const eyebrowText = `${tabEmoji}  ${tabLabel.toUpperCase()}`;
  ctx.fillText(eyebrowText, PAD, PAD + 80);

  // ── Issue marker right side ──────────────────────────────────────────
  ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
  ctx.font = '500 38px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('WTFTI · 全人格图鉴馆', W - PAD, PAD + 80);
  ctx.textAlign = 'left';

  // ── Thin rule under eyebrow ──────────────────────────────────────────
  ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, PAD + 104);
  ctx.lineTo(W - PAD, PAD + 104);
  ctx.stroke();

  // ── Character image (center, 62% height zone) ────────────────────────
  const IMG_TOP = 220;
  const IMG_ZONE_H = Math.round(H * 0.60);
  const bitmap = await loadBitmap(imageSrc);
  if (bitmap) {
    // Fit inside a square
    const sq = Math.min(W - PAD * 2, IMG_ZONE_H);
    const ix = (W - sq) / 2;
    const iy = IMG_TOP + (IMG_ZONE_H - sq) / 2;
    // Drop shadow simulation via multiple semi-transparent copies
    for (let s = 8; s >= 1; s--) {
      ctx.globalAlpha = 0.022 * s;
      ctx.filter = `blur(${s * 4}px)`;
      ctx.drawImage(bitmap, ix + s * 2, iy + s * 3, sq, sq);
    }
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.drawImage(bitmap, ix, iy, sq, sq);
  } else {
    // Fallback: large emoji placeholder
    ctx.font = '280px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${r},${g},${b},0.3)`;
    ctx.fillText('✦', W / 2, IMG_TOP + IMG_ZONE_H / 2 + 80);
    ctx.textAlign = 'left';
  }

  // ── Bottom text block ────────────────────────────────────────────────
  const TEXT_TOP = IMG_TOP + IMG_ZONE_H + 40;
  const textCenter = W / 2;

  // Code (mono, small)
  ctx.fillStyle = `rgba(${r},${g},${b},0.70)`;
  ctx.font = '500 44px monospace';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '8px';
  ctx.fillText(code.toUpperCase(), textCenter, TEXT_TOP + 54);
  ctx.letterSpacing = '0px';

  // Name (large serif)
  ctx.fillStyle = 'rgb(28,22,18)';
  ctx.font = `bold 110px Georgia, "Source Han Serif", serif`;
  ctx.textAlign = 'center';
  ctx.fillText(name, textCenter, TEXT_TOP + 54 + 130);

  // Thin rule
  const ruleY = TEXT_TOP + 54 + 130 + 30;
  ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(textCenter - 120, ruleY);
  ctx.lineTo(textCenter + 120, ruleY);
  ctx.stroke();

  // Tagline (wrapped)
  ctx.fillStyle = 'rgba(60,50,45,0.72)';
  ctx.font = `400 52px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'center';
  const tagLines = wrapText(ctx, tagline, W - PAD * 2 - 80);
  const lineH = 72;
  const tagY = ruleY + 60;
  tagLines.slice(0, 3).forEach((line, idx) => {
    ctx.fillText(line, textCenter, tagY + idx * lineH);
  });

  // WTFTI watermark at bottom
  const wmY = H - PAD - 10;
  ctx.fillStyle = `rgba(${r},${g},${b},0.40)`;
  ctx.font = '500 38px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WTFTI.COM · 全人格图鉴馆', textCenter, wmY);

  // ── Export ───────────────────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob failed'));
    }, 'image/png');
  });
}

/** Offer a Blob as a file download. Falls back to new-tab for mobile Safari. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
