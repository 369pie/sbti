import type { Metadata } from 'next';
import { MyHerVoiceContent } from './MyHerVoiceContent';

export const metadata: Metadata = {
  title: '我的她说档案 · Her Voice',
  description: '你提交过的女性视角共建条目、被选入的通知与你收藏的书与 AI 卡。',
};

export const dynamic = 'force-dynamic';

export default function MyHerVoicePage() {
  return <MyHerVoiceContent />;
}
