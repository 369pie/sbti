'use client';

import { useSearchParams } from 'next/navigation';
import { CptiQuiz } from '@/components/CptiQuiz';

export function CptiQuizWrapper() {
  const searchParams = useSearchParams();
  const pairCodeId = searchParams.get('pairCodeId');
  const pairPartnerNickname = searchParams.get('partnerNickname');

  return <CptiQuiz pairCodeId={pairCodeId || undefined} pairPartnerNickname={pairPartnerNickname || undefined} />;
}
