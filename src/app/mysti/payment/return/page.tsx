'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { recordUnlock, type MystiSku } from '@/lib/mysti/unlock';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { upsertGiftCard } from '@/lib/mysti/gift-card';

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function ReturnContent() {
  const router = useRouter();
  const search = useSearchParams();
  const { theme } = useMystiTheme();
  const [status, setStatus] = useState<'verifying' | 'paid' | 'failed'>('verifying');

  useEffect(() => {
    const orderId = search.get('orderId') || search.get('trade_order_id') || '';
    const sku = (search.get('sku') as MystiSku | null) || null;
    const resourceId = search.get('resourceId') || '';
    const stub = search.get('stub') === '1' ? '1' : '';
    const redirect = search.get('redirect') || '/mysti/';
    if (!orderId || !sku || !resourceId) {
      setStatus('failed');
      return;
    }

    let cancelled = false;

    const run = async () => {
      const url = `/api/mysti/payment/verify?orderId=${encodeURIComponent(orderId)}${stub ? '&stub=1' : ''}`;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const response = await fetch(url, { cache: 'no-store' });
          const data = (await response.json()) as {
            paid?: boolean;
            pending?: boolean;
            token?: string;
            giftCard?: {
              code: string;
              giftSku: Exclude<MystiSku, 'gift-card'>;
              fromName?: string;
              toName?: string;
              message?: string;
              createdAt: number;
              redeemed: boolean;
              redeemedAt?: number;
              redeemedResourceId?: string;
            };
          };

          if (cancelled) return;

          if (data.paid) {
            recordUnlock({
              sku,
              resourceId,
              orderId,
              unlockedAt: Date.now(),
              token: data.token,
            });

            if (sku === 'gift-card' && data.giftCard?.code) {
              upsertGiftCard(data.giftCard);
              setStatus('paid');
              window.setTimeout(
                () => router.replace(`/mysti/gift/?issued=${encodeURIComponent(data.giftCard!.code)}`),
                1200,
              );
              return;
            }

            setStatus('paid');
            window.setTimeout(() => router.replace(redirect), 1200);
            return;
          }

          if (!data.pending) {
            setStatus('failed');
            return;
          }
        } catch {
          // retry below
        }

        await wait(1200);
      }

      if (!cancelled) {
        setStatus('failed');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, search]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
        color: theme.text,
      }}
    >
      <div
        className="text-5xl mb-4"
        style={{ color: theme.accentGold, fontFamily: 'var(--font-display)' }}
      >
        ✦
      </div>
      {status === 'verifying' && <p>正在确认你的支付……</p>}
      {status === 'paid' && (
        <p style={{ color: theme.accentGold }}>支付成功，正在为你打开内容</p>
      )}
      {status === 'failed' && (
        <>
          <p style={{ color: '#FFB1B1' }}>验证失败，请稍后重试</p>
          <button
            onClick={() => router.replace('/mysti/')}
            className="mt-4 px-5 py-2 rounded-full text-sm"
            style={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.accent,
              color: theme.accent,
            }}
          >
            返回灵鉴
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0B0D17] text-[#F3EFE6]">
          <p>加载中…</p>
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  );
}
