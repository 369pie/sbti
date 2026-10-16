import type { Metadata } from 'next';
import { StarChartContent } from './StarChartContent';

export const metadata: Metadata = {
  title: '她的星图档案 · 内部预览 · WTFTI',
  description:
    '一份用命理引擎 v1 + 编辑部翻译草稿生成的「她的星图档案」预览。当前为内部 dogfood，公开发售在 W4 后期开放。',
};

export const dynamic = 'force-dynamic';

export default function StarChartPage() {
  return <StarChartContent />;
}
