#!/usr/bin/env node
/**
 * Generate daily status type images using RunningHub official img2img API.
 *
 * Same pipeline as generate-work-images.mjs but for the 12 daily status types.
 *
 * Usage:
 *   node scripts/generate-daily-images.mjs                        # generate all 12
 *   node scripts/generate-daily-images.mjs zombie butterfly       # specific slugs
 *   node scripts/generate-daily-images.mjs --dry-run              # preview prompts
 *   node scripts/generate-daily-images.mjs --force                # overwrite existing
 *
 * Env:
 *   RUNNINGHUB_API_KEY  (required)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.RUNNINGHUB_API_KEY;
const API_BASE = 'https://www.runninghub.cn/openapi/v2';
const EDIT_ENDPOINT = process.env.RUNNINGHUB_EDIT_ENDPOINT || '/rhart-image-v1-official/edit';
const ASPECT_RATIO = process.env.RUNNINGHUB_ASPECT_RATIO || 'auto';
const TYPES_DIR = path.join(__dirname, '../public/images/types');

// ── Style prefix ──────────────────────────────────────────────────────────────
// Must match the original SBTI low-poly paper craft style exactly.
const STYLE =
  '严格保留参考图的简洁低多边形纸艺插画风格(low-poly paper craft illustration)，保留方块头、圆眼睛、短四肢、呆萌比例。' +
  '不要照片感，不要高精度3D建模感，不要电影级光影，不要真实皮肤纹理，不要复杂背景，不要任何文字、标题或水印。' +
  '纯白背景，只保留一个居中的完整全身角色，颜色干净、造型简洁、线索明确。' +
  '这是一个"今日状态"系列的搞怪自嘲风格角色，需要有强辨识度和截图传播性：';

// ── 12 daily status types ─────────────────────────────────────────────────────
const DAILY_TYPES = [
  {
    slug: 'supercharged',
    ref: 'gogo.png',
    prompt:
      STYLE +
      '一个满血复活的"超级充能"角色。穿着鲜艳的黄色连帽衫，' +
      '双拳握紧高举过头顶做出胜利姿势，眼睛放大闪闪发光，嘴巴大张呐喊。' +
      '头顶有一个绿色的满格电池图标，全身上下散发着"精力爆棚"的感觉，' +
      '脚底踮起来像要飞起来一样。表情极度亢奋、充满战斗力。',
  },
  {
    slug: 'zombie',
    ref: 'zzzz.png',
    prompt:
      STYLE +
      '一个丧到极致的"行尸走肉"角色。穿着皱巴巴的灰绿色睡衣，' +
      '两只胳膊僵硬地向前平伸（经典僵尸姿势），眼睛半闭只剩缝，嘴巴微张流着口水。' +
      '头发乱得像鸡窝，脸色苍白偏灰绿，走路姿势歪歪斜斜。' +
      '整个人散发出"灵魂已经离开身体"的气息，搞笑又丧萌。',
  },
  {
    slug: 'butterfly',
    ref: 'party.png',
    prompt:
      STYLE +
      '一个社交狂蝴蝶精角色。穿着粉色外套、色彩鲜艳的穿搭，' +
      '肩背上长着一对夸张的卡通蝴蝶翅膀（半透明彩色），' +
      '双手各拿一个手机正在同时打字，嘴巴张开在说话。' +
      '脚步轻快像在跳舞，身边飘着几个聊天气泡图标。' +
      '表情超级开朗、热情洋溢，整个人就像一只快乐飞舞的蝴蝶。',
  },
  {
    slug: 'cave',
    ref: 'shy.png',
    prompt:
      STYLE +
      '一个"洞穴模式"的独处角色。穿着深蓝色大号连帽衫并拉起帽子把头包住，' +
      '只露出两只大眼睛从帽子里往外偷看，双手缩在袖子里。' +
      '身边有一个暗色小帐篷或毯子堡垒的暗示，戴着一副大耳机。' +
      '整个人蜷缩成一团、但表情是安详舒适的——不是害怕，是在享受独处。',
  },
  {
    slug: 'chill',
    ref: 'chill.png',
    prompt:
      STYLE +
      '一个万事云淡风轻的"佛系今天"角色。穿着宽松的淡蓝色休闲卫衣，' +
      '靠在一张大沙发上，一只手端着茶杯，另一只手比了个"OK"手势，' +
      '眼睛半眯、嘴角一丝淡淡的微笑。头顶漂浮着一朵小云。' +
      '整个人透出极其松弛的居家氛围。',
  },
  {
    slug: 'bomb',
    ref: 'fuck.png',
    prompt:
      STYLE +
      '一个随时要爆炸的"定时炸弹"角色。穿着普通衣服但脸涨得通红，' +
      '头顶冒着一条已经点着的导火线在滋滋冒火花，' +
      '双拳紧握、身体僵硬、太阳穴上暴出青筋。' +
      '眼睛瞪大嘴巴紧闭努力忍耐的样子，旁边有几个"#$%&"的愤怒符号。' +
      '表情是"我快忍不了了"的临界状态，搞怪又让人共鸣。',
  },
  {
    slug: 'dreamer',
    ref: 'zzzz.png',
    prompt:
      STYLE +
      '一个"白日梦游"角色。穿着淡紫色的宽松毛衣，' +
      '眼睛大睁但目光空洞完全失焦，嘴巴微微张开呆呆的表情。' +
      '头顶有一个大大的思维泡泡，里面是星星月亮和彩色梦境。' +
      '整个人站着但灵魂已经飘走了，身体微微歪斜，一只手无意识地举着。' +
      '表情呆萌可爱，完美诠释"人在现实，心在外太空"。',
  },
  {
    slug: 'machine',
    ref: 'nerd.png',
    prompt:
      STYLE +
      '一个"效率机器"角色。穿着干净利落的蓝色衬衫、戴着方框眼镜，' +
      '眼睛像机器人一样亮着蓝光，身体姿态挺直如军人。' +
      '双手放在打字姿势（像操作键盘），动作精确机械。' +
      '身体某些关节处有齿轮装饰暗示机器感。' +
      '表情专注、冷静、高效，整个人像一台刚被调校过的精密机器。',
  },
  {
    slug: 'sunshine',
    ref: 'hhhh.png',
    prompt:
      STYLE +
      '一个开心到发光的"小太阳"角色。穿着明亮的橙黄色衣服，' +
      '脸上挂着超大超灿烂的笑容，眼睛弯成月牙。' +
      '头顶有一个可爱的微型太阳光环，身体周围散发出温暖的光线效果。' +
      '双手张开做着"来抱抱"的邀请姿势，整个人就像一颗人形小太阳。' +
      '表情极度阳光治愈，让看到的人都忍不住微笑。',
  },
  {
    slug: 'lowbat',
    ref: 'dead.png',
    prompt:
      STYLE +
      '一个快没电的"低电量警告"角色。穿着灰白色的衣服、颜色暗淡、' +
      '半跪在地上一只手撑着地面，另一只手虚弱地伸出来想抓住什么。' +
      '头顶有一个红色闪烁的低电量电池图标（只剩一格红色）。' +
      '眼睛只剩两条缝，嘴巴无力地张着。' +
      '整个人像手机剩5%电量一样摇摇欲坠，搞笑又让人心疼。',
  },
  {
    slug: 'edge',
    ref: 'ctrl.png',
    prompt:
      STYLE +
      '一个"绷不住了"角色。穿着整洁的衣服但领口松了一边，' +
      '面部表情是经典的"😵"——一只眼睛变成了×号，另一只眼睛是漩涡转圈。' +
      '双手不停在原地打转做出崩溃的姿态，头发有几根竖起来。' +
      '嘴巴扭曲成波浪线，身体微微后仰像要倒下。' +
      '表情搞怪地表现"表面淡定，内心已经炸了"的感觉。',
  },
  {
    slug: 'vibe',
    ref: 'chill.png',
    prompt:
      STYLE +
      '一个"在线发呆"角色。穿着松松垮垮的浅蓝色卫衣，' +
      '坐在地上双腿伸直前方，身体后仰用双手撑地。' +
      '头微微歪向一边，嘴角有口水要滴不滴，眼睛看向远方完全放空。' +
      '头顶飘着一个音乐符号🎵。' +
      '整个人散发着"什么都不想干"的颓废惬意感，软塌塌地赖在地上。',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function submitTask(imageBase64DataUri, prompt) {
  const res = await fetch(`${API_BASE}${EDIT_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      imageUrls: [imageBase64DataUri],
      prompt,
      aspectRatio: ASPECT_RATIO,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Submit HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function queryTask(taskId) {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ taskId }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Query HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function pollUntilDone(taskId, maxAttempts = 120) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(5000);
    const result = await queryTask(taskId);
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
  throw new Error('Polling timeout after ' + maxAttempts * 5 + 's');
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buf);
  return buf.length;
}

// ── Generate one image ────────────────────────────────────────────────────────

async function generateOne(type, options) {
  const refPath = path.join(TYPES_DIR, type.ref);
  if (!fs.existsSync(refPath)) {
    throw new Error(`Reference image not found: ${refPath}`);
  }

  const outPath = path.join(TYPES_DIR, `daily-${type.slug}.png`);
  if (fs.existsSync(outPath) && !options.force) {
    console.log(`\n⏭️  [${type.slug}] Skipped existing file: daily-${type.slug}.png`);
    return outPath;
  }

  const refBuf = fs.readFileSync(refPath);
  const ext = path.extname(type.ref).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  const dataUri = `data:${mime};base64,${refBuf.toString('base64')}`;

  console.log(`\n🎨 [${type.slug}] Submitting (ref: ${type.ref}, ${(refBuf.length / 1024).toFixed(0)}KB)...`);

  const submit = await submitTask(dataUri, type.prompt);

  if (!submit.taskId) {
    throw new Error(`No taskId: ${JSON.stringify(submit)}`);
  }

  console.log(`  TaskId: ${submit.taskId} | Initial: ${submit.status}`);
  console.log(`  Waiting for completion...`);

  const result = await pollUntilDone(submit.taskId);

  if (!result.results?.length) {
    throw new Error('Task succeeded but no results returned');
  }

  const imageUrl = result.results[0].url;

  console.log(`  Downloading result...`);
  const bytes = await downloadImage(imageUrl, outPath);
  console.log(`  ✅ Saved: daily-${type.slug}.png (${(bytes / 1024).toFixed(0)}KB)`);

  return outPath;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (!API_KEY) {
    console.error('Missing RUNNINGHUB_API_KEY');
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const slugArgs = args.filter((a) => !a.startsWith('--'));

  const selected =
    slugArgs.length > 0
      ? DAILY_TYPES.filter((t) => slugArgs.includes(t.slug))
      : DAILY_TYPES;

  if (selected.length === 0) {
    console.error('No matching slugs found. Available:', DAILY_TYPES.map((t) => t.slug).join(', '));
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   RunningHub Daily Status Image Generator        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Endpoint: ${EDIT_ENDPOINT}`);
  console.log(`  Types: ${selected.length} | Aspect Ratio: ${ASPECT_RATIO}`);
  console.log(`  Output: public/images/types/daily-{slug}.png`);
  if (force) {
    console.log('  Mode: force overwrite existing files');
  }

  if (dryRun) {
    console.log('\n--- DRY RUN (no API calls) ---\n');
    for (const t of selected) {
      console.log(`[${t.slug}] ref=${t.ref}`);
      console.log(`  prompt: ${t.prompt.slice(0, 100)}...`);
    }
    return;
  }

  const ok = [];
  const errs = [];

  for (let i = 0; i < selected.length; i++) {
    const type = selected[i];
    try {
      await generateOne(type, { force });
      ok.push(type.slug);
    } catch (err) {
      console.error(`  ❌ [${type.slug}] ${err.message}`);
      errs.push({ slug: type.slug, err: err.message });
    }

    if (i < selected.length - 1) {
      await sleep(2000);
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  ✅ ${ok.length} succeeded: ${ok.join(', ')}`);
  if (errs.length) {
    console.log(`  ❌ ${errs.length} failed:`);
    errs.forEach((e) => console.log(`     ${e.slug}: ${e.err}`));
  }
}

main().catch((err) => {
  console.error('\nFatal:', err);
  process.exit(1);
});
