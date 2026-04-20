import type { Metadata } from 'next';
import { AdminFunnelContent } from './AdminFunnelContent';

export const metadata: Metadata = {
  title: '管理员 · 漏斗 · WTFTI',
  robots: { index: false, follow: false },
};

export default function AdminFunnelPage() {
  return <AdminFunnelContent />;
}
