import type { Metadata } from 'next';
import { SalonRedirect } from './SalonRedirect';

export const metadata: Metadata = {
  title: '管理员 · HERMOSA · AURORA 治理',
  robots: { index: false, follow: false },
};

// HER AURORA · W3 · 旧路径 /admin/hermosa/salon/ → /admin/hermosa/aurora/
// 仅保留客户端跳转，避免外部书签 / 内部旧链接 404。
export default function AdminHermosaSalonRedirectPage() {
  return <SalonRedirect />;
}
