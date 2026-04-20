import type { Metadata } from 'next';
import { HerVoiceContent } from './HerVoiceContent';

export const metadata: Metadata = {
  title: 'HERMOSA · 她的话 · WTFTI',
  description:
    '一面只让女性安静说话的涂鸦黑板字报墙。做完任意 WTFTI 测试，留下一句话，被同型号姐妹读到。',
};

export const dynamic = 'force-dynamic';

export default function HerVoicePage() {
  return <HerVoiceContent />;
}
