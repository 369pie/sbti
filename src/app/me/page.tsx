import type { Metadata } from 'next';
import { MeContent } from './MeContent';

export const metadata: Metadata = {
  title: '个人中心',
};

export default function MePage() {
  return <MeContent />;
}
