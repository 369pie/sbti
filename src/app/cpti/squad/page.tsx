import type { Metadata } from 'next';
import CptiSquadClient from './CptiSquadClient';

export const metadata: Metadata = {
  title: 'CPTI 闺蜜组｜4 个人，6 段关系，1 张组合人格图',
  description: '把你那群"互相吐槽但谁也离不开谁"的朋友拉进来，看看你们 6 段两两关系到底是什么戏。',
  openGraph: {
    title: 'CPTI 闺蜜组｜4 个人，6 段关系',
    description: '把你那群朋友拉进来，看看 6 段两两关系到底是什么戏。',
  },
};

export default function CptiSquadPage() {
  return <CptiSquadClient />;
}
