#!/usr/bin/env node
/**
 * 修仙图鉴 — 文生图测试脚本
 *
 * 使用 RunningHub text-to-image API 生成一张样图，
 * 后续作为 ref 参考图用图生图批量生成全部 36 张。
 *
 * Usage:
 *   node scripts/generate-xiuxian-sample.mjs [slug]
 *   node scripts/generate-xiuxian-sample.mjs ctrl          # 生成御灵猫
 *   node scripts/generate-xiuxian-sample.mjs dior-s        # 生成躺平仙草
 *   node scripts/generate-xiuxian-sample.mjs               # 默认 ctrl
 *   node scripts/generate-xiuxian-sample.mjs --dry-run     # 仅打印 prompt，不调接口
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRunningHubConfig } from './runninghub-config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/images/types');

const POLL_INTERVAL = 5000;
const MAX_ATTEMPTS = 120;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── 修仙灵物图鉴视觉风格 ────────────────────────────────
const XIUXIAN_VISUAL_STYLE =
  'Q版搞怪手绘插画风格（chibi cartoon doodle illustration），2-3头身的圆润Q版比例，' +
  '手绘涂鸦感的粗线条勾边，色彩鲜艳饱和、对比强烈，带有漫画式的夸张表情和搞笑肢体动作。' +
  '整体像社交媒体上会被疯转的表情包/梗图角色，有一种"认真画了但故意画歪"的手作感。' +
  '不要低多边形风格，不要纸艺风格，不要3D建模感，不要照片写实，不要水墨风。' +
  '不要复杂背景，不要任何文字、标题或水印。' +
  '纯白背景，只保留一个居中的完整全身角色，轮廓清晰、辨识度高。';

const XIUXIAN_TONE =
  '这是修仙萌物图鉴系列角色——修仙世界观下的人格拟灵兽化角色。' +
  '整体风格是"仙侠 × Q版 × 沙雕搞怪"：穿着仙侠道具但表情和动作极其搞笑，' +
  '像修仙世界里被抓拍到最尴尬瞬间的灵兽，自带"被说中了"的社死感和meme传播力。' +
  '角色以可爱灵兽/小妖怪/灵物为形态，配有修仙道具或法宝，表情夸张到变形，动作戏剧性拉满。' +
  '不要严肃正经的武侠设定、不要暗黑风、不要唯美，要有仙气道具但角色本身蠢萌搞怪。';

// ─── 36 种修仙灵物的 prompt 描述 ──────────────────────────
const XIUXIAN_TYPES = [
  // 传说级 · 大乘期
  { slug: 'ctrl', creature: '白色立耳短毛猫，穿紫金道袍，左爪持罗盘，右爪掐指算命', vibe: '掌控全局、高高在上但又带一点自恋的优雅猫' },
  { slug: 'boss', creature: '金色小龙崽，系着微型领带，一只爪夹着考勤本', vibe: '严肃但可爱的小龙管理者，散发霸总气场' },
  { slug: 'nerd', creature: '戴圆框眼镜的淡蓝色小书虫，蜷在一摞古籍里', vibe: '知识渊博但呆萌的学霸，被书本包围' },

  // 超稀有 · 元婴期
  { slug: 'mum', creature: '白色小仙鹤，翅膀张开如伞一样护着一窝小崽子', vibe: '温柔母性，翅膀下藏着满满保护欲' },
  { slug: 'simp', creature: '穿着仙门弟子服的柴犬，嘴里叼着一颗灵丹', vibe: '忠诚卖力讨好主人，眼神真诚到让人心软' },
  { slug: 'atm-er', creature: '圆滚滚的金色小娃娃，穿财神肚兜，口袋朝下漏灵石', vibe: '傻乎乎地散财，自己不知道在亏' },
  { slug: 'solo', creature: '裂着一条小缝的白色灵蛋，表面泛紫色半透明结界光', vibe: '缩在壳里不想出来，偷偷从裂缝里偷看外面' },
  { slug: 'sleep', creature: '趴在粉色祥云上的白色小圆熊，嘴角挂口水，打着鼾声气泡', vibe: '完全摆烂放弃，极致躺平，一脸享受' },
  { slug: 'game-r', creature: '浑身肌肉的小仓鼠，举着一把比自己大三倍的锻造锤', vibe: '肝到爆炸的疯狂工匠鼠，眼里只有锤和炉' },
  { slug: 'drunk', creature: '长了脸的紫金酒葫芦，飘飘晃晃，嘴角挂酒渍脸蛋微红', vibe: '半醉半醒的放飞自我，摇摇晃晃但很快乐' },

  // 稀有 · 金丹期
  { slug: 'oh-no', creature: '背着八卦纹龟壳的小乌龟，两只小爪捂嘴，一脸惊恐', vibe: '永远在担心，看什么都觉得要出事' },
  { slug: 'thin-k', creature: '背着小算盘的圆身蜘蛛，八只脚抓着不同的思维导图线', vibe: '想太多，永远在分析、推理、纠结' },
  { slug: 'emo', creature: '水蓝色半透明小水滴精灵，头顶飘着随时会下雨的小乌云', vibe: '情绪丰富、容易感动、容易哭，很通透很脆弱' },
  { slug: 'drama', creature: '橘色小狸猫，脸上画着一半笑一半哭的戏曲脸谱', vibe: '戏剧性十足，情绪夸张，表演型人格' },
  { slug: 'chill', creature: '闭目打坐的小绿蛙，坐在莲叶上一动不动，身上长了青苔', vibe: '佛系到极致，什么都不在乎，完全放空' },

  // 较少见 · 筑基期
  { slug: 'malo', creature: '穿打满补丁道袍的小棕猴，坐在蟠桃树梢啃桃眼神放空', vibe: '明目张胆摸鱼但没人管得了的老油条' },
  { slug: 'dior-s', creature: '一棵长了小脸的灵芝，趴在石头上一动不动', vibe: '彻底躺平的灵草，连挪动都懒得做' },
  { slug: 'sexy', creature: '半眯眼的白色小九尾狐（只长三条尾巴），尾巴尖带粉色光', vibe: '不费力的魅惑，慵懒又迷人' },
  { slug: 'shy', creature: '缩在粉色珍珠贝壳里的小海螺精，只露两只怯生生大眼睛', vibe: '极度害羞、缩在壳里偷看世界' },
  { slug: 'luck-y', creature: '鳞片闪亮发光的小锦鲤，游过的地方自动长出莲花', vibe: '运气爆表的天选之鱼，自带闪亮光效' },
  { slug: 'rebel', creature: '总是倒着飞的小黑色龙崽，脖子上有明显反着长的逆鳞', vibe: '叛逆、倒着飞、就是不服' },

  // 常见 · 炼气期
  { slug: 'than-k', creature: '不停鞠躬的圆头小蘑菇精，头顶有感恩光环', vibe: '不停感谢一切，鞠躬到头晕' },
  { slug: 'woc', creature: '嘴巴永远张成O型的圆滚滚小饕餮，眼睛瞪得比脸还大', vibe: '对万事万物都震惊，夸张大惊小怪' },
  { slug: 'party', creature: '迷你凤凰但羽毛是烟花做的，展开翅膀就放烟花', vibe: '热闹爆灯的氛围担当' },
  { slug: 'talk-er', creature: '嘴巴占身体一半面积的彩色小鹦鹉，嘴边飘着一堆小字气泡', vibe: '话痨，永远在叨叨叨' },
  { slug: 'love-r', creature: '粉色小花妖，头顶的花一直在"开-谢-开-谢"循环', vibe: '容易心动，看什么都开花' },
  { slug: 'food-ie', creature: '圆滚滚的小饕餮宝宝，腮帮子鼓着，手抱仙果啃', vibe: '只想吃，吃就是修炼' },
  { slug: 'dead', creature: '翅膀烧焦的小萤火虫精，浑身冒着劫雷的烟，表情生无可恋', vibe: '社死、尴尬、惨兮兮但还活着' },
  { slug: 'fake', creature: '白色小猫妖，脸上戴着微笑面具，面具下表情看不清', vibe: '永远微笑但面具下真心难辨' },
  { slug: 'gogo', creature: '戴小铁头盔的黄色小鸭子，翅膀太短但腿跑得飞快', vibe: '不管三七二十一先冲再说的莽鸭' },
  { slug: 'hhhh', creature: '一团粉色笑脸云团，没有四肢只有一张笑到变形的脸', vibe: '永远在笑，笑着活下去' },
  { slug: 'joker', creature: '穿彩色花衣的小白脸文鸟，嘴角画上翘红色笑纹，眼角泛泪光', vibe: '搞笑艺人但深夜会流泪' },
  { slug: 'monk', creature: '盘腿打坐的灰色小猫，身上长满青苔和小蘑菇', vibe: '闭关三千年不动，完全出世' },
  { slug: 'ojbk', creature: '永远竖大拇指的白色小海豹，嘴角永远上扬', vibe: '什么都OK，永远点头答应' },
  { slug: 'poor', creature: '穿着破洞道袍的小仓鼠，储物袋底部是破的灵石随走随漏', vibe: '穷但洒脱，一贫如洗但乐在其中' },
  { slug: 'zzzz', creature: '半睁半闭眼的小考拉，衣服穿反了，两只脚穿着不配对的鞋', vibe: '永远半梦半醒，在线梦游' },
];

function buildXiuxianPrompt(type) {
  return [
    XIUXIAN_VISUAL_STYLE,
    XIUXIAN_TONE,
    `角色形态描述：${type.creature}`,
    `性格氛围：${type.vibe}`,
  ].join('\n');
}

// ─── RunningHub text-to-image API ─────────────────────────
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

// ─── main ─────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const slugArg = args.find(a => !a.startsWith('--'));
  const targetSlug = slugArg || 'ctrl';

  const type = XIUXIAN_TYPES.find(t => t.slug === targetSlug);
  if (!type) {
    console.error(`❌ Unknown slug: "${targetSlug}"`);
    console.error(`Available: ${XIUXIAN_TYPES.map(t => t.slug).join(', ')}`);
    process.exit(1);
  }

  const prompt = buildXiuxianPrompt(type);

  console.log(`\n🎨 修仙灵物图鉴 — 文生图测试`);
  console.log(`   Slug: ${type.slug}`);
  console.log(`   Creature: ${type.creature}`);
  console.log(`\n📝 Prompt:\n${prompt}\n`);

  if (dryRun) {
    console.log('🏁 --dry-run mode, skipping API call.');
    return;
  }

  const config = getRunningHubConfig();
  if (!config.apiKey) {
    console.error('❌ RUNNINGHUB_API_KEY not set. Add it to .env.local');
    process.exit(1);
  }

  console.log('🚀 Submitting to RunningHub text-to-image...');
  const submitResult = await submitTextToImage(config, prompt);
  console.log(`   TaskId: ${submitResult.taskId}`);
  console.log(`   Status: ${submitResult.status}`);

  if (submitResult.status === 'FAILED') {
    console.error(`❌ Submit failed: ${submitResult.errorMessage}`);
    process.exit(1);
  }

  console.log('⏳ Polling for result...');
  const result = await pollUntilDone(config, submitResult.taskId);

  const imageResult = result.results?.find(r => r.outputType === 'png' || r.outputType === 'jpg' || r.outputType === 'jpeg' || r.outputType === 'webp');
  if (!imageResult?.url) {
    console.error('❌ No image URL in result:', JSON.stringify(result.results));
    process.exit(1);
  }

  const ext = imageResult.outputType || 'png';
  const outputPath = path.join(OUTPUT_DIR, `xiuxian-${type.slug}-sample.${ext}`);

  console.log(`📥 Downloading to ${path.relative(process.cwd(), outputPath)}...`);
  const size = await downloadImage(imageResult.url, outputPath);
  console.log(`✅ Done! ${(size / 1024).toFixed(0)} KB saved.`);
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
