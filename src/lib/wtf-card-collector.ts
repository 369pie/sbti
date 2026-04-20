import { resolvePersonality } from './personality-resolver';
import { getUniverse } from './universes';
import { CARD_UNIVERSE_IDS, type WtfCardData } from './wtf-card';

type PdfFormat = 'a4' | 'letter';
type WallpaperFormat = 'desktop' | 'mobile';

interface RenderLayout {
  width: number;
  height: number;
  fileLabel: string;
  pdfPage?: { width: number; height: number };
}

const PDF_LAYOUTS: Record<PdfFormat, RenderLayout> = {
  a4: {
    width: 2480,
    height: 3508,
    fileLabel: 'a4',
    pdfPage: { width: 595.28, height: 841.89 },
  },
  letter: {
    width: 2550,
    height: 3300,
    fileLabel: 'letter',
    pdfPage: { width: 612, height: 792 },
  },
};

const WALLPAPER_LAYOUTS: Record<WallpaperFormat, RenderLayout> = {
  desktop: {
    width: 2880,
    height: 1800,
    fileLabel: 'desktop',
  },
  mobile: {
    width: 1170,
    height: 2532,
    fileLabel: 'mobile',
  },
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function trimText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function buildUniverseEntries(card: WtfCardData) {
  return CARD_UNIVERSE_IDS
    .map((universeId) => {
      const result = card.results[universeId];
      if (!result?.slug) return null;
      const universe = getUniverse(universeId);
      const resolved = resolvePersonality(universeId, result.slug);
      return {
        universeId,
        shortName: universe?.shortName ?? universeId.toUpperCase(),
        accent: universe?.accent ?? '#C9A676',
        symbol: resolved?.emoji || universe?.emoji || '✦',
        personality: trimText(resolved?.name ?? result.slug, 18),
        testedAt: result.testedAt || '',
      };
    })
    .filter(Boolean) as Array<{
      universeId: string;
      shortName: string;
      accent: string;
      symbol: string;
      personality: string;
      testedAt: string;
    }>;
}

function buildRelationshipEntries(card: WtfCardData) {
  return (card.relationships ?? [])
    .slice(0, 4)
    .map((relationship) => ({
      title: trimText(relationship.partnerNickname || '匿名搭子', 12),
      slug: trimText(relationship.slug, 12),
      compatibility: Math.max(0, Math.min(100, relationship.compatibility)),
    }));
}

function buildCollectorSvg(card: WtfCardData, editionNo: string, layout: RenderLayout): string {
  const { width, height } = layout;
  const portrait = height >= width;
  const paddingX = portrait ? 170 : 160;
  const headerTop = portrait ? 170 : 130;
  const nicknameSize = portrait ? 104 : 88;
  const titleSize = portrait ? 34 : 28;
  const metaSize = portrait ? 28 : 24;
  const statsTop = portrait ? 540 : 430;
  const statsHeight = portrait ? 170 : 140;
  const statsGap = 28;
  const statsWidth = (width - paddingX * 2 - statsGap * 2) / 3;
  const gridTop = portrait ? 790 : 640;
  const gridCols = portrait ? 2 : 3;
  const gridGap = portrait ? 32 : 26;
  const gridWidth = width - paddingX * 2;
  const cardWidth = (gridWidth - gridGap * (gridCols - 1)) / gridCols;
  const cardHeight = portrait ? 178 : 150;
  const entries = buildUniverseEntries(card);
  const relationships = buildRelationshipEntries(card);
  const gridMarkup = entries
    .map((entry, index) => {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      const x = paddingX + col * (cardWidth + gridGap);
      const y = gridTop + row * (cardHeight + gridGap);
      const personality = escapeXml(entry.personality);
      const shortName = escapeXml(entry.shortName);
      const symbol = escapeXml(entry.symbol);
      const testedAt = entry.testedAt ? escapeXml(entry.testedAt) : '—';
      return `
        <g>
          <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="28" fill="rgba(255,250,241,0.06)" stroke="rgba(201,166,118,0.26)" stroke-width="2" />
          <text x="${x + 38}" y="${y + 70}" font-size="42" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${symbol}</text>
          <text x="${x + 100}" y="${y + 58}" fill="${entry.accent}" font-size="20" letter-spacing="5" font-family="'SF Mono',ui-monospace,monospace">${shortName}</text>
          <text x="${x + 100}" y="${y + 102}" fill="#F5F0E8" font-size="34" font-family="'Noto Serif SC','PingFang SC',serif">${personality}</text>
          <text x="${x + 100}" y="${y + 142}" fill="rgba(245,240,232,0.54)" font-size="18" letter-spacing="3" font-family="'SF Mono',ui-monospace,monospace">TESTED ${testedAt}</text>
        </g>`;
    })
    .join('');

  const footerTop = portrait
    ? gridTop + Math.max(1, Math.ceil(Math.max(entries.length, 1) / gridCols)) * (cardHeight + gridGap) + 50
    : height - 270;
  const relationshipMarkup = relationships.length > 0
    ? relationships
        .map((relationship, index) => {
          const y = footerTop + 76 + index * 44;
          return `
            <text x="${paddingX + 22}" y="${y}" fill="#F5F0E8" font-size="24" font-family="'Noto Serif SC','PingFang SC',serif">${escapeXml(relationship.title)}</text>
            <text x="${paddingX + 250}" y="${y}" fill="rgba(245,240,232,0.5)" font-size="18" letter-spacing="3" font-family="'SF Mono',ui-monospace,monospace">${escapeXml(relationship.slug.toUpperCase())}</text>
            <text x="${width - paddingX - 12}" y="${y}" text-anchor="end" fill="#C9A676" font-size="24" font-family="'SF Mono',ui-monospace,monospace">${relationship.compatibility}/100</text>`;
        })
        .join('')
    : `
      <text x="${paddingX + 22}" y="${footerTop + 98}" fill="rgba(245,240,232,0.6)" font-size="22" font-family="'Noto Serif SC','PingFang SC',serif">还没有记录关系卡，先把下一张人与人之间的化学反应点亮吧。</text>`;

  const relationshipTitle = relationships.length > 0 ? 'RELATION ARCHIVE' : 'NEXT UNLOCK';
  const nickname = escapeXml(trimText(card.nickname?.trim() || `Traveler ${card.id.toUpperCase()}`, 22));
  const createdAt = escapeXml(card.createdAt || '—');
  const litCount = entries.length;
  const relationshipCount = card.relationships?.length ?? 0;
  const pinnedCount = card.pinnedUniverses?.length ?? 0;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
      <defs>
        <linearGradient id="collector-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1A1530" />
          <stop offset="58%" stop-color="#231A3D" />
          <stop offset="100%" stop-color="#130F24" />
        </linearGradient>
        <radialGradient id="collector-rose" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.26} ${height * 0.16}) rotate(90) scale(${height * 0.28} ${width * 0.24})">
          <stop offset="0%" stop-color="rgba(192,122,142,0.28)" />
          <stop offset="100%" stop-color="rgba(192,122,142,0)" />
        </radialGradient>
        <radialGradient id="collector-gold" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.82} ${height * 0.85}) rotate(90) scale(${height * 0.24} ${width * 0.2})">
          <stop offset="0%" stop-color="rgba(201,166,118,0.22)" />
          <stop offset="100%" stop-color="rgba(201,166,118,0)" />
        </radialGradient>
        <linearGradient id="collector-foil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8B6A3A" />
          <stop offset="45%" stop-color="#F4DDA0" />
          <stop offset="100%" stop-color="#9C7B47" />
        </linearGradient>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#collector-bg)" />
      <rect width="${width}" height="${height}" fill="url(#collector-rose)" />
      <rect width="${width}" height="${height}" fill="url(#collector-gold)" />

      <text x="${paddingX}" y="${headerTop}" fill="#C9A676" font-size="${titleSize}" letter-spacing="12" font-family="'SF Mono',ui-monospace,monospace">WTF CARD · COLLECTOR EDITION</text>
      <text x="${paddingX}" y="${headerTop + 130}" fill="#F5F0E8" font-size="${nicknameSize}" font-style="italic" font-family="'Cormorant Garamond','Noto Serif SC',serif">${nickname}</text>
      <text x="${paddingX}" y="${headerTop + 196}" fill="rgba(245,240,232,0.58)" font-size="${metaSize}" letter-spacing="6" font-family="'SF Mono',ui-monospace,monospace">CARD #${escapeXml(card.id.toUpperCase())} · ISSUED ${createdAt}</text>

      <rect x="${width - paddingX - 520}" y="${headerTop + 30}" width="520" height="92" rx="46" fill="rgba(255,250,241,0.06)" stroke="rgba(201,166,118,0.38)" stroke-width="2" />
      <circle cx="${width - paddingX - 474}" cy="${headerTop + 76}" r="10" fill="#C9A676" />
      <text x="${width - paddingX - 440}" y="${headerTop + 86}" fill="url(#collector-foil)" font-size="26" letter-spacing="7" font-family="'SF Mono',ui-monospace,monospace">EDITION №${editionNo} / 9999</text>

      <g>
        <rect x="${paddingX}" y="${statsTop}" width="${statsWidth}" height="${statsHeight}" rx="26" fill="rgba(255,250,241,0.05)" stroke="rgba(201,166,118,0.2)" stroke-width="2" />
        <text x="${paddingX + 32}" y="${statsTop + 58}" fill="rgba(245,240,232,0.48)" font-size="20" letter-spacing="5" font-family="'SF Mono',ui-monospace,monospace">LIT UNIVERSES</text>
        <text x="${paddingX + 32}" y="${statsTop + 132}" fill="#F5F0E8" font-size="72" font-family="'Cormorant Garamond','Noto Serif SC',serif">${litCount}</text>
      </g>
      <g>
        <rect x="${paddingX + statsWidth + statsGap}" y="${statsTop}" width="${statsWidth}" height="${statsHeight}" rx="26" fill="rgba(255,250,241,0.05)" stroke="rgba(201,166,118,0.2)" stroke-width="2" />
        <text x="${paddingX + statsWidth + statsGap + 32}" y="${statsTop + 58}" fill="rgba(245,240,232,0.48)" font-size="20" letter-spacing="5" font-family="'SF Mono',ui-monospace,monospace">RELATIONSHIPS</text>
        <text x="${paddingX + statsWidth + statsGap + 32}" y="${statsTop + 132}" fill="#F5F0E8" font-size="72" font-family="'Cormorant Garamond','Noto Serif SC',serif">${relationshipCount}</text>
      </g>
      <g>
        <rect x="${paddingX + (statsWidth + statsGap) * 2}" y="${statsTop}" width="${statsWidth}" height="${statsHeight}" rx="26" fill="rgba(255,250,241,0.05)" stroke="rgba(201,166,118,0.2)" stroke-width="2" />
        <text x="${paddingX + (statsWidth + statsGap) * 2 + 32}" y="${statsTop + 58}" fill="rgba(245,240,232,0.48)" font-size="20" letter-spacing="5" font-family="'SF Mono',ui-monospace,monospace">PINNED DISPLAY</text>
        <text x="${paddingX + (statsWidth + statsGap) * 2 + 32}" y="${statsTop + 132}" fill="#F5F0E8" font-size="72" font-family="'Cormorant Garamond','Noto Serif SC',serif">${pinnedCount}</text>
      </g>

      <text x="${paddingX}" y="${gridTop - 36}" fill="#C9A676" font-size="24" letter-spacing="7" font-family="'SF Mono',ui-monospace,monospace">MULTIVERSE ARCHIVE</text>
      ${gridMarkup}

      <rect x="${paddingX}" y="${footerTop}" width="${width - paddingX * 2}" height="${height - footerTop - (portrait ? 120 : 90)}" rx="30" fill="rgba(255,250,241,0.045)" stroke="rgba(201,166,118,0.22)" stroke-width="2" />
      <text x="${paddingX + 22}" y="${footerTop + 42}" fill="#C9A676" font-size="22" letter-spacing="6" font-family="'SF Mono',ui-monospace,monospace">${relationshipTitle}</text>
      ${relationshipMarkup}
    </svg>`;
}

async function rasterizeSvg(svg: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法初始化导出画布'));
        return;
      }

      ctx.fillStyle = '#1A1530';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('导出图片失败'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('渲染收藏版失败'));
    };

    image.src = url;
  });
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadCollectorPdf(
  card: WtfCardData,
  editionNo: string,
  format: PdfFormat,
) {
  const layout = PDF_LAYOUTS[format];
  const svg = buildCollectorSvg(card, editionNo, layout);
  const pngBlob = await rasterizeSvg(svg, layout.width, layout.height);
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const { PDFDocument } = await import('pdf-lib');

  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(pngBytes);
  const page = pdf.addPage([layout.pdfPage!.width, layout.pdfPage!.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: layout.pdfPage!.width,
    height: layout.pdfPage!.height,
  });

  const bytes = await pdf.save();
  const pdfBuffer = Uint8Array.from(bytes).buffer;
  triggerDownload(
    new Blob([pdfBuffer], { type: 'application/pdf' }),
    `wtfcard-collector-${card.id}-${layout.fileLabel}.pdf`,
  );
}

export async function downloadCollectorWallpaper(
  card: WtfCardData,
  editionNo: string,
  format: WallpaperFormat,
) {
  const layout = WALLPAPER_LAYOUTS[format];
  const svg = buildCollectorSvg(card, editionNo, layout);
  const pngBlob = await rasterizeSvg(svg, layout.width, layout.height);
  triggerDownload(pngBlob, `wtfcard-collector-${card.id}-${layout.fileLabel}.png`);
}