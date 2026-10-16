import type { Metadata } from 'next';
import { AdminAuroraContent } from './AdminAuroraContent';

export const metadata: Metadata = {
  title: '管理员 · HERMOSA · AURORA 治理 · WTFTI',
  robots: { index: false, follow: false },
};

export default function AdminHermosaAuroraPage() {
  return <AdminAuroraContent />;
}
