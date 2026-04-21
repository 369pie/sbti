import type { Metadata } from 'next';
import CptiFunnelClient from './CptiFunnelClient';

export const metadata: Metadata = {
  title: 'CPTI Funnel · Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function CptiAdminFunnelPage() {
  return <CptiFunnelClient />;
}
