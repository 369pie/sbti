import type { Metadata } from 'next';
import { AdminHermosaContent } from './AdminHermosaContent';

export const metadata: Metadata = {
  title: '管理员 · HERMOSA 她说 · WTFTI',
  robots: { index: false, follow: false },
};

export default function AdminHermosaPage() {
  return <AdminHermosaContent />;
}
