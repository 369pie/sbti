import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.join(process.cwd(), 'public/images/types');
const OUTPUT_DIR = path.join(SOURCE_DIR, 'thumbs');
const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);
const THUMBNAIL_SIZE = 384;
const THUMBNAIL_QUALITY = 80;

async function listSourceImages(directory = SOURCE_DIR) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const sourceImages = [];

  for (const entry of entries) {
    if (entry.name === 'thumbs') {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      sourceImages.push(...await listSourceImages(fullPath));
      continue;
    }

    if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      sourceImages.push(fullPath);
    }
  }

  return sourceImages;
}

async function shouldRegenerate(sourcePath, outputPath) {
  try {
    const [sourceStat, outputStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(outputPath),
    ]);

    return sourceStat.mtimeMs > outputStat.mtimeMs;
  } catch {
    return true;
  }
}

async function generateThumbnail(sourcePath) {
  const outputName = `${path.parse(sourcePath).name}.webp`;
  const relativeDir = path.relative(SOURCE_DIR, path.dirname(sourcePath));
  const outputDir = relativeDir ? path.join(SOURCE_DIR, relativeDir, 'thumbs') : OUTPUT_DIR;
  const outputPath = path.join(outputDir, outputName);

  if (!(await shouldRegenerate(sourcePath, outputPath))) {
    return false;
  }

  await fs.mkdir(outputDir, { recursive: true });

  await sharp(sourcePath)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: THUMBNAIL_QUALITY,
      alphaQuality: THUMBNAIL_QUALITY,
      effort: 4,
    })
    .toFile(outputPath);

  return true;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const sourceImages = await listSourceImages();
  let generated = 0;
  let skipped = 0;

  for (const sourcePath of sourceImages) {
    const created = await generateThumbnail(sourcePath);

    if (created) {
      generated += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`Gallery thumbnails ready: ${generated} generated, ${skipped} up to date.`);
}

main().catch((error) => {
  console.error('Failed to generate gallery thumbnails.', error);
  process.exitCode = 1;
});