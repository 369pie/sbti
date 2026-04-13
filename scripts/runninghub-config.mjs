import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

let envLoaded = false;

function parseEnvValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = parseEnvValue(line.slice(separatorIndex + 1));

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function loadLocalEnv() {
  if (envLoaded) {
    return;
  }

  loadEnvFile(path.join(ROOT_DIR, '.env'));
  loadEnvFile(path.join(ROOT_DIR, '.env.local'));

  envLoaded = true;
}

export function getRunningHubConfig() {
  loadLocalEnv();

  return {
    apiKey: process.env.RUNNINGHUB_API_KEY,
    apiBase: process.env.RUNNINGHUB_API_BASE || 'https://www.runninghub.cn/openapi/v2',
    editEndpoint:
      process.env.RUNNINGHUB_EDIT_ENDPOINT || '/rhart-image-v1-official/edit',
    text2imgEndpoint:
      process.env.RUNNINGHUB_TEXT2IMG_ENDPOINT || '/rhart-image-n-g31-flash-official/text-to-image',
    text2imgResolution: process.env.RUNNINGHUB_TEXT2IMG_RESOLUTION || '2k',
    aspectRatio: process.env.RUNNINGHUB_ASPECT_RATIO || 'auto',
  };
}