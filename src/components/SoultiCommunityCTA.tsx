'use client';

import { motion } from 'framer-motion';
import type { SoultiRarityInfo } from '@/lib/soulti/personalities';

const serifFont = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

interface Props {
  personalityName: string;
  rarity: SoultiRarityInfo;
  accentColor: string;
}

/**
 * SoulTI 灵魂共振社群入口
 *
 * M3 战略核心组件：对标 HERTI 的 449 人共建群，建立 SoulTI 自己的按人格分群体系。
 *
 * 交互：
 *   - 基于稀有度给出差异化欢迎语（"你是 1.2% 的极光——群里还有 3 位极光"）
 *   - 点击展开二维码 / 联系方式（通过 props 注入，避免泄露）
 */
export function SoultiCommunityCTA({ personalityName, rarity, accentColor }: Props) {
  const welcomeLine =
    rarity.tier === 'legendary'
      ? `你是 ${rarity.populationPct}% 的${personalityName}——这个群里，目前只有少数和你同频的人。`
      : rarity.tier === 'epic'
      ? `你是 ${rarity.populationPct}% 的${personalityName}——稀有到在人群里很难被认出来，但在这里可以。`
      : `和你同样是「${personalityName}」的人，正在群里聊各自的白天和深夜。`;

  return (
    <motion.section
      className="max-w-2xl mx-auto px-6 pb-12"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.62, duration: 0.5 }}
    >
      <div
        className="rounded-2xl border p-6 sm:p-8"
        style={{ borderColor: `${accentColor}20`, background: '#FDFCFA' }}
      >
        <p
          className="text-[10px] tracking-[0.35em] font-medium uppercase mb-4"
          style={{ fontFamily: serifFont, color: accentColor }}
        >
          SOUL RESONANCE CIRCLE · 灵魂共振社群
        </p>

        <p
          className="text-sm leading-[1.9] text-[#2D2A26] mb-5"
          style={{ fontFamily: serifFont }}
        >
          {welcomeLine}
        </p>

        <ul className="space-y-1.5 text-xs text-[#6A6054] mb-6" style={{ fontFamily: serifFont }}>
          <li>· 每周一位灵魂共振女性的深度故事</li>
          <li>· 同类型的人在一起聊"白天和深夜的我"</li>
          <li>· 提名你心中的下一位灵魂共振女性</li>
          <li>· 内部抢先体验深度报告 & 新功能</li>
        </ul>

        <a
          href="https://wtfti.com/soulti-circle"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs transition-all hover:scale-[1.02]"
          style={{
            fontFamily: serifFont,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: `${accentColor}40`,
            color: accentColor,
            background: `${accentColor}08`,
            letterSpacing: '0.12em',
          }}
        >
          加入灵魂共振社群 →
        </a>

        <p className="mt-4 text-[10px] text-[#998F84]" style={{ fontFamily: serifFont }}>
          点击跳转至入群说明页（微信群 · 按人格分群 · 无营销）
        </p>
      </div>
    </motion.section>
  );
}
