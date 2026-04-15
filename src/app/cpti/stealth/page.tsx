import type { Metadata } from 'next';
import { StealthContent } from './StealthContent';

export const metadata: Metadata = {
  title: '偷偷测CP感 — CP角色图鉴 CPTI',
  description: '不用发链接，根据你对TA的了解来偷偷测试你们的CP默契度。',
  robots: { index: false, follow: true },
};

export default function CptiStealthPage() {
  return <StealthContent />;
}
