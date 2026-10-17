import type { Metadata } from 'next';

import { TreeholeModerationClient } from './TreeholeModerationClient';

export const metadata: Metadata = {
  title: '树洞审核 · 管理员 · WTFTI',
  description: '审核排队公开的树洞内容：通过后匿名可见，驳回则保持私密。',
  robots: { index: false, follow: false },
};

export default function TreeholeAdminPage() {
  return <TreeholeModerationClient />;
}
