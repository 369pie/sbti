import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.join(process.cwd(), 'public/images/types');
const OUTPUT_DIR = path.join(SOURCE_DIR, 'thumbs');
const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);
const THUMBNAIL_SIZE = 384;
const THUMBNAIL_QUALITY = 80;

async function listSourceImages() {
  const entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .map((name) => path.join(SOURCE_DIR, name));
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
  const outputPath = path.join(OUTPUT_DIR, outputName);

  if (!(await shouldRegenerate(sourcePath, outputPath))) {
    return false;
  }

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