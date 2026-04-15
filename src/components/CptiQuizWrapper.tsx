'use client';

import { useSearchParams } from 'next/navigation';
import { CptiQuiz } from '@/components/CptiQuiz';

export function CptiQuizWrapper() {
  const searchParams = useSearchParams();
  const pairCodeId = searchParams.get('pairCodeId');
  const mode = searchParams.get('mode');

  return <CptiQuiz pairCodeId={pairCodeId || undefined} />;
}
