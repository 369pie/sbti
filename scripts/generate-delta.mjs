#!/usr/bin/env node

/**
 * 三角TI 战区宇宙 图生成脚本
 *
 * 用法：
 *   node scripts/generate-delta.mjs --list
 *   node scripts/generate-delta.mjs all --dry-run
 *   node scripts/generate-delta.mjs boss solo rebel sexy shy
 *   node scripts/generate-delta.mjs all
 *   node scripts/generate-delta.mjs all --force
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRunningHubConfig } from './runninghub-config.mjs';
import { DELTA_TYPES, buildDeltaPrompt } from './delta-prompts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/images/types/delta');
const THUMBS_DIR = path.join(OUTPUT_DIR, 'thumbs');
const POLL_INTERVAL = 5000;
const MAX_ATTEMPTS = 120;
const BETWEEN_TASK_DELAY = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function submitTextToImage(config, prompt) {
  const url = `${config.apiBase}/rhart-image-v1-official/text-to-image`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      aspectRatio: '3:4',
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`submit HTTP ${res.status}: ${txt}`);
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
    throw new Error(`query HTTP ${res.status}: ${txt}`);
  }

  return res.json();
}

function getImageUrl(result) {
  const image = result.results?.find((item) => ['png', 'jpg', 'jpeg', 'webp'].includes(item.outputType));
  return image?.url;
}

async function pollUntilDone(config, taskId) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    await sleep(POLL_INTERVAL);
    const result = await queryTask(config, taskId);
    process.stdout.write(`\r  Poll ${attempt + 1}/${MAX_ATTEMPTS}: ${result.status}   `);

    if (result.status === 'SUCCESS') {
      process.stdout.write('\n');
      return result;
    }

    if (result.status === 'FAILED') {
      process.stdout.write('\n');
      throw new Error(result.errorMessage || JSON.stringify(result.failedReason));
    }
  }

  throw new Error(`Polling timeout after ${(POLL_INTERVAL * MAX_ATTEMPTS) / 1000}s`);
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);

  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
  return buf.length;
}

async function generateOne(config, type, force) {
  const outputPath = path.join(OUTPUT_DIR, `${type.slug}.png`);
  if (fs.existsSync(outputPath) && !force) {
    console.log(`\n⏭️  [${type.slug}] 跳过已有文件: ${path.relative(process.cwd(), outputPath)}`);
    return outputPath;
  }

  const prompt = buildDeltaPrompt(type);

  console.log(`\n🎨 [${type.slug}] ${type.heroName}（${type.heroRef}）`);

  const submit = await submitTextToImage(config, prompt);
  if (!submit.taskId) throw new Error(`No taskId: ${JSON.stringify(submit)}`);
  console.log(`   TaskId: ${submit.taskId} | Status: ${submit.status}`);

  const result = await pollUntilDone(config, submit.taskId);
  const imageUrl = getImageUrl(result);
  if (!imageUrl) throw new Error('No image url in result');

  const size = await downloadImage(imageUrl, outputPath);
  console.log(`   ✅ ${path.relative(process.cwd(), outputPath)} (${(size / 1024).toFixed(0)} KB)`);
  return outputPath;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const listMode = args.includes('--list');
  const slugArgs = args.filter((arg) => !arg.startsWith('--'));

  if (listMode) {
    console.log(DELTA_TYPES.map((type) => `${type.slug} (${type.heroName} / ${type.heroRef})`).join('\n'));
    return;
  }

  const selected =
    slugArgs.length === 0 || slugArgs.includes('all')
      ? DELTA_TYPES
      : DELTA_TYPES.filter((type) => slugArgs.includes(type.slug));

  if (selected.length === 0) {
    throw new Error(`No matching slugs. Available: ${DELTA_TYPES.map((type) => type.slug).join(', ')}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(THUMBS_DIR, { recursive: true });

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   三角TI 战区宇宙 图生成器                       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  输出目录: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
  console.log(`  目标数量: ${selected.length}`);

  if (dryRun) {
    console.log('\n--- DRY RUN (no API calls) ---\n');
    selected.forEach((type) => {
      const prompt = buildDeltaPrompt(type);
      console.log(`[${type.slug}] ${type.heroName}（${type.heroRef}）`);
      console.log(`  prompt: ${prompt.slice(0, 220)}...`);
      console.log();
    });
    return;
  }

  const config = getRunningHubConfig();
  if (!config.apiKey) {
    throw new Error('RUNNINGHUB_API_KEY not found');
  }

  const ok = [];
  const failed = [];

  for (let index = 0; index < selected.length; index += 1) {
    const type = selected[index];
    try {
      await generateOne(config, type, force);
      ok.push(type.slug);
    } catch (err) {
      console.error(`   ❌ [${type.slug}] ${err.message}`);
      failed.push({ slug: type.slug, error: err.message });
    }

    if (index < selected.length - 1) {
      await sleep(BETWEEN_TASK_DELAY);
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  ✅ ${ok.length} succeeded: ${ok.join(', ')}`);
  if (failed.length) {
    console.log(`  ❌ ${failed.length} failed:`);
    failed.forEach((entry) => console.log(`     ${entry.slug}: ${entry.error}`));
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err);
  process.exit(1);
});
