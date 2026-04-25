'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { recordUnlock, isSubscriptionSku, type MystiSku } from '@/lib/mysti/unlock';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import { upsertGiftCard, type GiftCardGiftSku } from '@/lib/mysti/gift-card';
import { recordSubscription, syncSubscriptionFromServer } from '@/lib/mysti/subscription';
import { trackMystiEvent } from '@/lib/mysti/analytics';

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function ReturnContent() {
  const router = useRouter();
  const search = useSearchParams();
  const { theme } = useMystiTheme();
  const hasOrderId = Boolean(search.get('orderId') || search.get('trade_order_id'));
  const [status, setStatus] = useState<'verifying' | 'paid' | 'pending' | 'failed'>('verifying');

  useEffect(() => {
    const orderId = search.get('orderId') || search.get('trade_order_id') || '';
    const initialSku = (search.get('sku') as MystiSku | null) || null;
    const initialResourceId = search.get('resourceId') || '';
    const stub = search.get('stub') === '1' ? '1' : '';
    const initialRedirect = search.get('redirect') || '/mysti/';
    if (!orderId) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      for (let attempt = 0; attempt < 24; attempt += 1) {
        try {
          const url =
            `/api/mysti/payment/verify?orderId=${encodeURIComponent(orderId)}` +
            `${stub ? '&stub=1' : ''}&attempt=${attempt}`;
          const response = await fetch(url, { cache: 'no-store' });
          const data = (await response.json()) as {
            paid?: boolean;
            pending?: boolean;
            token?: string;
            sku?: MystiSku;
            resourceId?: string;
            redirect?: string | null;
            subscription?: {
              sku: MystiSku;
              startsAt: number;
              expiresAt: number;
              status: string;
            } | null;
            giftCard?: {
              code: string;
              giftSku: GiftCardGiftSku;
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

          if (!response.ok && data.pending !== true) {
            if (response.status === 429 || response.status >= 500) {
              await wait(1600);
              continue;
            }
            setStatus('failed');
            return;
          }

          const sku = data.sku ?? initialSku;
          const resourceId = data.resourceId ?? initialResourceId;
          const redirect = data.redirect ?? initialRedirect;

          if (data.paid) {
            if (!sku) {
              setStatus('failed');
              return;
            }

            // 订阅类——另外记录到会员仓储
            if (isSubscriptionSku(sku)) {
              const serverSub = data.subscription;
              recordSubscription({
                sku,
                orderId,
                startAt: serverSub?.startsAt ?? Date.now(),
                expiresAt: serverSub?.expiresAt,
                token: data.token,
              });
              // Cross-device cache refresh
              syncSubscriptionFromServer({ force: true }).catch(() => {});
              try {
                trackMystiEvent('mysti_subscribe_success', { sku, orderId });
              } catch {
                /* noop */
              }
            } else {
              if (!resourceId) {
                setStatus('failed');
                return;
              }

              recordUnlock({
                sku,
                resourceId,
                orderId,
                unlockedAt: Date.now(),
                token: data.token,
              });
              try {
                trackMystiEvent('mysti_paywall_success', { sku, resourceId, orderId });
              } catch {
                /* noop */
              }
            }

            if (
              (sku === 'gift-card' ||
                sku === 'festival-gift-card' ||
                sku === 'besties-bundle') &&
              data.giftCard?.code
            ) {
              upsertGiftCard(data.giftCard);
              try {
                trackMystiEvent('mysti_gift_purchase_success', { sku, code: data.giftCard.code });
              } catch {
                /* noop */
              }
              setStatus('paid');
              window.setTimeout(
                () => router.replace(`/mysti/gift/?issued=${encodeURIComponent(data.giftCard!.code)}`),
                1200,
              );
              return;
            }

            setStatus('paid');
            window.setTimeout(() => router.replace(redirect || '/mysti/'), 1200);
            return;
          }

          if (!data.pending) {
            setStatus('failed');
            return;
          }

          if (attempt === 8) {
            setStatus('pending');
          }
        } catch {
          // retry below
        }

        await wait(1600);
      }

      if (!cancelled) {
        setStatus('pending');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, search]);

  const displayStatus = hasOrderId ? status : 'failed';

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
      {displayStatus === 'verifying' && <p>正在确认你的支付……</p>}
      {displayStatus === 'paid' && (
        <p style={{ color: theme.accentGold }}>支付成功，正在为你打开内容</p>
      )}
      {displayStatus === 'pending' && (
        <>
          <p style={{ color: theme.accentGold }}>支付已提交，通道仍在同步订单</p>
          <p className="mt-3 max-w-xs text-center text-sm opacity-75">
            如果你已经扣款，订单会自动补发解锁。可以稍后刷新本页再确认。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 rounded-full text-sm"
            style={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.accent,
              color: theme.accent,
            }}
          >
            重新确认
          </button>
        </>
      )}
      {displayStatus === 'failed' && (
        <>
          <p style={{ color: 'var(--color-accent-light)' }}>验证失败，请稍后重试</p>
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
        <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
          <p>加载中…</p>
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  );
}
