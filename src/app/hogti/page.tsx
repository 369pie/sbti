import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';
import HogtiLandingContent from './HogtiLandingContent';

export const metadata: Metadata = {
  title: '霍格沃茨TI · 哈利波特人格测试 — 你是哪位 Hogwarts 同学？',
  description:
    '3 分钟情境题，把你对号入座到 15 位标志性 HP 角色 + 4 个学院。结果卡可直接发小红书 / 朋友圈。',
  keywords: [
    '霍格沃茨TI',
    '哈利波特人格测试',
    '哈利波特 MBTI',
    '分院帽测试',
    'Hogwarts Test',
    '霍格沃茨 分院',
    '人格测试',
    'WTFTI',
  ],
  alternates: { canonical: '/hogti/' },
  openGraph: {
    title: '霍格沃茨TI · 你是哪位 HP 角色？',
    description: '3 分钟分院，15 位角色等你对号入座。',
    url: getSiteUrl('/hogti/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: '霍格沃茨TI · 你是哪位 HP 角色？',
    description: '3 分钟分院，15 位角色等你对号入座。',
  },
};

export default function HogtiPage() {
  return <HogtiLandingContent />;
}
