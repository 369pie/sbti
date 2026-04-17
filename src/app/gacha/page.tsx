import type { Metadata } from 'next';
import GachaContent from './GachaContent';

export const metadata: Metadata = {
  title: '今日抽签 · Daily Gacha · WTFTI',
  description: '每天一抽，看宇宙今天给你什么。S/A/B/C/D 稀有度，集齐你的 WTF Card。',
};

export default function GachaPage() {
  return <GachaContent />;
}
