import type { Metadata } from 'next';
import { PillarBreadcrumb } from '@/components/PillarBreadcrumb';
import { HerVoiceContent } from './HerVoiceContent';

export const metadata: Metadata = {
  title: 'HER AURORA · 她的极光｜AI 时代女性价值社群',
  description:
    'HER AURORA · 她的极光是 WTFTI 面向高质量女性的 AI 时代价值社群：前沿 AI 资讯、变现机会、副业选品、行业避坑与女性资源共享。',
};

export const dynamic = 'force-dynamic';

export default function HerVoicePage() {
  return (
    <>
      <PillarBreadcrumb pillar="III" label="HER AURORA · 她的极光" hint="一起写下「极光星图」" />
      <HerVoiceContent />
    </>
  );
}
