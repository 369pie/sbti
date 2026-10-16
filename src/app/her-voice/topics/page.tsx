import type { Metadata } from 'next';
import { TopicBuilderClient } from './TopicBuilderClient';

export const metadata: Metadata = {
  title: '发起主题征集 · Her Voice · WTFTI',
  description: '给女性创作者与 KOC 的 Her Voice 主题征集工具：生成共建链接、征集文案与回流入口。',
};

export const dynamic = 'force-dynamic';

export default function HerVoiceTopicsPage() {
  return <TopicBuilderClient />;
}