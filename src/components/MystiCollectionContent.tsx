'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { getAllCollected } from '@/lib/mysti/collection';
import { withBasePath } from '@/lib/site';

// ─── Universe Definitions ─────────────────────────────────────────────────────

interface UniverseConfig {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  accent: string;
  testPath: string;
  resultPrefix: string;
  getName: (slug: string) => string;
  getEmoji: (slug: string) => string;
  getColor: (slug: string) => string;
}

const ALL_SLUGS = [
  'boss', 'nerd', 'ctrl', 'mum', 'simp', 'solo', 'sleep', 'game-r', 'drunk',
  'rebel', 'oh-no', 'thin-k', 'drama', 'chill', 'emo', 'atm-er', 'dior-s',
  'sexy', 'fake', 'malo', 'luck-y', 'joker', 'shy', 'party', 'than-k',
  'woc', 'love-r', 'food-ie', 'talk-er',
];

// WTFTI names
const WTFTI_NAMES: Record<string, { name: string; emoji: string; color: string }> = {
  boss: { name: '人形方向盘', emoji: '👔', color: '#dc2626' },
  nerd: { name: '人间收藏夹', emoji: '📚', color: '#3b82f6' },
  ctrl: { name: '人形KPI', emoji: '🎯', color: '#f59e0b' },
  mum: { name: '操心破产户', emoji: '🤱', color: '#ec4899' },
  simp: { name: '倒贴甲方', emoji: '🐕', color: '#f59e0b' },
  solo: { name: '一米结界', emoji: '🐺', color: '#475569' },
  sleep: { name: '再睡五分钟', emoji: '😴', color: '#6366f1' },
  'game-r': { name: '再来一把', emoji: '🎮', color: '#8b5cf6' },
  drunk: { name: '酒后真人', emoji: '🍺', color: '#a855f7' },
  rebel: { name: '反骨仔', emoji: '🔥', color: '#dc2626' },
  'oh-no': { name: '我早说了吧', emoji: '😱', color: '#f97316' },
  'thin-k': { name: '内耗永动机', emoji: '🧠', color: '#6366f1' },
  drama: { name: '情绪核弹', emoji: '🎭', color: '#d946ef' },
  chill: { name: '佛到没电', emoji: '🧘', color: '#64748b' },
  emo: { name: '碎了又粘', emoji: '🌧️', color: '#7c3aed' },
  'atm-er': { name: '行走提款机', emoji: '💸', color: '#22c55e' },
  'dior-s': { name: '躺平先驱', emoji: '🐸', color: '#78716c' },
  sexy: { name: '被动钓鱼', emoji: '✨', color: '#e11d48' },
  fake: { name: '下班发疯', emoji: '🎭', color: '#a78bfa' },
  malo: { name: '班味永存', emoji: '🐒', color: '#a16207' },
  'luck-y': { name: '欧气溢出', emoji: '🐟', color: '#f97316' },
  joker: { name: '陪笑护法', emoji: '🤡', color: '#facc15' },
  shy: { name: '社恐晚期', emoji: '🫣', color: '#94a3b8' },
  party: { name: '气氛焊接工', emoji: '🎉', color: '#06b6d4' },
  'than-k': { name: '谢谢你骂我', emoji: '🙏', color: '#eab308' },
  woc: { name: '吃瓜专业户', emoji: '🤯', color: '#ef4444' },
  'love-r': { name: '上头体质', emoji: '💕', color: '#f472b6' },
  'food-ie': { name: '卡路里文盲', emoji: '🍜', color: '#ea580c' },
  'talk-er': { name: '嘴巴关不上', emoji: '🗣️', color: '#14b8a6' },
};

// Banti (班TI) names
const BANTI_NAMES: Record<string, string> = {
  boss: '人形甘特图', nerd: '人间搜索引擎', ctrl: '人形KPI', mum: '操心项目办',
  simp: '职场舔王', solo: '工位结界', sleep: '工位休眠仓', 'game-r': '永动加班机',
  drunk: '酒局外交官', rebel: 'HR头痛源', 'oh-no': '风控永动机', 'thin-k': '内耗打工人',
  drama: '办公室气压计', chill: '准点蒸发器', emo: '碎了又粘的打工人',
  'atm-er': '职场充电宝', 'dior-s': '躺平先驱', sexy: '办公室磁铁',
  fake: '下班变脸王', malo: '班味代言人', 'luck-y': '锦鲤本鲤',
  joker: '团队气氛组', shy: '会议隐形人', party: '茶水间情报局',
  'than-k': '职场PUA接收器', woc: '吃瓜工位', 'love-r': '办公室恋爱脑',
  'food-ie': '外卖续命者', 'talk-er': '工位话痨',
};

// Bird (鸟TI) names
const BIRD_NAMES: Record<string, string> = {
  boss: '鹰', nerd: '猫头鹰', ctrl: '母鸡', mum: '鹈鹕', simp: '孔雀',
  solo: '黑天鹅', sleep: '褐林鸮', 'game-r': '松鸦', drunk: '太阳鹦鹉',
  rebel: '企鹅', 'oh-no': '鸭子', 'thin-k': '火烈鸟', drama: '啄木鸟',
  chill: '鸽子', emo: '夜鹰', 'than-k': '知更鸟', woc: '乌鸦',
  party: '噪鹃', 'talk-er': '虎皮鹦鹉', 'love-r': '天鹅', 'food-ie': '帝企鹅',
  'atm-er': '蜂鸟', 'dior-s': '极乐鸟', sexy: '鸳鸯', fake: '杜鹃',
  malo: '雕鸮', 'luck-y': '喜鹊', joker: '凤头鹦鹉', shy: '仓鸮',
};

// Delta (三角TI) names
const DELTA_NAMES: Record<string, string> = {
  boss: '战术指挥部', nerd: '武器百科全书', ctrl: '推进永动机', mum: '战地奶妈',
  simp: '工具人小兵', solo: '独狼渗透者', sleep: '据点睡神', 'game-r': '匹配永动机',
  drunk: '午夜行动组', rebel: '不听指挥专业户', 'oh-no': '战场预言家',
  'thin-k': '配装困难症', drama: '上头突击兵', chill: '佛系步兵',
  emo: '极限拉枪王', 'atm-er': '人肉沙袋', 'dior-s': '撤离观光客',
  sexy: '蹲点大师', fake: '双面特工', malo: '赛季苦工', 'luck-y': '盲狙欧皇',
  joker: '快乐战损', shy: '静音潜行者', party: '全服社牛',
  'than-k': '背锅特种兵', woc: '战场旁观者', 'love-r': '换枪成瘾',
  'food-ie': '边打边吃', 'talk-er': '全频道广播',
};

// Feng (疯TI) names
const FENG_NAMES: Record<string, string> = {
  boss: '全场唯一活爹', nerd: '电子仓鼠症晚期', ctrl: 'Excel成精',
  mum: '圣母型充电宝', simp: '爱情慈善家', solo: '社交节能模式',
  sleep: '床生哲学家', 'game-r': '赛博肝帝', drunk: '酒精解压包',
  rebel: '天生反骨仔', 'oh-no': '颅内灾难片导演', 'thin-k': '脑内17个会议室',
  drama: '人形弹幕机', chill: '情绪已读不回', emo: '深夜流泪猫猫头',
  'atm-er': '人形ATM·情绪版', 'dior-s': '躺平界诺贝尔奖得主',
  sexy: '无意识的蛊王', fake: '社会性假笑演员', malo: '工位上的吗喽',
  'luck-y': '锦鲤附体的显眼包', joker: '气氛组·破碎版',
  shy: '社交电量赤字患者', party: '社交永动机·漏电版',
  'than-k': '正能量驴', woc: '互联网草台班子观察员',
  'love-r': '心动永动机', 'food-ie': '卡路里法盲', 'talk-er': '人形弹幕发射器',
};

// Kings (王者TI) names
const KINGS_NAMES: Record<string, string> = {
  boss: '峡谷指挥官', nerd: '峡谷百科', ctrl: '节奏怪', mum: '峡谷老妈子',
  simp: '送人头天使', solo: '单机玩家', sleep: '泉水常驻', 'game-r': '排位永动机',
  drunk: '深夜开黑王', rebel: '秒选狂魔', 'oh-no': '峡谷预言家',
  'thin-k': '出装困难症', drama: '上头战士', chill: '佛系上分',
  emo: '越塔拼命三郎', 'atm-er': '人肉沙包', 'dior-s': '峡谷观光客',
  sexy: '偷塔之王', fake: '双面玩家', malo: '赛季苦工', 'luck-y': '天选之人',
  joker: '输了还在笑', shy: '隐身辅助', party: '全场MVP制造机',
  'than-k': '背锅侠', woc: '视野刺客', 'love-r': '一见钟情选手',
  'food-ie': '边打边吃', 'talk-er': '全频道广播',
};

// Mysti (灵鉴) tarot arcana names
const MYSTI_NAMES: Record<string, string> = {
  boss: 'The Emperor', nerd: 'The Hermit', ctrl: 'The Emperor', mum: 'The Empress',
  simp: 'The Empress', solo: 'The Hermit', sleep: 'The Star', 'game-r': 'The Devil',
  drunk: 'The Chariot', rebel: 'Justice', 'oh-no': 'The Emperor',
  'thin-k': 'The Emperor', drama: 'The Fool', chill: 'Wheel of Fortune',
  emo: 'The High Priestess', 'atm-er': 'The Empress', 'dior-s': 'The Hanged Man',
  sexy: 'The Devil', fake: 'The Devil', malo: 'Temperance', 'luck-y': 'The Sun',
  joker: 'The Fool', shy: 'The Hermit', party: 'The Fool', 'than-k': 'The Empress',
  woc: 'Judgement', 'love-r': 'The Lovers', 'food-ie': 'Strength',
  'talk-er': 'The Magician',
};

// Feng emoji mapping (since feng uses static assignment)
const FENG_EMOJI: Record<string, string> = {
  boss: '👔', nerd: '📚', ctrl: '🎯', mum: '🤱', simp: '🐕', solo: '🐺',
  sleep: '😴', 'game-r': '🎮', drunk: '🍺', rebel: '🔥', 'oh-no': '😱',
  'thin-k': '🧠', drama: '🎭', chill: '🧘', emo: '🌧️', 'atm-er': '💸',
  'dior-s': '🐸', sexy: '✨', fake: '🎭', malo: '🐒', 'luck-y': '🐟',
  joker: '🤡', shy: '🫣', party: '🎉', 'than-k': '🙏', woc: '🤯',
  'love-r': '💕', 'food-ie': '🍜', 'talk-er': '🗣️',
};

// Feng neon colors
const FENG_COLORS: Record<string, string> = {
  boss: '#39ff14', nerd: '#ff00ff', ctrl: '#00ffff', mum: '#ffff00',
  simp: '#ff4d00', solo: '#ff006e', sleep: '#8338ec', 'game-r': '#39ff14',
  drunk: '#ff00ff', rebel: '#00ffff', 'oh-no': '#ffff00', 'thin-k': '#ff4d00',
  drama: '#ff006e', chill: '#8338ec', emo: '#39ff14', 'atm-er': '#ff00ff',
  'dior-s': '#00ffff', sexy: '#ffff00', fake: '#ff4d00', malo: '#ff006e',
  'luck-y': '#8338ec', joker: '#39ff14', shy: '#ff00ff', party: '#00ffff',
  'than-k': '#ffff00', woc: '#ff4d00', 'love-r': '#ff006e', 'food-ie': '#8338ec',
  'talk-er': '#39ff14',
};

// Mysti emojis (tarot themed)
const MYSTI_EMOJI: Record<string, string> = {
  boss: '👑', nerd: '🔮', ctrl: '👑', mum: '🌹', simp: '🌹', solo: '🔮',
  sleep: '⭐', 'game-r': '⛓️', drunk: '🏛️', rebel: '⚖️', 'oh-no': '👑',
  'thin-k': '👑', drama: '🃏', chill: '☸️', emo: '🌙', 'atm-er': '🌹',
  'dior-s': '🙃', sexy: '⛓️', fake: '⛓️', malo: '☯️', 'luck-y': '☀️',
  joker: '🃏', shy: '🔮', party: '🃏', 'than-k': '🌹', woc: '📯',
  'love-r': '💝', 'food-ie': '🦁', 'talk-er': '🪄',
};

const UNIVERSES: UniverseConfig[] = [
  {
    id: 'wtfti',
    name: 'WTFTI 毒舌版',
    shortName: 'WTFTI',
    emoji: '🤯',
    accent: '#ef4444',
    testPath: '/wtfti/test/',
    resultPrefix: '/wtfti/result',
    getName: (s) => WTFTI_NAMES[s]?.name ?? s,
    getEmoji: (s) => WTFTI_NAMES[s]?.emoji ?? '❓',
    getColor: (s) => WTFTI_NAMES[s]?.color ?? '#666',
  },
  {
    id: 'banti',
    name: '班TI',
    shortName: '班TI',
    emoji: '💼',
    accent: '#0ea5e9',
    testPath: '/wtfti/work/test/',
    resultPrefix: '/wtfti/work/result',
    getName: (s) => BANTI_NAMES[s] ?? s,
    getEmoji: (s) => WTFTI_NAMES[s]?.emoji ?? '❓',
    getColor: (s) => WTFTI_NAMES[s]?.color ?? '#666',
  },
  {
    id: 'bird',
    name: '鸟TI',
    shortName: '鸟TI',
    emoji: '🐦',
    accent: '#38bdf8',
    testPath: '/bird/test/',
    resultPrefix: '/bird/result',
    getName: (s) => BIRD_NAMES[s] ?? s,
    getEmoji: (s) => {
      const birdEmojiMap: Record<string, string> = {
        boss: '🦅', nerd: '🦉', ctrl: '🐔', mum: '🕊️', simp: '🦚', solo: '🦢',
        sleep: '🦉', 'game-r': '🐦', drunk: '🦜', rebel: '🐧', 'oh-no': '🦆',
        'thin-k': '🦩', drama: '🐦‍⬛', chill: '🕊️', emo: '🦇', 'than-k': '🐦',
        woc: '🐦‍⬛', party: '🐓', 'talk-er': '🦜', 'love-r': '🦢', 'food-ie': '🐧',
        'atm-er': '🐦', 'dior-s': '🦚', sexy: '🦆', fake: '🐦', malo: '🦉',
        'luck-y': '🐦', joker: '🦜', shy: '🦉',
      };
      return birdEmojiMap[s] ?? '🐦';
    },
    getColor: () => '#38bdf8',
  },
  {
    id: 'delta',
    name: '三角TI',
    shortName: '三角',
    emoji: '🎯',
    accent: '#84cc16',
    testPath: '/wtfti/delta/test/',
    resultPrefix: '/wtfti/delta/result',
    getName: (s) => DELTA_NAMES[s] ?? s,
    getEmoji: (s) => {
      const d: Record<string, string> = {
        boss: '📡', nerd: '📊', ctrl: '⚡', mum: '💉', simp: '🏳️', solo: '🐺',
        sleep: '😴', 'game-r': '🔁', drunk: '🍺', rebel: '🔥', 'oh-no': '🔮',
        'thin-k': '🔧', drama: '💥', chill: '☕', emo: '💔', 'atm-er': '🛡️',
        'dior-s': '📸', sexy: '🌿', fake: '🎭', malo: '📋', 'luck-y': '🍀',
        joker: '🤡', shy: '🔇', party: '📢', 'than-k': '🏳️', woc: '🍿',
        'love-r': '🔄', 'food-ie': '🍜', 'talk-er': '📻',
      };
      return d[s] ?? '🎯';
    },
    getColor: () => '#84cc16',
  },
  {
    id: 'feng',
    name: '疯TI',
    shortName: '疯TI',
    emoji: '😈',
    accent: '#39ff14',
    testPath: '/wtfti/feng/test/',
    resultPrefix: '/wtfti/feng/result',
    getName: (s) => FENG_NAMES[s] ?? s,
    getEmoji: (s) => FENG_EMOJI[s] ?? '😈',
    getColor: (s) => FENG_COLORS[s] ?? '#39ff14',
  },
  {
    id: 'kings',
    name: '王者TI',
    shortName: '王者',
    emoji: '⚔️',
    accent: '#f59e0b',
    testPath: '/wtfti/kings/test/',
    resultPrefix: '/wtfti/kings/result',
    getName: (s) => KINGS_NAMES[s] ?? s,
    getEmoji: (s) => {
      const k: Record<string, string> = {
        boss: '⚔️', nerd: '📖', ctrl: '⏱️', mum: '💗', simp: '🦊', solo: '🦋',
        sleep: '🌙', 'game-r': '🎮', drunk: '🌃', rebel: '🗡️', 'oh-no': '👁️',
        'thin-k': '🧠', drama: '💥', chill: '🧘', emo: '🥀', 'atm-er': '🛡️',
        'dior-s': '🐼', sexy: '🌸', fake: '🎭', malo: '😮‍💨', 'luck-y': '🍀',
        joker: '🤡', shy: '👻', party: '🎉', 'than-k': '🙏', woc: '🔭',
        'love-r': '💘', 'food-ie': '🍜', 'talk-er': '📢',
      };
      return k[s] ?? '⚔️';
    },
    getColor: () => '#f59e0b',
  },
  {
    id: 'mysti',
    name: '灵鉴',
    shortName: '灵鉴',
    emoji: '🔮',
    accent: '#8b5cf6',
    testPath: '/wtfti/test/?mode=mysti',
    resultPrefix: '/mysti/result',
    getName: (s) => MYSTI_NAMES[s] ?? s,
    getEmoji: (s) => MYSTI_EMOJI[s] ?? '🔮',
    getColor: () => '#8b5cf6',
  },
];

// ─── Total possible count ─────────────────────────────────────────────────────

const TOTAL_POSSIBLE = UNIVERSES.length * ALL_SLUGS.length; // 7 * 29 = 203

// ─── External Store for Collection State ──────────────────────────────────────

let collectionSnapshot = getAllCollected();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return collectionSnapshot;
}

function getServerSnapshot() {
  return new Set<string>();
}

function refreshCollection() {
  collectionSnapshot = getAllCollected();
  listeners.forEach(l => l());
}

// ─── Card Component ──────────────────────────────────────────────────────────

interface CollectionCardProps {
  universe: UniverseConfig;
  slug: string;
  collected: boolean;
  index: number;
}

function CollectionCard({ universe, slug, collected, index }: CollectionCardProps) {
  const name = universe.getName(slug);
  const emoji = universe.getEmoji(slug);
  const color = universe.getColor(slug);

  const href = collected
    ? `${universe.resultPrefix}/${slug}/`
    : universe.testPath;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <Link
        href={withBasePath(href)}
        className="block group"
      >
        <div
          className={`
            relative rounded-xl overflow-hidden transition-all duration-300
            ${collected
              ? 'ring-1 ring-white/10 hover:ring-2 hover:scale-105 hover:shadow-lg'
              : 'opacity-40 hover:opacity-60'
            }
          `}
          style={collected ? { background: `linear-gradient(135deg, ${color}15, ${color}08)` } : { background: 'rgba(255,255,255,0.03)' }}
        >
          {/* Collected glow */}
          {collected && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 30%, ${color}20, transparent 70%)` }}
            />
          )}

          <div className="relative p-3 text-center">
            {/* Emoji */}
            <div className={`text-2xl mb-1.5 ${collected ? '' : 'grayscale opacity-20 blur-[2px]'}`}>
              {emoji}
            </div>

            {/* Name */}
            <p className={`text-[11px] leading-tight font-medium truncate ${collected ? 'text-white/90' : 'text-white/20'}`}>
              {collected ? name : '???'}
            </p>

            {/* Number badge for WTFTI */}
            {universe.id === 'wtfti' && collected && (
              <p className="text-[9px] text-white/40 mt-0.5">
                #{(ALL_SLUGS.indexOf(slug) + 1).toString().padStart(3, '0')}
              </p>
            )}
          </div>

          {/* Silhouette outline for uncollected */}
          {!collected && (
            <div className="absolute inset-0 rounded-xl border border-dashed border-white/10 pointer-events-none" />
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Universe Section Component ───────────────────────────────────────────────

interface UniverseSectionProps {
  universe: UniverseConfig;
  collectedSlugs: Set<string>;
}

function UniverseSection({ universe, collectedSlugs }: UniverseSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const count = ALL_SLUGS.filter(s => collectedSlugs.has(`${universe.id}:${s}`)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {/* Section header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-1 py-3 group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{universe.emoji}</span>
          <h2 className="text-base font-semibold text-white/90">{universe.name}</h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${universe.accent}20`, color: universe.accent }}
          >
            {count}/{ALL_SLUGS.length}
          </span>
        </div>
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 text-white/40 group-hover:text-white/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Progress bar */}
      <div className="px-1 mb-3">
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(count / ALL_SLUGS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${universe.accent}80, ${universe.accent})` }}
          />
        </div>
      </div>

      {/* Card grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {ALL_SLUGS.map((slug, i) => (
                <CollectionCard
                  key={`${universe.id}-${slug}`}
                  universe={universe}
                  slug={slug}
                  collected={collectedSlugs.has(`${universe.id}:${slug}`)}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

export function MystiCollectionContent() {
  const collected = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshCollection();
  }, []);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'mysti-collection') {
        refreshCollection();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const totalCount = mounted ? collected.size : 0;
  const progressPct = mounted ? (totalCount / TOTAL_POSSIBLE) * 100 : 0;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf610, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ef444410, transparent 70%)' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={withBasePath('/mysti/')}
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              ← 灵鉴
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white/95 mb-1">
            我的图鉴墙
          </h1>
          <p className="text-sm text-white/40">
            你的专属人格资产 · 跨宇宙全收集
          </p>
        </motion.div>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center text-lg">
                📊
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">图鉴进度</p>
                <p className="text-xs text-white/40">
                  {mounted ? `已收集 ${totalCount}` : '...'} / {TOTAL_POSSIBLE} 种人格
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: progressPct > 50 ? '#8b5cf6' : '#666' }}>
                {mounted ? Math.round(progressPct) : 0}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-rose-500"
            />
          </div>

          {/* Milestone hints */}
          <div className="flex justify-between mt-2 text-[10px] text-white/20">
            <span>0</span>
            <span className={totalCount >= 29 ? 'text-violet-400/60' : ''}>29 初窥</span>
            <span className={totalCount >= 100 ? 'text-violet-400/60' : ''}>100 小成</span>
            <span className={totalCount >= 203 ? 'text-amber-400/60' : ''}>203 全收集!</span>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-2 mb-10"
        >
          {UNIVERSES.slice(0, 4).map(u => {
            const count = mounted
              ? ALL_SLUGS.filter(s => collected.has(`${u.id}:${s}`)).length
              : 0;
            return (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"
              >
                <p className="text-lg mb-0.5">{u.emoji}</p>
                <p className="text-xs font-medium text-white/60">{u.shortName ?? u.name}</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {count}/{ALL_SLUGS.length}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Universe sections */}
        <div className="space-y-2">
          {UNIVERSES.map((universe, i) => (
            <UniverseSection
              key={universe.id}
              universe={universe}
              collectedSlugs={collected}
            />
          ))}
        </div>

        {/* CTA: Gacha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Link
            href={withBasePath('/mysti/gacha/')}
            className="block p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 to-rose-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">
                  🎴
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">每日抽卡</p>
                  <p className="text-xs text-white/40">免费抽取来自不同宇宙的灵魂卡牌</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </motion.div>

        {/* CTA: Take tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4"
        >
          <Link
            href={withBasePath('/')}
            className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all group text-center"
          >
            <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
              去做测试解锁更多人格 →
            </p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
