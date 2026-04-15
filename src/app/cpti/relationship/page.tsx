import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CptiRelationshipResult } from './CptiRelationshipResult';

export const metadata: Metadata = {
  title: 'CP关系鉴定结果 — CPTI',
  description: '你们是25种CP关系类型中的哪一种？查看你们的关系鉴定结果。',
  robots: { index: false, follow: false },
};

export default function CptiRelationshipPage() {
  return (
    <Suspense>
      <CptiRelationshipResult />
    </Suspense>
  );
}
