import type { Metadata } from 'next';
import { WtftiSymptomsHub } from './WtftiSymptomsHub';

export const metadata: Metadata = {
  title: '症状清单 — WTFTI 29 种人格隐藏症状',
  description:
    '不用做完整测试，直接对着症状清单打勾。29 种 WTF 人格的隐藏症状，看看你中了几枪。',
  alternates: { canonical: '/wtfti/symptoms/' },
  openGraph: {
    title: '你中了几枪？— WTFTI 症状清单',
    description: '29 种 WTF 人格的隐藏症状清单，对号入座打勾就行',
  },
};

export default function WtftiSymptomsPage() {
  return <WtftiSymptomsHub />;
}
