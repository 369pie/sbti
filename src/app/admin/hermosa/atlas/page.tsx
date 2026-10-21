import type { Metadata } from 'next';
import { AdminAtlasContent } from './AdminAtlasContent';

export const metadata: Metadata = {
  title: '管理员 · HERMOSA · ATLAS 投稿池',
  robots: { index: false, follow: false },
};

export default function AdminHermosaAtlasPage() {
  return <AdminAtlasContent />;
}