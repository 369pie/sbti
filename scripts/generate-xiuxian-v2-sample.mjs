#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRunningHubConfig } from './runninghub-config.mjs';
import {
  XIUXIAN_V2_SEED_PROMPT,
  XIUXIAN_V2_TYPES,
  buildXiuxianV2Prompt,
} from './xiuxian-v2-prompts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/images/types');
const POLL_INTERVAL = 5000;
const MAX_ATTEMPTS = 120;

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
      aspectRatio: '1:1',
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Submit HTTP ${res.status}: ${txt}`);
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
    const status = result.status;
    process.stdout.write(`\r  Poll ${i + 1}/${MAX_ATTEMPTS}: ${status}   `);

    if (status === 'SUCCESS') {
      process.stdout.write('\n');
      return result;
    }

    if (status === 'FAILED') {
      process.stdout.write('\n');
      throw new Error(
        `Task FAILED: ${result.errorMessage || JSON.stringify(result.failedReason)}`,
      );
    }
  }

  throw new Error(`Polling timeout after ${(MAX_ATTEMPTS * POLL_INTERVAL) / 1000}s`);
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download HTTP ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buf);
  return buf.length;
}

function resolveTargetPrompt(target) {
  if (!target || target === 'seed') {
    return {
      label: 'seed',
      prompt: XIUXIAN_V2_SEED_PROMPT,
      outputPath: path.join(OUTPUT_DIR, 'xiuxian-v2-seed.png'),
    };
  }

  const type = XIUXIAN_V2_TYPES.find((entry) => entry.slug === target);
  if (!type) {
    throw new Error(`Unknown slug: ${target}. Available: seed, ${XIUXIAN_V2_TYPES.map((entry) => entry.slug).join(', ')}`);
  }

  return {
    label: type.slug,
    prompt: buildXiuxianV2Prompt(type.concept),
    outputPath: path.join(OUTPUT_DIR, `xiuxian-v2-${type.slug}-sample.png`),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const target = args.find((arg) => !arg.startsWith('--')) || 'seed';
  const resolved = resolveTargetPrompt(target);

  console.log('\n🎨 修仙 2.0 样图生成');
  console.log(`   Target: ${resolved.label}`);
  console.log(`\n📝 Prompt:\n${resolved.prompt}\n`);

  if (dryRun) {
    console.log('🏁 --dry-run mode, skipping API call.');
    return;
  }

  const config = getRunningHubConfig();
  if (!config.apiKey) {
    throw new Error('RUNNINGHUB_API_KEY not set. Add it to .env.local');
  }

  console.log('🚀 Submitting to RunningHub text-to-image...');
  const submitResult = await submitTextToImage(config, resolved.prompt);
  console.log(`   TaskId: ${submitResult.taskId}`);
  console.log(`   Status: ${submitResult.status}`);

  if (submitResult.status === 'FAILED') {
    throw new Error(`Submit failed: ${submitResult.errorMessage}`);
  }

  console.log('⏳ Polling for result...');
  const result = await pollUntilDone(config, submitResult.taskId);
  const imageResult = result.results?.find((entry) => ['png', 'jpg', 'jpeg', 'webp'].includes(entry.outputType));

  if (!imageResult?.url) {
    throw new Error(`No image URL in result: ${JSON.stringify(result.results)}`);
  }

  console.log(`📥 Downloading to ${path.relative(process.cwd(), resolved.outputPath)}...`);
  const size = await downloadImage(imageResult.url, resolved.outputPath);
  console.log(`✅ Done! ${(size / 1024).toFixed(0)} KB saved.`);
}

main().catch((err) => {
  console.error('💥 Fatal error:', err.message || err);
  process.exit(1);
});