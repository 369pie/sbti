#!/usr/bin/env node

/**
 * WTFTI 经典宇宙 · 图鉴图生成脚本
 *
 * 用法：
 *   node scripts/generate-wtfti-classic.mjs                # 生成 seed 种子图
 *   node scripts/generate-wtfti-classic.mjs seed            # 同上
 *   node scripts/generate-wtfti-classic.mjs boss            # 生成指定人格
 *   node scripts/generate-wtfti-classic.mjs all             # 批量生成全部 29 张（需要先有 seed 图）
 *   node scripts/generate-wtfti-classic.mjs all --force     # 强制重新生成（覆盖已有文件）
 *   node scripts/generate-wtfti-classic.mjs --dry-run       # 仅输出 prompt 不调 API
 *   node scripts/generate-wtfti-classic.mjs --list          # 列出所有可用 slug
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRunningHubConfig } from './runninghub-config.mjs';
import {
  WTFTI_CLASSIC_TYPES,
  buildWtftiClassicPrompt,
} from './wtfti-classic-prompts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/images/types/wtfti');
const THUMBS_DIR = path.join(OUTPUT_DIR, 'thumbs');
const POLL_INTERVAL = 5000;
const MAX_ATTEMPTS = 120;
const BETWEEN_TASK_DELAY = 3000;

const SEED_PROMPT =
  '3D render style, neutral blank chibi vinyl toy base figure, premium designer collectible quality, matte vinyl finish, ' +
  '2.3 head body ratio, large round head, compact short limbs, clean toy anatomy, centered full body on pure white background, ' +
  'clean studio product shot, soft diffused lighting, very simple neutral expression, relaxed neutral standing pose, ' +
  'simple plain base outfit with no strong identity: plain fitted top, plain shorts, simple shoes, minimal accessories, ' +
  'short simple black bob haircut, no floating props, no strong story elements, no dramatic costume cues, no exaggerated theme, ' +
  'the purpose is a neutral collectible base for later transformation, high quality toy rendering, clean silhouette, highly editable base reference. ' +
  '3D渲染风格，中性空白Q版潮玩基础手办，高级收藏玩具质感，哑光乙烯材质，2.3头身，大圆头小短手脚，干净手办比例，纯白背景居中全身棚拍，' +
  '柔和漫射光，非常简单中性的表情，轻松自然站姿，服装尽量基础无识别度：纯色上衣、纯色短裤、简单鞋子、极少配饰，黑色短波波头，' +
  '不要漂浮道具，不要强叙事元素，不要夸张主题服装，这是一张后续大幅改造的基础手办参考图，要求手办质感高级、轮廓清晰、易于后续变形。';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── RunningHub API ───

async function submitTextToImage(config, prompt) {
  const url = `${config.apiBase}/rhart-image-v1-official/text-to-image`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ prompt, aspectRatio: '1:1' }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`txt2img submit HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function submitImageToImage(config, imageBase64DataUri, prompt) {
  const url = `${config.apiBase}/rhart-image-n-g31-flash-official/image-to-image`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      imageUrls: [imageBase64DataUri],
      prompt,
      aspectRatio: '1:1',
      resolution: '1k',
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`img2img submit HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function queryTask(config, taskId) {
  const url = `${config.apiBase}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({ taskId }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Query HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function pollUntilDone(config, taskId) {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await sleep(POLL_INTERVAL);
    const result = await queryTask(config, taskId);
    process.stdout.write(`\r  Poll ${i + 1}/${MAX_ATTEMPTS}: ${result.status}   `);
    if (result.status === 'SUCCESS') {
      process.stdout.write('\n');
      return result;
    }
    if (result.status === 'FAILED') {
      process.stdout.write('\n');
      throw new Error(`Task FAILED: ${result.errorMessage || JSON.stringify(result.failedReason)}`);
    }
  }
  throw new Error(`Polling timeout after ${(MAX_ATTEMPTS * POLL_INTERVAL) / 1000}s`);
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
  return buf.length;
}

function getImageUrl(result) {
  const img = result.results?.find((r) =>
    ['png', 'jpg', 'jpeg', 'webp'].includes(r.outputType),
  );
  return img?.url;
}

// ─── Seed 生成（txt2img）───

async function generateSeed(config, dryRun) {
  const outputPath = path.join(OUTPUT_DIR, 'wtfti-classic-seed.png');

  console.log('\n🌱 WTFTI 种子图生成');
  console.log(`📝 Prompt:\n${SEED_PROMPT}\n`);

  if (dryRun) {
    console.log('🏁 --dry-run mode, skipping API call.');
    return;
  }

  if (fs.existsSync(outputPath)) {
    console.log(`⚠️  种子图已存在: ${path.relative(process.cwd(), outputPath)}`);
    console.log('   如果需要重新生成，请先手动删除该文件。');
    return;
  }

  console.log('🚀 Submitting to RunningHub text-to-image...');
  const submit = await submitTextToImage(config, SEED_PROMPT);
  console.log(`   TaskId: ${submit.taskId} | Status: ${submit.status}`);

  if (submit.status === 'FAILED') {
    throw new Error(`Submit failed: ${submit.errorMessage}`);
  }

  console.log('⏳ Polling for result...');
  const result = await pollUntilDone(config, submit.taskId);
  const imageUrl = getImageUrl(result);
  if (!imageUrl) throw new Error(`No image URL in result: ${JSON.stringify(result.results)}`);

  console.log(`📥 Downloading...`);
  const size = await downloadImage(imageUrl, outputPath);
  console.log(`✅ 种子图已保存！${(size / 1024).toFixed(0)} KB → ${path.relative(process.cwd(), outputPath)}`);
}

// ─── 单张人格图生成（img2img）───

async function generateOne(config, type, force) {
  const seedPath = path.join(OUTPUT_DIR, 'wtfti-classic-seed.png');
  if (!fs.existsSync(seedPath)) {
    throw new Error(`种子图不存在: ${seedPath}\n请先运行: node scripts/generate-wtfti-classic.mjs seed`);
  }

  const outputPath = path.join(OUTPUT_DIR, `${type.slug}.png`);
  if (fs.existsSync(outputPath) && !force) {
    console.log(`\n⏭️  [${type.slug}] 跳过已有文件: ${path.basename(outputPath)}`);
    return outputPath;
  }

  const prompt = buildWtftiClassicPrompt(type.concept);
  const refBuf = fs.readFileSync(seedPath);
  const dataUri = `data:image/png;base64,${refBuf.toString('base64')}`;

  console.log(`\n🎨 [${type.slug}] ${type.wtftiName} (${type.code})`);

  const submit = await submitImageToImage(config, dataUri, prompt);
  if (!submit.taskId) throw new Error(`No taskId: ${JSON.stringify(submit)}`);
  console.log(`   TaskId: ${submit.taskId} | Status: ${submit.status}`);

  const result = await pollUntilDone(config, submit.taskId);
  const imageUrl = getImageUrl(result);
  if (!imageUrl) throw new Error(`No image URL in result`);

  const size = await downloadImage(imageUrl, outputPath);
  console.log(`   ✅ ${path.basename(outputPath)} (${(size / 1024).toFixed(0)} KB)`);
  return outputPath;
}

// ─── Main ───

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const listMode = args.includes('--list');
  const target = args.find((a) => !a.startsWith('--')) || 'seed';

  // 确保目录存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(THUMBS_DIR, { recursive: true });

  if (listMode) {
    console.log('可用人格 slug：');
    console.log(WTFTI_CLASSIC_TYPES.map((t) => `  ${t.slug.padEnd(12)} ${t.code.padEnd(8)} ${t.wtftiName}`).join('\n'));
    console.log(`\n共 ${WTFTI_CLASSIC_TYPES.length} 个`);
    return;
  }

  const config = getRunningHubConfig();
  if (!dryRun && !config.apiKey) {
    throw new Error('RUNNINGHUB_API_KEY not set. Add it to .env.local');
  }

  // Seed
  if (target === 'seed') {
    await generateSeed(config, dryRun);
    return;
  }

  // All
  if (target === 'all') {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   WTFTI 经典宇宙 v2 · 批量生成 29 张图鉴图        ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log(`  共 ${WTFTI_CLASSIC_TYPES.length} 个人格`);
    console.log(`  输出: public/images/types/wtfti-v2/{slug}.png`);
    if (force) console.log('  模式: 强制覆盖');
    if (dryRun) {
      console.log('\n📝 将要生成的 prompt：');
      for (const type of WTFTI_CLASSIC_TYPES) {
        console.log(`\n--- [${type.slug}] ${type.wtftiName} ---`);
        console.log(buildWtftiClassicPrompt(type.concept));
      }
      console.log('\n🏁 --dry-run mode, done.');
      return;
    }

    let done = 0;
    let skipped = 0;
    let failed = 0;

    for (const type of WTFTI_CLASSIC_TYPES) {
      try {
        const result = await generateOne(config, type, force);
        if (result) done++;
        else skipped++;
      } catch (err) {
        console.error(`\n❌ [${type.slug}] 失败: ${err.message}`);
        failed++;
      }
      // 任务间缓冲
      if (WTFTI_CLASSIC_TYPES.indexOf(type) < WTFTI_CLASSIC_TYPES.length - 1) {
        await sleep(BETWEEN_TASK_DELAY);
      }
    }

    console.log(`\n🏁 完成！成功: ${done}, 跳过: ${skipped}, 失败: ${failed}`);
    return;
  }

  // 单个人格
  const type = WTFTI_CLASSIC_TYPES.find((t) => t.slug === target);
  if (!type) {
    console.error(`❌ 未知 slug: ${target}`);
    console.error(`   可用: seed, all, ${WTFTI_CLASSIC_TYPES.map((t) => t.slug).join(', ')}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`\n📝 [${type.slug}] ${type.wtftiName} prompt:`);
    console.log(buildWtftiClassicPrompt(type.concept));
    console.log('\n🏁 --dry-run mode, done.');
    return;
  }

  await generateOne(config, type, force);
}

main().catch((err) => {
  console.error('💥 Fatal error:', err.message || err);
  process.exit(1);
});
