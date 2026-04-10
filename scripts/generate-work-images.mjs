#!/usr/bin/env node
/**
 * Generate work personality type images using RunningHub official img2img API.
 *
 * Usage:
 *   node scripts/generate-work-images.mjs                # generate all 16
 *   node scripts/generate-work-images.mjs juan fish 996  # generate specific slugs
 *
 * Env:
 *   RUNNINGHUB_API_KEY  (defaults to the project key)
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

// ── Style prefix for all prompts ──────────────────────────────────────────────
const STYLE =
  '严格保留参考图的简洁低多边形纸艺插画风格(low-poly paper craft illustration)，保留方块头、圆眼睛、短四肢、呆萌比例。' +
  '不要照片感，不要高精度3D建模感，不要电影级光影，不要真实皮肤纹理，不要复杂背景，不要任何文字、标题或水印。' +
  '纯白背景，只保留一个居中的完整全身角色，颜色干净、造型简洁、线索明确：';

// ── 16 work personality types ─────────────────────────────────────────────────
const WORK_TYPES = [
  {
    slug: 'juan',
    ref: 'gogo.png',
    prompt:
      STYLE +
      '一个充满干劲的"卷王"角色。穿着衬衫并卷起袖子，头发凌乱，眼睛里闪着斗志，' +
      '一手拿着笔记本电脑，一手举着一杯咖啡，周围飘着几张待办清单纸条。表情认真、精力充沛。',
  },
  {
    slug: 'fish',
    ref: 'chill.png',
    prompt:
      STYLE +
      '一个悠闲的"摸鱼王"角色。穿着休闲T恤，手里偷偷拿着手机，' +
      '面前有一台电脑但眼睛看向手机方向，嘴角带着偷笑。身旁游过一条可爱的小鱼，表情悠然自得。',
  },
  {
    slug: '996',
    ref: 'dead.png',
    prompt:
      STYLE +
      '一个疲惫但坚持加班的"加班战神"角色。穿着松垮的白衬衫，领带歪了，' +
      '头顶有一个挂钟显示21:00，桌上堆着外卖盒和文件，有黑眼圈但眼睛还在发光，' +
      '表情是疲惫却不放弃的拼搏样子。',
  },
  {
    slug: 'ppt',
    ref: 'talk-er.png',
    prompt:
      STYLE +
      '一个自信满满的"汇报侠"角色。穿着精致的深色西装，' +
      '一手拿着激光笔指向身后的PPT演示屏幕，另一手比划着在讲解，' +
      '脸上带着自信的微笑，表情充满说服力、气场十足。',
  },
  {
    slug: 'ddl',
    ref: 'fuck.png',
    prompt:
      STYLE +
      '一个被deadline追赶的"死线战士"角色。头发像被电击一样竖起来，' +
      '眼睛瞪大，嘴巴微张表示惊慌，身边有闪电符号和闹钟，' +
      '双手疯狂敲键盘，周围飞着纸张。表情紧张但充满爆发力。',
  },
  {
    slug: 'tea',
    ref: 'party.png',
    prompt:
      STYLE +
      '一个开朗爱聊天的"茶水间之光"角色。穿着休闲工装，' +
      '手里端着一杯热气腾腾的咖啡，嘴巴张开正在愉快地说话，' +
      '身边有小对话气泡，表情温暖亲切，整个人散发着社交达人的阳光气息。',
  },
  {
    slug: 'ghost',
    ref: 'shy.png',
    prompt:
      STYLE +
      '一个存在感极低的"透明人"角色。身体略微半透明虚化效果，' +
      '穿着普普通通的灰色衣服，表情淡淡的、若有若无，' +
      '手插在口袋里，整个人安安静静、存在感很低的样子。',
  },
  {
    slug: 'meet',
    ref: 'boss.png',
    prompt:
      STYLE +
      '一个被会议包围的"会议之王"角色。穿着正装，手里举着一摞文件，' +
      '同时看着手腕上的表，身边悬浮着好几个日历图标和会议通知弹窗，' +
      '表情是无奈但专业的"又要开会了"的样子。',
  },
  {
    slug: 'run',
    ref: 'hhhh.png',
    prompt:
      STYLE +
      '一个准点冲出去下班的"准点下班侠"角色。穿着工装、背着双肩包，' +
      '正在快步奔跑的姿态，脸上洋溢着灿烂的笑容，' +
      '身后有一个时钟显示18:00，飘着几片象征自由的叶子，表情自由快乐。',
  },
  {
    slug: 'zen',
    ref: 'monk.png',
    prompt:
      STYLE +
      '一个万事看淡的"佛系打工人"角色。穿着宽松的灰色卫衣，' +
      '盘腿坐着，双手放在膝盖上，眼睛微闭嘴角带淡淡微笑，' +
      '头顶有一个小小的光环，身边有一朵祥云，整个人散发出平和佛系的氛围。',
  },
  {
    slug: 'quit',
    ref: 'zzzz.png',
    prompt:
      STYLE +
      '一个"精神离职人"角色。穿着职业装坐在办公椅上，' +
      '但灵魂出窍——头顶飘着一个思想气泡，里面是沙滩和椰树的度假场景。' +
      '身体在工位但眼神空洞迷离，嘴角有一丝向往远方的微笑。',
  },
  {
    slug: 'climb',
    ref: 'nerd.png',
    prompt:
      STYLE +
      '一个野心勃勃的"野心家"角色。穿着锐利剪裁的深色西装，打着领带，' +
      '一手叉腰一手高高指向上方，眼睛闪着光芒，' +
      '身后有一条向上的绿色箭头，表情自信、果断、充满上进心和斗志。',
  },
  {
    slug: 'tool',
    ref: 'atm-er.png',
    prompt:
      STYLE +
      '一个忙碌的"工具人"角色。身体两侧各长出两只手臂(共四只手)，' +
      '同时拿着扳手、文件、打印纸和咖啡杯四样东西，' +
      '表情是任劳任怨但嘴角微微下撇带点无奈的样子，身体结实可靠。',
  },
  {
    slug: 'snack',
    ref: 'food-ie.png',
    prompt:
      STYLE +
      '一个爱吃零食的"零食续命者"角色。穿着休闲装，嘴里叼着一块饼干，' +
      '双手抱着一大堆零食：薯片、巧克力、奶茶杯，' +
      '脸上是满足幸福的表情，周围散落着几个小零食包装袋。',
  },
  {
    slug: 'drama',
    ref: 'drama.jpg',
    prompt:
      STYLE +
      '一个"职场戏精"角色。两只手各拿一个面具——一个笑脸面具和一个哭脸面具，' +
      '穿着精致的职业装，自己的真实表情是狡黠的偷笑，' +
      '身边有戏剧聚光灯效果，整个人充满"演技"的感觉。',
  },
  {
    slug: 'ceo',
    ref: 'boss.png',
    prompt:
      STYLE +
      '一个胸怀大志的"未来老板"角色。穿着高级深色西装，打着红色领带，' +
      '一手托下巴沉思，另一手拿着一份商业计划书，' +
      '戴着眼镜镜片闪闪发光，身后有公司大楼轮廓，表情沉着、有远见、充满领导气质。',
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
    // QUEUED or RUNNING → keep polling
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

  const outPath = path.join(TYPES_DIR, `work-${type.slug}.png`);
  if (fs.existsSync(outPath) && !options.force) {
    console.log(`\n⏭️  [${type.slug}] Skipped existing file: work-${type.slug}.png`);
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
  console.log(`  ✅ Saved: work-${type.slug}.png (${(bytes / 1024).toFixed(0)}KB)`);

  return outPath;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (!API_KEY) {
    console.error('Missing RUNNINGHUB_API_KEY');
    process.exit(1);
  }

  // --dry-run: just print prompts, don't call API
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const slugArgs = args.filter((a) => !a.startsWith('--'));

  const selected =
    slugArgs.length > 0
      ? WORK_TYPES.filter((t) => slugArgs.includes(t.slug))
      : WORK_TYPES;

  if (selected.length === 0) {
    console.error('No matching slugs found. Available:', WORK_TYPES.map((t) => t.slug).join(', '));
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   RunningHub Work Personality Image Generator    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Endpoint: ${EDIT_ENDPOINT}`);
  console.log(`  Types: ${selected.length} | Aspect Ratio: ${ASPECT_RATIO}`);
  console.log(`  Output: public/images/types/work-{slug}.png`);
  if (force) {
    console.log('  Mode: force overwrite existing files');
  }

  if (dryRun) {
    console.log('\n--- DRY RUN (no API calls) ---\n');
    for (const t of selected) {
      console.log(`[${t.slug}] ref=${t.ref}`);
      console.log(`  prompt: ${t.prompt.slice(0, 80)}...`);
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

    // Brief pause between tasks to be polite to the API
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
