import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { getRunningHubConfig } from './runninghub-config.mjs';
import { buildSbtiImagePrompt, buildUniverseCardPrompt } from './runninghub-prompts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_CONFIG_DIR = path.join(__dirname, 'image-generation/modules');
const DEFAULT_TYPES_DIR = path.join(__dirname, '../public/images/types');
const DEFAULT_POLL_INTERVAL = 5000;
const DEFAULT_MAX_ATTEMPTS = 120;
const DEFAULT_BETWEEN_TASK_DELAY = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listGeneratorModules() {
  return fs
    .readdirSync(MODULE_CONFIG_DIR)
    .filter((fileName) => fileName.endsWith('.mjs'))
    .map((fileName) => fileName.replace(/\.mjs$/, ''))
    .sort();
}

async function loadModuleConfig(moduleKey) {
  const filePath = path.join(MODULE_CONFIG_DIR, `${moduleKey}.mjs`);

  if (!fs.existsSync(filePath)) {
    const available = await listGeneratorModules();
    throw new Error(
      `Unknown image module "${moduleKey}". Available modules: ${available.join(', ')}`,
    );
  }

  const imported = await import(pathToFileURL(filePath).href);
  const config = imported.default;

  if (!config) {
    throw new Error(`Module config "${moduleKey}" must default export a config object.`);
  }

  validateModuleConfig(moduleKey, config);
  return config;
}

function validateModuleConfig(moduleKey, config) {
  const requiredStrings = ['displayName', 'seriesLabel', 'outputPrefix', 'seriesTone'];

  for (const key of requiredStrings) {
    if (typeof config[key] !== 'string' || !config[key].trim()) {
      throw new Error(`Module "${moduleKey}" is missing required string field: ${key}`);
    }
  }

  if (!Array.isArray(config.types) || config.types.length === 0) {
    throw new Error(`Module "${moduleKey}" must provide a non-empty types array.`);
  }

  for (const type of config.types) {
    if (typeof type.slug !== 'string' || !type.slug.trim()) {
      throw new Error(`Module "${moduleKey}" has a type with missing slug.`);
    }

    if (!config.text2imgMode && (typeof type.ref !== 'string' || !type.ref.trim())) {
      throw new Error(`Module "${moduleKey}" type "${type.slug}" is missing ref.`);
    }

    if (
      (typeof type.concept !== 'string' || !type.concept.trim()) &&
      (typeof type.prompt !== 'string' || !type.prompt.trim())
    ) {
      throw new Error(
        `Module "${moduleKey}" type "${type.slug}" must provide concept or prompt.`,
      );
    }
  }
}

function getTypesDir(config) {
  return config.typesDir ? path.resolve(__dirname, config.typesDir) : DEFAULT_TYPES_DIR;
}

function buildTypePrompt(config, type) {
  if (type.prompt) {
    return type.prompt;
  }

  // Card mode: 图鉴卡面模式 — bake text into image
  if (config.cardMode && type.card) {
    return buildUniverseCardPrompt({
      seriesLabel: config.seriesLabel,
      artStyle: config.artStyle,
      seriesTone: config.seriesTone,
      concept: type.concept,
      card: type.card,
      themeColor: config.themeColor,
    });
  }

  return buildSbtiImagePrompt({
    seriesLabel: config.seriesLabel,
    seriesTone: config.seriesTone,
    concept: type.concept,
    extraNotes: type.extraNotes,
    artStyle: config.artStyle,
  });
}

function buildOutputPath(config, type) {
  if (config.outputSubdir) {
    return path.join(getTypesDir(config), config.outputSubdir, `${type.slug}.png`);
  }
  const suffix = config.cardMode ? '-card' : '';
  return path.join(getTypesDir(config), `${config.outputPrefix}${suffix}-${type.slug}.png`);
}

function buildReferencePath(config, type) {
  return path.join(getTypesDir(config), type.ref);
}

async function submitTask(runtimeConfig, imageBase64DataUri, prompt) {
  const res = await fetch(`${runtimeConfig.apiBase}${runtimeConfig.editEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${runtimeConfig.apiKey}`,
    },
    body: JSON.stringify({
      imageUrls: [imageBase64DataUri],
      prompt,
      aspectRatio: runtimeConfig.aspectRatio,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Submit HTTP ${res.status}: ${txt}`);
  }

  return res.json();
}

async function submitTextToImageTask(runtimeConfig, prompt, aspectRatio) {
  const endpoint = runtimeConfig.text2imgEndpoint || '/rhart-image-n-g31-flash-official/text-to-image';
  const res = await fetch(`${runtimeConfig.apiBase}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${runtimeConfig.apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      aspectRatio: aspectRatio || runtimeConfig.aspectRatio,
      resolution: runtimeConfig.text2imgResolution || '2k',
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Submit text2img HTTP ${res.status}: ${txt}`);
  }

  return res.json();
}

async function queryTask(runtimeConfig, taskId) {
  const res = await fetch(`${runtimeConfig.apiBase}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${runtimeConfig.apiKey}`,
    },
    body: JSON.stringify({ taskId }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Query HTTP ${res.status}: ${txt}`);
  }

  return res.json();
}

async function pollUntilDone(runtimeConfig, taskId, maxAttempts = DEFAULT_MAX_ATTEMPTS) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(DEFAULT_POLL_INTERVAL);
    const result = await queryTask(runtimeConfig, taskId);
    const status = result.status;
    process.stdout.write(`\r  Poll ${i + 1}/${maxAttempts}: ${status}   `);

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

  throw new Error(`Polling timeout after ${(maxAttempts * DEFAULT_POLL_INTERVAL) / 1000}s`);
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download HTTP ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buf);
  return buf.length;
}

async function generateOne(config, runtimeConfig, type, options) {
  const outPath = buildOutputPath(config, type);
  if (fs.existsSync(outPath) && !options.force) {
    console.log(`\n⏭️  [${type.slug}] Skipped existing file: ${path.basename(outPath)}`);
    return outPath;
  }

  const prompt = buildTypePrompt(config, type);
  const useText2Img = config.text2imgMode || (config.cardMode && type.card);

  let submit;

  if (useText2Img) {
    // Card mode: 文生图，不需要参考图
    console.log(`\n🎨 [${type.slug}] Submitting text2img...`);
    submit = await submitTextToImageTask(runtimeConfig, prompt, runtimeConfig.aspectRatio);
  } else {
    // Normal mode: 图生图，需要参考图
    const refPath = buildReferencePath(config, type);
    if (!fs.existsSync(refPath)) {
      throw new Error(`Reference image not found: ${refPath}`);
    }
    const refBuf = fs.readFileSync(refPath);
    const ext = path.extname(type.ref).slice(1).toLowerCase();
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    const dataUri = `data:${mime};base64,${refBuf.toString('base64')}`;

    console.log(
      `\n🎨 [${type.slug}] Submitting img2img (ref: ${type.ref}, ${(refBuf.length / 1024).toFixed(0)}KB)...`,
    );
    submit = await submitTask(runtimeConfig, dataUri, prompt);
  }

  if (!submit.taskId) {
    throw new Error(`No taskId: ${JSON.stringify(submit)}`);
  }

  console.log(`  TaskId: ${submit.taskId} | Initial: ${submit.status}`);
  console.log('  Waiting for completion...');

  const result = await pollUntilDone(runtimeConfig, submit.taskId);

  if (!result.results?.length) {
    throw new Error('Task succeeded but no results returned');
  }

  const imageUrl = result.results[0].url;
  console.log('  Downloading result...');
  const bytes = await downloadImage(imageUrl, outPath);
  console.log(`  ✅ Saved: ${path.basename(outPath)} (${(bytes / 1024).toFixed(0)}KB)`);

  return outPath;
}

function printModuleHeader(config, runtimeConfig, selectedCount, options) {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log(`║   ${config.displayName.padEnd(42, ' ')}║`);
  console.log('╚══════════════════════════════════════════════════╝');
  if (config.text2imgMode || config.cardMode) {
    console.log(`  Endpoint: text2img (${runtimeConfig.text2imgEndpoint || '/rhart-image-n-g31-flash-official/text-to-image'})`);
  } else {
    console.log(`  Endpoint: img2img (${runtimeConfig.editEndpoint})`);
  }
  console.log(`  Series: ${config.seriesLabel}`);
  console.log(`  Types: ${selectedCount} | Aspect Ratio: ${runtimeConfig.aspectRatio}${config.cardMode ? ' | 📇 Card Mode' : ''}${config.text2imgMode ? ' | 🖼️ Text2Img' : ''}`);
  console.log(`  Output: public/images/types/${config.outputSubdir ? config.outputSubdir + '/' : config.outputPrefix + (config.cardMode ? '-card' : '') + '-'}{slug}.png`);
  if (options.force) {
    console.log('  Mode: force overwrite existing files');
  }
}

export async function printModuleTypes(moduleKey) {
  const config = await loadModuleConfig(moduleKey);
  console.log(`${moduleKey}: ${config.seriesLabel}`);
  console.log(config.types.map((type) => type.slug).join(', '));
}

export async function runImageGeneratorCli({ moduleKey, args = [] }) {
  const config = await loadModuleConfig(moduleKey);
  const runtimeConfig = getRunningHubConfig();
  if (config.aspectRatio) runtimeConfig.aspectRatio = config.aspectRatio;
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const listTypes = args.includes('--list-types');
  const slugArgs = args.filter((arg) => !arg.startsWith('--'));

  if (listTypes) {
    console.log(config.types.map((type) => type.slug).join(', '));
    return;
  }

  const selected =
    slugArgs.length > 0
      ? config.types.filter((type) => slugArgs.includes(type.slug))
      : config.types;

  if (selected.length === 0) {
    throw new Error(
      `No matching slugs found for module "${moduleKey}". Available: ${config.types
        .map((type) => type.slug)
        .join(', ')}`,
    );
  }

  if (!dryRun && !runtimeConfig.apiKey) {
    throw new Error('Missing RUNNINGHUB_API_KEY');
  }

  printModuleHeader(config, runtimeConfig, selected.length, { force });

  if (dryRun) {
    console.log('\n--- DRY RUN (no API calls) ---\n');
    for (const type of selected) {
      const prompt = buildTypePrompt(config, type);
      console.log(`[${type.slug}] ref=${type.ref}`);
      console.log(`  prompt: ${prompt.slice(0, 160)}...`);
    }
    return;
  }

  const ok = [];
  const errs = [];

  for (let i = 0; i < selected.length; i++) {
    const type = selected[i];

    try {
      await generateOne(config, runtimeConfig, type, { force });
      ok.push(type.slug);
    } catch (err) {
      console.error(`  ❌ [${type.slug}] ${err.message}`);
      errs.push({ slug: type.slug, err: err.message });
    }

    if (i < selected.length - 1) {
      await sleep(DEFAULT_BETWEEN_TASK_DELAY);
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  ✅ ${ok.length} succeeded: ${ok.join(', ')}`);
  if (errs.length) {
    console.log(`  ❌ ${errs.length} failed:`);
    errs.forEach((entry) => console.log(`     ${entry.slug}: ${entry.err}`));
  }
}
