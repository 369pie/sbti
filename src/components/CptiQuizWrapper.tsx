'use client';

import { useSearchParams } from 'next/navigation';
import { CptiQuiz } from '@/components/CptiQuiz';
import { isRelationshipResultIntent, parseCptiPricingIntent } from '@/lib/cpti/pricing-intents';

export function CptiQuizWrapper() {
  const searchParams = useSearchParams();
  const pairCodeId = searchParams.get('pairCodeId');
  const pairPartnerNickname = searchParams.get('partnerNickname');
  const intent = parseCptiPricingIntent(searchParams.get('intent'));

  return (
    <CptiQuiz
      pairCodeId={pairCodeId || undefined}
      pairPartnerNickname={pairPartnerNickname || undefined}
      pricingIntent={isRelationshipResultIntent(intent) ? intent : undefined}
    />
  );
}
