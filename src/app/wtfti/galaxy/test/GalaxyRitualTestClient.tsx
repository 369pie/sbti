'use client';

import { useEffect, useState } from 'react';

import { PairInvitePreview } from '@/components/galaxy/PairInvitePreview';
import { RitualQuizRunner } from '@/components/galaxy/RitualQuizRunner';
import {
  loadGalaxySessionById,
  loadLatestGalaxySession,
  type GalaxySession,
} from '@/lib/wtfi/galaxy-session';

export function GalaxyRitualTestClient() {
  const [friendRaw, setFriendRaw] = useState<string | null>(null);
  const [startSoul, setStartSoul] = useState(false);
  const [resumeSession, setResumeSession] = useState<GalaxySession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const f = params.get('friend');
      const startSoulFlag = params.get('startSoul') === '1';
      const resultId = params.get('resultId');
      if (f) setFriendRaw(f);
      if (startSoulFlag) {
        const session = resultId
          ? loadGalaxySessionById(resultId)
          : loadLatestGalaxySession();
        if (session) {
          setStartSoul(true);
          setResumeSession(session);
        }
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <>
      {friendRaw && (
        <div style={{ padding: '24px 16px 0', maxWidth: 720, margin: '0 auto' }}>
          <PairInvitePreview raw={friendRaw} />
        </div>
      )}
      <RitualQuizRunner
        friendInvite={friendRaw}
        startSoul={startSoul}
        resumeSession={resumeSession}
      />
    </>
  );
}
