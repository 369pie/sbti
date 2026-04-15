import { Suspense } from 'react';
import LeaderboardContent from './LeaderboardContent';

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted">加载中...</div>}>
      <LeaderboardContent />
    </Suspense>
  );
}
