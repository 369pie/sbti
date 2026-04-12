import type { Metadata } from 'next';
import { DAILY_STATUS_TYPES } from '@/lib/daily/statuses';
import { DRUNK_PERSONA_TYPES } from '@/lib/drunk/personas';
import { LOVE_PERSONALITY_TYPES } from '@/lib/love/personalities';
import { PERSONALITY_TYPES } from '@/lib/personalities';
import { WTFTI_PERSONALITIES } from '@/lib/wtfti-personalities';
import { WORK_PERSONALITY_TYPES } from '@/lib/work/personalities';
import TypesContent from './TypesContent';

const STANDARD_GALLERY_TOTAL =
  PERSONALITY_TYPES.length +
  WTFTI_PERSONALITIES.length +
  LOVE_PERSONALITY_TYPES.length +
  WORK_PERSONALITY_TYPES.length +
  DAILY_STATUS_TYPES.length +
  DRUNK_PERSONA_TYPES.length;

const STANDARD_GALLERY_SERIES = [
  PERSONALITY_TYPES,
  WTFTI_PERSONALITIES,
  LOVE_PERSONALITY_TYPES,
  WORK_PERSONALITY_TYPES,
  DAILY_STATUS_TYPES,
  DRUNK_PERSONA_TYPES,
].length;

export const metadata: Metadata = {
  title: `SBTI 全人格图鉴馆 — ${STANDARD_GALLERY_TOTAL} 张抽象人设卡`,
  description:
    `浏览 SBTI 全部 ${STANDARD_GALLERY_TOTAL} 张抽象人设卡：人格图鉴、WTFTI、恋爱人格、职场人格、今日状态、酒后人设，${STANDARD_GALLERY_SERIES} 个系列一次刷完。`,
  alternates: { canonical: '/types/' },
};

export default function Page() {
  return <TypesContent />;
}
