'use client';

/**
 * StarSpiritCard · /today 星灵卡（V0：形态 + 光点罐 + 每日浇灌 + 连续夜数）
 * 提案 §3.2/§4：星灵住在 /today；数字长得像星象不像仪表盘。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { StarSpiritSprite } from '@/components/galaxy/StarSpiritSprite';
import { fetchStarSpirit, waterStarSpiritRemote } from '@/lib/wtfi/star-spirit-client';
import { EMPTY_SPIRIT_STATE, type StarSpiritState } from '@/lib/wtfi/star-spirit';
import { STARDUST_LETTERS } from '@/lib/wtfi/stardust-letters';
import { trackFunnelEvent } from '@/lib/analytics/funnel';

const GOLD = 'var(--color-gold-leaf, #C9A676)';
const ROSE = 'var(--color-rose, #C07A8E)';

export function StarSpiritCard({ personalitySlug }: { personalitySlug?: string | null }) {
  const [state, setState] = useState<StarSpiritState | null>(null);
  const [naming, setNaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [watering, setWatering] = useState(false);
  const [waterFlash, setWaterFlash] = useState(false);
  const earnedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (!cancelled) setState((prev) => prev ?? EMPTY_SPIRIT_STATE);
      void fetchStarSpirit().then((s) => {
        if (!cancelled && s) setState(s);
      });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // /today 签到 + 抽牌星尘（once-daily，服务端去重；首次即诞生星灵）
  useEffect(() => {
    if (earnedRef.current) return;
    earnedRef.current = true;
    import('@/lib/wtfi/star-spirit-client').then(({ tryEarnStarDust }) => {
      tryEarnStarDust('today', personalitySlug);
      tryEarnStarDust('card');
    });
    // 拿到星尘后刷新一次状态
    const t = setTimeout(() => {
      void fetchStarSpirit().then((s) => s && setState(s));
    }, 1800);
    return () => clearTimeout(t);
  }, [personalitySlug]);

  const handleWater = useCallback(async () => {
    if (watering) return;
    setWatering(true);
    const result = await waterStarSpiritRemote();
    if (result) {
      setState(result.state);
      if (result.watered) {
        setWaterFlash(true);
        setTimeout(() => setWaterFlash(false), 1400);
        try {
          trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/today-spirit-watered' });
        } catch {
          /* noop */
        }
      }
    }
    setWatering(false);
  }, [watering]);

  const s = state ?? EMPTY_SPIRIT_STATE;

  // 游历明信片（旅行青蛙化 v0）：日期种子决定今天带不带明信片（约 3 天一次），语录来自 stardust 卡池
  const postcard = useMemo(() => {
    if (!s.exists) return null;
    const d = new Date();
    const dayOfYear = Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86_400_000) + 1;
    const seed = d.getUTCFullYear() * 366 + dayOfYear;
    if (seed % 3 !== 0) return null;
    return STARDUST_LETTERS[seed % STARDUST_LETTERS.length];
  }, [s.exists]);

  return (
    <section
      aria-label="星灵"
      style={{
        marginBottom: 22,
        padding: '22px 24px',
        borderRadius: 16,
        border: '1px solid rgba(201,166,118,.22)',
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(156,124,255,.08), rgba(26,21,48,0) 60%), rgba(26,21,48,.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          width: 108,
          height: 108,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          transition: 'transform 1400ms cubic-bezier(0.22,1,0.36,1)',
          transform: waterFlash ? 'scale(1.12)' : 'scale(1)',
        }}
      >
        <StarSpiritSprite stage={s.stage} hue={s.hue} brightness={s.brightness} seed={s.personalitySlug ?? 'wtfti'} />
      </div>

      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ margin: 0, fontSize: 9.5, letterSpacing: 4, color: 'rgba(201,166,118,.75)', textTransform: 'uppercase', fontWeight: 600 }}>
          ✦ 我的电子小宠
        </p>

        {/* 名字 / 命名 */}
        {naming ? (
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <input
              value={nameDraft}
              autoFocus
              maxLength={12}
              placeholder="给它一个名字"
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setNaming(false);
              }}
              style={{
                flex: 1,
                maxWidth: 160,
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid rgba(201,166,118,.4)',
                background: 'rgba(20,15,42,.5)',
                color: '#F5F0E8',
                fontSize: 13,
                fontFamily: 'Noto Serif SC, serif',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={async () => {
                setNaming(false);
                if (!nameDraft.trim()) return;
                try {
                  const supabase = (await import('@/lib/supabase/client')).tryCreateBrowserSupabaseClient();
                  if (!supabase) return;
                  const { getOrCreateAnonymousSession } = await import('@/lib/supabase/auth');
                  if (!(await getOrCreateAnonymousSession(supabase)).success) return;
                  const res = await fetch('/api/wtfti/star-spirit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'name', name: nameDraft }),
                  });
                  if (res.ok) {
                    const data = (await res.json()) as { state?: StarSpiritState };
                    if (data.state) setState(data.state);
                  }
                } catch {
                  /* noop */
                }
              }}
              style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(201,166,118,.5)', background: 'rgba(201,166,118,.12)', color: '#F5F0E8', fontSize: 11, cursor: 'pointer' }}
            >
              好了
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(s.name ?? '');
              setNaming(true);
            }}
            style={{
              margin: '6px 0 4px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
              fontStyle: 'italic',
              fontSize: 21,
              color: '#F5F0E8',
            }}
          >
            {s.exists ? s.name || '小宠' : '小宠还没孵出来'}
          </button>
        )}

        <p style={{ margin: '2px 0 10px', fontSize: 11.5, color: 'rgba(245,240,232,.55)' }}>
          {s.exists ? (
            <>
              {s.stage.label} · {s.streakNights > 0 ? `亮了 ${s.streakNights} 夜` : '今夜等它点亮'}
              {s.earnedToday >= s.earnCap ? ' · 今晚的星空满了' : ''}
            </>
          ) : (
            '做完任意一个测试或仪式，它就会孵出来。'
          )}
        </p>

        {/* 游历明信片（旅行青蛙化 v0）：它出门转了一圈，带一张回来 */}
        {postcard && (
          <div
            style={{
              margin: '0 0 12px',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px dashed rgba(201,166,118,.35)',
              background: 'rgba(201,166,118,.06)',
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: 2, color: 'rgba(201,166,118,.8)' }}>
              ✦ 它出门转了一圈，带回一张明信片
            </p>
            <p style={{ margin: 0, fontSize: 13.5, fontStyle: 'italic', lineHeight: 1.7, fontFamily: 'Noto Serif SC, serif' }}>
              「{postcard.translation ?? postcard.quote}」
              <span style={{ display: 'block', marginTop: 4, fontSize: 10.5, fontStyle: 'normal', color: 'rgba(245,240,232,.5)' }}>
                — {postcard.author}
              </span>
            </p>
          </div>
        )}

        {/* 光点罐（星尘余额：满 10 呈现为整罐，超出以 ×N 计） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div aria-label={`星尘 ${s.stardust}`} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {Array.from({ length: Math.min(s.stardust, 10) }, (_, i) => (
              <span
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: GOLD,
                  boxShadow: '0 0 6px rgba(201,166,118,.55)',
                }}
              />
            ))}
            {s.stardust > 10 && (
              <span style={{ fontSize: 10.5, color: GOLD, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                ✦×{s.stardust}
              </span>
            )}
            {s.stardust === 0 && (
              <span style={{ fontSize: 10.5, color: 'rgba(245,240,232,.35)' }}>罐子还空着 · 仪式点亮它</span>
            )}
          </div>

          {s.exists && (
            <button
              type="button"
              onClick={handleWater}
              disabled={!s.canWater || watering}
              style={{
                marginLeft: 'auto',
                padding: '8px 18px',
                borderRadius: 999,
                border: `1px solid ${s.canWater ? 'rgba(201,166,118,.55)' : 'rgba(245,240,232,.15)'}`,
                background: s.canWater ? 'rgba(201,166,118,.14)' : 'transparent',
                color: s.canWater ? '#F5F0E8' : 'rgba(245,240,232,.4)',
                fontSize: 11.5,
                letterSpacing: 3,
                cursor: s.canWater && !watering ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
              }}
            >
              {s.alreadyWateredToday
                ? '今天喂过了 ✦'
                : s.stardust < 1
                  ? '得先攒一点星尘'
                  : watering
                    ? '…'
                    : '喂一点 · Feed'}
            </button>
          )}
        </div>
        {!s.exists && (
          <p style={{ margin: '8px 0 0', fontSize: 10.5, color: 'rgba(245,240,232,.35)' }}>
            星尘来自你的仪式：签到 · 抽牌 · 写心情 · 封信 · 月相 · 合奏（每日至多十点）
          </p>
        )}
      </div>
      <span aria-hidden style={{ display: 'none', color: ROSE }} />
    </section>
  );
}
