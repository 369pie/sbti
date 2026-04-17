import type { Metadata } from 'next';
import CreatorAdminContent from './CreatorAdminContent';

export const metadata: Metadata = {
  title: '管理员 · UGC 宇宙审核 · WTFTI',
  robots: { index: false, follow: false },
};

export default function CreatorAdminPage() {
  return <CreatorAdminContent />;
}
