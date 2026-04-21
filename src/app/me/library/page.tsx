import type { Metadata } from 'next';
import { LibraryClient } from './LibraryClient';

export const metadata: Metadata = {
  title: '我的解锁库 · SBTI',
  description: '统一浏览 XPTI / SoulTI / CPTI / WTFTI 各模块付费解锁的内容。',
};

export default function MyLibraryPage() {
  return <LibraryClient />;
}
