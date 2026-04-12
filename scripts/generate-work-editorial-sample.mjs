#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRunningHubConfig } from './runninghub-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(
  __dirname,
  '../public/images/types/work-editorial-sample-boss.png',
);
const SEED_PATH = path.join(
  __dirname,
  '../public/images/types/wtfti/wtfti-classic-seed.png',
);

const POLL_INTERVAL = 3000;
const MAX_ATTEMPTS = 120;

const SAMPLE_PROMPT =
  '扁平杂志插画风人格图鉴角色原画，几何色块人物，2D editorial flat illustration，非3D、非lowpoly。' +
  '角色设定：BOSS 人形指挥部（社畜宇宙版本），高压会议室掌控者。' +
  '画面要求：单人全身，居中构图，3:4 竖版，背景为简洁的办公室平面场景（会议桌、便签、日历图标以极简符号表现），' +
  '人物姿势夸张有压迫感（单手指挥、另一手拿计划板），表情强势。' +
  '服装为现代通勤西装风但卡通化，主色深红+炭黑，辅色米白。' +
  '线条干净，边缘利落，轻微纸张颗粒感，信息图审美，适合小红书封面。' +
  '禁止照片感、禁止3D质感、禁止写实皮肤、禁止复杂光影。' +
  '如果出现文字，只允许中文，不允许英文。';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      aspectRatio: '3:4',
      resolution: '1k',
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
  const image = result.results?.find((item) =>
    ['png', 'jpg', 'jpeg', 'webp'].includes(item.outputType),
  );
  return image?.url;
}

async function pollUntilDone(config, taskId) {
  for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
    await sleep(POLL_INTERVAL);
    const result = await queryTask(config, taskId);
    process.stdout.write(`\rPoll ${i + 1}/${MAX_ATTEMPTS}: ${result.status}   `);

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

async function main() {
  const config = getRunningHubConfig();
  if (!config.apiKey) {
    throw new Error('RUNNINGHUB_API_KEY not found');
  }

  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(`seed not found: ${SEED_PATH}`);
  }

  const seedBuffer = fs.readFileSync(SEED_PATH);
  const dataUri = `data:image/png;base64,${seedBuffer.toString('base64')}`;

  console.log('Generating work editorial style sample...');
  const submit = await submitImageToImage(config, dataUri, SAMPLE_PROMPT);
  console.log(`TaskId: ${submit.taskId} | Status: ${submit.status}`);

  const result = await pollUntilDone(config, submit.taskId);
  const imageUrl = getImageUrl(result);
  if (!imageUrl) throw new Error('No image url in result');

  const size = await downloadImage(imageUrl, OUTPUT_PATH);
  console.log(`Saved ${(size / 1024).toFixed(0)} KB -> ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
