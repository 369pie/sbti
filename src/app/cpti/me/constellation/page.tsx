import type { Metadata } from 'next';
import CptiConstellationClient from './CptiConstellationClient';

export const metadata: Metadata = {
  title: 'CPTI 关系星图｜你和你身边人的星座连线',
  description: '把你测过的所有人和关系画成一张星图：每颗星是一个人，每条线是一段关系。',
};

export default function CptiConstellationPage() {
  return <CptiConstellationClient />;
}
