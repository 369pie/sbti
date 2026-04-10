#!/usr/bin/env node
/**
 * Generate love personality type images using RunningHub official img2img API.
 *
 * Same pipeline as generate-work-images.mjs but for the 16 love personality types.
 *
 * Usage:
 *   node scripts/generate-love-images.mjs                        # generate all 16
 *   node scripts/generate-love-images.mjs lick vinegar emperor   # specific slugs
 *   node scripts/generate-love-images.mjs --dry-run              # preview prompts
 *   node scripts/generate-love-images.mjs --force                # overwrite existing
 *
 * Env:
 *   RUNNINGHUB_API_KEY  (required)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRunningHubConfig } from './runninghub-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { apiKey: API_KEY, apiBase: API_BASE, editEndpoint: EDIT_ENDPOINT, aspectRatio: ASPECT_RATIO } =
  getRunningHubConfig();
const TYPES_DIR = path.join(__dirname, '../public/images/types');

// ── Style prefix ──────────────────────────────────────────────────────────────
// Must match the original SBTI low-poly paper craft style exactly.
const STYLE =
  '严格保留参考图的简洁低多边形纸艺插画风格(low-poly paper craft illustration)，保留方块头、圆眼睛、短四肢、呆萌比例。' +
  '不要照片感，不要高精度3D建模感，不要电影级光影，不要真实皮肤纹理，不要复杂背景，不要任何文字、标题或水印。' +
  '纯白背景，只保留一个居中的完整全身角色，颜色干净、造型简洁、线索明确。' +
  '这是一个"恋爱人格"系列的搞怪自嘲风格角色，需要有强辨识度和截图传播性：';

// ── 16 love personality types ─────────────────────────────────────────────────
const LOVE_TYPES = [
  {
    slug: 'lick',
    ref: 'simp.png',
    prompt:
      STYLE +
      '一个过度深情投入的守候型角色。穿着普通T恤，站着双手高高捧着一颗巨大的粉色爱心，' +
      '眼睛圆润发亮地望向前方，嘴巴微张露出讨好的笑容。' +
      '身旁散落着几片玫瑰花瓣，整体气质是认真又可爱的等待感。' +
      '表情像是在说"我一直在认真喜欢你"，带一点委屈和很多深情。',
  },
  {
    slug: 'vinegar',
    ref: 'ctrl.png',
    prompt:
      STYLE +
      '一个嫉妒心超强的"醋王"角色。穿着亮黄色衣服，一手抱着一个大醋瓶子，' +
      '另一只手指向前方做出质问的手势，眼睛斜着瞪向一边，嘴巴撅起来。' +
      '脸上有生气的腮红，头顶冒着小火苗，脚下有一滩溢出来的醋液。' +
      '表情又凶又可爱，像在说"你刚才跟谁说话了？！"',
  },
  {
    slug: 'emperor',
    ref: 'boss.png',
    prompt:
      STYLE +
      '一个霸气十足的"恋爱帝王"角色。穿着一件带金色装饰的深红色披风，' +
      '头戴一顶小皇冠，一手叉腰一手指向前方，眼神锐利自信。' +
      '下巴微微抬起，嘴角带着"一切尽在掌控"的微笑。' +
      '脚下踩着一个小小的爱心形靠垫，气场两米八。',
  },
  {
    slug: 'bomb',
    ref: 'fuck.png',
    prompt:
      STYLE +
      '一个随时要爆炸的"定时炸弹"角色。穿着粉色衣服但脸涨得通红，' +
      '头顶有一颗圆滚滚的卡通炸弹，导火线正在滋滋冒火花。' +
      '双拳紧握全身僵硬，太阳穴暴青筋，嘴巴紧闭在拼命忍耐。' +
      '脚边散落着聊天气泡碎片和一个碎裂的爱心。' +
      '表情是恋爱中"我快忍不了了但我先不说"的临界爆发状态。',
  },
  {
    slug: 'atm',
    ref: 'atm-er.png',
    prompt:
      STYLE +
      '一个"恋爱ATM"角色。穿着整洁的衬衫，胸口有一个提款机的卡槽造型，' +
      '一只手伸出来递着一个礼物盒和一束花，另一只手拿着钱包（已经空了往外飞出蛾子）。' +
      '脸上带着温柔又无奈的微笑，眼睛看着对方的方向。' +
      '表情是"钱我都花了，你开心就好"的宠溺但心痛的样子。',
  },
  {
    slug: 'spy',
    ref: 'nerd.png',
    prompt:
      STYLE +
      '一个"查岗专家"角色。穿着黑色风衣像侦探一样，戴着一副墨镜（推到额头上），' +
      '一手拿着放大镜凑近在看，另一只手拿着手机在翻聊天记录。' +
      '眼睛眯起来充满怀疑，嘴角微微抿着像在分析线索。' +
      '身边飘着几个问号和感叹号的气泡。' +
      '表情是"我什么都能查到"的精明又紧张的样子。',
  },
  {
    slug: 'monk',
    ref: 'monk.png',
    prompt:
      STYLE +
      '一个看破红尘的"出家型"角色。穿着朴素的灰色僧袍风格宽松衣服，' +
      '盘腿坐着双手合十闭目打坐，头上剃着光头一个小圆点。' +
      '身边飘着几朵祥云和一个被划掉的爱心图标。' +
      '脸上是超级平静淡然的表情，嘴角带一丝禅意的微笑。' +
      '整个人散发出"恋爱是什么？能吃吗？"的超脱气息。',
  },
  {
    slug: 'puppet',
    ref: 'imfw.png',
    prompt:
      STYLE +
      '一个毫无主见的"提线木偶"角色。身上有几根明显的牵线从上方垂下来连着双手和头部，' +
      '穿着随便的衣服，整个人像被吊着的木偶一样，四肢松松垮垮地悬着。' +
      '脸上是无辜又空洞的大眼睛，嘴巴微张，像在等别人告诉自己下一步该做什么。' +
      '线的上方有一个小小的粉色爱心在操控。',
  },
  {
    slug: 'sweet',
    ref: 'love-r.png',
    prompt:
      STYLE +
      '一个甜到发齁的"甜蜜暴击"角色。穿着粉色+白色的可爱搭配，' +
      '双手比着爱心手势放在胸前，眯着眼嘴巴做出亲亲的嘟嘴表情。' +
      '身边飘满粉色爱心、星星和小彩虹，腮红超红。' +
      '整个人被粉色泡泡和闪光包围，甜度溢出屏幕的感觉。',
  },
  {
    slug: 'freeze',
    ref: 'chill.png',
    prompt:
      STYLE +
      '一个迅速冷却的"3分钟冷却"角色。穿着浅蓝色衣服，整个人像正在结冰一样，' +
      '下半身已经被一层冰霜覆盖冻住了，上半身还正常但表情冷淡无感。' +
      '手里拿着一朵枯萎的玫瑰花，另一只手在打哈欠。' +
      '身边有一个从热到冷的温度计图标，表情是"已经不感兴趣了"的超级冷漠脸。',
  },
  {
    slug: 'fish',
    ref: 'game-r.png',
    prompt:
      STYLE +
      '一个"养鱼大师"角色。穿着时髦的衣服，双手各拿一根钓鱼竿，' +
      '每根鱼线下面都挂着一个不同颜色的小爱心。' +
      '脸上带着得意又狡猾的微笑，一只眼睛还眨着。' +
      '脚下画着一个小池塘，里面游着好几条彩色小鱼。' +
      '表情自信又调皮，像在说"我就是不选"。',
  },
  {
    slug: 'clingy',
    ref: 'mum.png',
    prompt:
      STYLE +
      '一个超级黏人的"树袋熊"角色。穿着毛茸茸的灰色考拉连体服装，' +
      '双手和双腿紧紧抱着一个大大的粉色爱心抱枕不肯松手。' +
      '圆圆的大眼睛水汪汪的看着你，嘴巴微微嘟起来。' +
      '头上有两个圆圆的考拉耳朵，表情是"不要走不要离开我"的可爱黏人样。',
  },
  {
    slug: 'chill',
    ref: 'chill.png',
    prompt:
      STYLE +
      '一个万事随缘的"佛系恋人"角色。穿着宽松的绿色卫衣，' +
      '靠在一颗大爱心形状的靠垫上，一手端着茶杯，另一手比了个"OK"手势。' +
      '眼睛半眯嘴角微微上扬，头顶飘着一朵小云写着"随便"。' +
      '表情极其淡定松弛，整个人散发出"你开心就好我无所谓"的气息。',
  },
  {
    slug: 'balance',
    ref: 'gogo.png',
    prompt:
      STYLE +
      '一个两手抓的"恋爱特种兵"角色。穿着干练的运动装，' +
      '一手拿着笔记本电脑代表工作，另一手拿着一束花代表恋爱。' +
      '脸上是坚定又从容的微笑，两只脚分别踩在"Work"和"Love"两个小平台上保持平衡。' +
      '身边有闪光效果，表情自信，像在说"我全都要"。',
  },
  {
    slug: 'buddy',
    ref: 'hhhh.png',
    prompt:
      STYLE +
      '一个"哥们儿式恋人"角色。穿着休闲运动装，一手拿着游戏手柄，' +
      '另一手做出拳头碰拳的"bro fist"手势。脸上是爽朗大笑的表情。' +
      '脚边有一个游戏机和几罐可乐，头上带着一顶鸭舌帽。' +
      '整个人散发出"我把你当兄弟，顺便亲一口"的欢乐气息。',
  },
  {
    slug: 'sleepy',
    ref: 'sleep.png',
    prompt:
      STYLE +
      '一个慢半拍的困困恋人角色。穿着蓝紫色家居服，' +
      '眼睛半睁半闭，嘴巴微张在打哈欠，头上飘着月亮和小云朵元素。' +
      '身边有几个粉色爱心轻轻飘着，但这个角色反应很慢，还没完全注意到。' +
      '一只手松松地举着一朵小花，整体姿态迷迷糊糊、软绵绵的。' +
      '表情是迟钝、懵懂、可爱、还没完全醒来的状态。',
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

  const outPath = path.join(TYPES_DIR, `love-${type.slug}.png`);
  if (fs.existsSync(outPath) && !options.force) {
    console.log(`\n⏭️  [${type.slug}] Skipped existing file: love-${type.slug}.png`);
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
  console.log(`  ✅ Saved: love-${type.slug}.png (${(bytes / 1024).toFixed(0)}KB)`);

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
      ? LOVE_TYPES.filter((t) => slugArgs.includes(t.slug))
      : LOVE_TYPES;

  if (selected.length === 0) {
    console.error('No matching slugs found. Available:', LOVE_TYPES.map((t) => t.slug).join(', '));
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   RunningHub Love Personality Image Generator    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Endpoint: ${EDIT_ENDPOINT}`);
  console.log(`  Types: ${selected.length} | Aspect Ratio: ${ASPECT_RATIO}`);
  console.log(`  Output: public/images/types/love-{slug}.png`);
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
