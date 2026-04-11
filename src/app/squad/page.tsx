import type { Metadata } from 'next';
import { Suspense } from 'react';
import SquadContent from './SquadContent';

export const metadata: Metadata = {
  title: '组局测试 — 看看你们这群人有多抽象 | SBTI',
  description: '拉上你的宿舍/闺蜜/同事一起测，生成群体抽象全家福。看看你们的摆烂指数、社恐浓度、内耗指数到底有多离谱。',
};

export default function SquadPage() {
  return (
    <Suspense>
      <SquadContent />
    </Suspense>
  );
}
