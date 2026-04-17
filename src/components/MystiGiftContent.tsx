'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMystiTheme } from '@/components/MystiThemeProvider';
import {
  GIFT_CARD_OPTIONS,
  createGiftCard,
  getGiftCardByCode,
  getGiftCards,
  redeemGiftCard,
  upsertGiftCard,
  type GiftCard,
} from '@/lib/mysti/gift-card';
import { recordUnlock, SKU_PRICES } from '@/lib/mysti/unlock';
import { getActiveReferralCode } from '@/lib/mysti/creator-referral';
import { trackMystiEvent } from '@/lib/mysti/analytics';

type Tab = 'buy' | 'mine' | 'redeem';

export function MystiGiftContent() {
  const { theme } = useMystiTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';
  const issuedCode = searchParams.get('issued') ?? '';
  const [tab, setTab] = useState<Tab>(issuedCode ? 'mine' : initialCode ? 'redeem' : 'buy');
  const [hydrated, setHydrated] = useState(false);
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [issuedCard, setIssuedCard] = useState<GiftCard | null>(null);

  useEffect(() => {
    setCards(getGiftCards());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!issuedCode) return;
    const local = getGiftCardByCode(issuedCode);
    if (local) {
      setIssuedCard(local);
      return;
    }

    let cancelled = false;
    fetch(`/api/mysti/gift-card?code=${encodeURIComponent(issuedCode)}`, {
      cache: 'no-store',
    })
      .then(async response => {
        if (!response.ok) return null;
        const data = (await response.json()) as { card?: GiftCard };
        return data.card ?? null;
      })
      .then(card => {
        if (cancelled || !card) return;
        upsertGiftCard(card);
        setCards(getGiftCards());
        setIssuedCard(card);
      })
      .catch(() => {
        // noop
      });

    return () => {
      cancelled = true;
    };
  }, [issuedCode]);

  return (
    <div
      className="min-h-screen px-5 py-12"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 100%)`,
        color: theme.text,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link
            href="/mysti/"
            className="text-xs tracking-[0.18em] uppercase opacity-70 hover:opacity-100"
            style={{ color: theme.textMuted }}
          >
            ← 灵鉴首页
          </Link>
          <h1
            className="mt-3 text-3xl sm:text-4xl"
            style={{ color: theme.text, fontFamily: 'var(--font-display)' }}
          >
            灵魂礼品卡
          </h1>
          <p className="mt-3 text-sm" style={{ color: theme.textMuted }}>
            ¥{SKU_PRICES['gift-card'].price.toFixed(1)} · 把灵魂内容作为礼物送给 TA
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(
            [
              ['buy', '购买送朋友'],
              ['mine', '我购买的'],
              ['redeem', '使用兑换码'],
            ] as Array<[Tab, string]>
          ).map(([id, label]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="px-4 py-2 rounded-full text-xs transition-all"
                style={{
                  background: active ? theme.accentSoft : 'transparent',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: active ? theme.accent : theme.cardBorder,
                  color: active ? theme.accent : theme.textMuted,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {issuedCard && (
          <div className="mb-8">
            <IssuedCardView card={issuedCard} />
          </div>
        )}

        {hydrated && tab === 'buy' && <BuyTab onPurchased={card => {
          setCards(getGiftCards());
          setIssuedCard(card);
        }} />}
        {hydrated && tab === 'mine' && <MineTab cards={cards} onRedeem={() => setCards(getGiftCards())} />}
        {hydrated && tab === 'redeem' && (
          <RedeemTab
            initialCode={initialCode}
            onRedeemed={() => {
              setCards(getGiftCards());
              router.replace('/mysti/gift/');
            }}
          />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────── BUY ──────────────────────────────

function BuyTab({ onPurchased }: { onPurchased: (card: GiftCard) => void }) {
  const { theme } = useMystiTheme();
  const [pickedSku, setPickedSku] = useState<(typeof GIFT_CARD_OPTIONS)[number]['giftSku']>(
    'soul-letter',
  );
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedCard, setIssuedCard] = useState<GiftCard | null>(null);

  const meta = SKU_PRICES['gift-card'];

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const ref = getActiveReferralCode() || undefined;
      // resourceId = gift-<random>，唯一标识本张卡的支付订单
      const giftId = `gift-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: 'gift-card',
          resourceId: giftId,
          paymentType,
          ref,
          redirect: '/mysti/gift/',
          metadata: { giftSku: pickedSku, fromName, toName, message },
        }),
      });
      const data = (await res.json()) as {
        url?: string;
        orderId?: string;
        stub?: boolean;
        error?: string;
      };
      if (!res.ok || !data.url || !data.orderId) {
        throw new Error(data.error || 'create_failed');
      }

      if (data.stub) {
        // Stub 模式直接发卡
        const card = createGiftCard({
          giftSku: pickedSku,
          fromName: fromName || undefined,
          toName: toName || undefined,
          message: message || undefined,
        });
        recordUnlock({
          sku: 'gift-card',
          resourceId: giftId,
          orderId: data.orderId,
          unlockedAt: Date.now(),
        });
        try {
          trackMystiEvent('mysti_test_complete', {
            kind: 'gift_purchase_stub',
            giftSku: pickedSku,
            code: card.code,
          });
        } catch {/* noop */}
        setIssuedCard(card);
        onPurchased(card);
        return;
      }

      // Live 模式：支付成功后由 /mysti/payment/return → verify → 服务端签发礼品卡。
      window.location.href = data.url;
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  if (issuedCard) {
    return <IssuedCardView card={issuedCard} />;
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: `${theme.cardSurface}aa`,
        borderColor: theme.cardBorder,
      }}
    >
      <div className="text-xs tracking-[0.16em] uppercase mb-4" style={{ color: theme.accent }}>
        Step 1 · 选择礼物内容
      </div>
      <div className="grid sm:grid-cols-3 gap-2 mb-6">
        {GIFT_CARD_OPTIONS.map(opt => {
          const active = pickedSku === opt.giftSku;
          return (
            <button
              key={opt.giftSku}
              onClick={() => setPickedSku(opt.giftSku)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                background: active ? theme.accentSoft : 'transparent',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: active ? theme.accent : theme.cardBorder,
                color: theme.text,
              }}
            >
              <div className="text-2xl mb-1">{opt.emoji}</div>
              <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                {opt.label}
              </div>
              <div className="text-[11px] mt-1" style={{ color: theme.textMuted }}>
                {opt.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-xs tracking-[0.16em] uppercase mb-4" style={{ color: theme.accent }}>
        Step 2 · 自定义贺卡
      </div>
      <div className="space-y-3 mb-6">
        <Input
          label="送礼人"
          value={fromName}
          onChange={setFromName}
          placeholder="你的昵称"
          theme={theme}
        />
        <Input
          label="收礼人"
          value={toName}
          onChange={setToName}
          placeholder="TA 的昵称"
          theme={theme}
        />
        <div>
          <label className="block text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: theme.textSubtle }}>
            贺卡留言
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, 100))}
            placeholder="一段只有你们懂的话"
            rows={3}
            className="w-full rounded-lg border p-3 text-sm bg-transparent focus:outline-none"
            style={{ borderColor: theme.divider, color: theme.text }}
          />
          <div className="text-[10px] mt-1 text-right" style={{ color: theme.textSubtle }}>
            {message.length}/100
          </div>
        </div>
      </div>

      <div className="text-xs tracking-[0.16em] uppercase mb-4" style={{ color: theme.accent }}>
        Step 3 · 支付方式
      </div>
      <div className="flex gap-2 mb-6">
        {(['wechat', 'alipay'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPaymentType(p)}
            className="px-4 py-2 rounded-full text-xs transition-all"
            style={{
              background: paymentType === p ? theme.accentSoft : 'transparent',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: paymentType === p ? theme.accent : theme.cardBorder,
              color: paymentType === p ? theme.accent : theme.textMuted,
            }}
          >
            {p === 'wechat' ? '微信支付' : '支付宝'}
          </button>
        ))}
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm tracking-wider transition-all hover:scale-[1.01] disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
          color: '#fff',
          fontFamily: 'var(--font-serif)',
          boxShadow: `0 8px 24px ${theme.cardGlow}`,
        }}
      >
        {loading ? '正在创建订单…' : `✦ 购买礼品卡 · ¥${meta.price.toFixed(1)}`}
      </button>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs text-center"
            style={{ color: '#FFB1B1' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  theme,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  theme: ReturnType<typeof useMystiTheme>['theme'];
}) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: theme.textSubtle }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value.slice(0, 24))}
        placeholder={placeholder}
        className="w-full rounded-lg border p-2.5 text-sm bg-transparent focus:outline-none"
        style={{ borderColor: theme.divider, color: theme.text }}
      />
    </div>
  );
}

function IssuedCardView({ card }: { card: GiftCard }) {
  const { theme } = useMystiTheme();
  const [copied, setCopied] = useState(false);
  const opt = GIFT_CARD_OPTIONS.find(o => o.giftSku === card.giftSku);
  const link = typeof window !== 'undefined' ? `${window.location.origin}/mysti/gift/?code=${card.code}` : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {/* noop */}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 text-center"
      style={{
        background: `${theme.cardSurface}aa`,
        borderColor: theme.cardBorder,
      }}
    >
      <div className="text-4xl mb-2">{opt?.emoji ?? '✦'}</div>
      <h3 className="text-xl mb-1" style={{ color: theme.text, fontFamily: 'var(--font-display)' }}>
        礼品卡已生成
      </h3>
      <p className="text-xs mb-5" style={{ color: theme.textMuted }}>
        把下面的兑换码或链接发给 TA，扫码即可解锁
      </p>
      <div
        className="font-mono text-base tracking-wider px-4 py-3 rounded-xl mb-3 break-all"
        style={{
          background: theme.accentSoft,
          color: theme.accent,
          border: `1px dashed ${theme.cardBorder}`,
        }}
      >
        {card.code}
      </div>
      <button
        onClick={copy}
        className="w-full py-3 rounded-xl text-sm"
        style={{
          background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
          color: '#fff',
        }}
      >
        {copied ? '已复制 ✓' : '复制兑换链接'}
      </button>
      <p className="mt-4 text-[11px]" style={{ color: theme.textSubtle }}>
        也可在「我购买的」页签随时找回
      </p>
    </motion.div>
  );
}

// ────────────────────────────── MINE ──────────────────────────────

function MineTab({ cards, onRedeem: _onRedeem }: { cards: GiftCard[]; onRedeem: () => void }) {
  const { theme } = useMystiTheme();
  if (cards.length === 0) {
    return (
      <div
        className="rounded-2xl border p-10 text-center"
        style={{ background: `${theme.cardSurface}aa`, borderColor: theme.cardBorder }}
      >
        <div className="text-3xl mb-2">🎁</div>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          还没有购买过礼品卡
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {cards.map(c => {
        const opt = GIFT_CARD_OPTIONS.find(o => o.giftSku === c.giftSku);
        return (
          <li
            key={c.code}
            className="rounded-xl border p-4"
            style={{ background: `${theme.cardSurface}aa`, borderColor: theme.cardBorder }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{opt?.emoji ?? '✦'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
                  <span>{opt?.label ?? c.giftSku}</span>
                  {c.redeemed ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: theme.divider, color: theme.textMuted }}>
                      已兑换
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: theme.accentSoft, color: theme.accent }}>
                      未使用
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs mt-1 tracking-wider break-all" style={{ color: theme.textMuted }}>
                  {c.code}
                </div>
                {c.toName && (
                  <div className="text-[11px] mt-1" style={{ color: theme.textSubtle }}>
                    送给：{c.toName}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ────────────────────────────── REDEEM ──────────────────────────────

function RedeemTab({
  initialCode,
  onRedeemed,
}: {
  initialCode: string;
  onRedeemed: () => void;
}) {
  const { theme } = useMystiTheme();
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<GiftCard | null>(null);
  const [redeemed, setRedeemed] = useState<GiftCard | null>(null);

  const handleLookup = async () => {
    setError(null);
    const normalized = code.trim().toUpperCase();
    try {
      const response = await fetch(`/api/mysti/gift-card?code=${encodeURIComponent(normalized)}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = (await response.json()) as { card?: GiftCard };
        if (data.card) {
          upsertGiftCard(data.card);
          setCard(data.card);
          return;
        }
      }
    } catch {
      // fallback below
    }

    const local = getGiftCardByCode(normalized);
    if (!local) {
      setError('未找到该兑换码');
      setCard(null);
      return;
    }
    setCard(local);
  };

  const handleRedeem = async () => {
    if (!card) return;

    const fallbackResourceId =
      card.giftSku === 'monthly-report'
        ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        : `gift-${card.code}`;

    try {
      const response = await fetch('/api/mysti/gift-card/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: card.code,
          giftSku: card.giftSku,
          resourceId: card.redeemedResourceId ?? fallbackResourceId,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { card?: GiftCard; resourceId?: string };
        if (data.card) {
          upsertGiftCard(data.card);
          recordUnlock({
            sku: data.card.giftSku,
            resourceId: data.resourceId ?? data.card.redeemedResourceId ?? fallbackResourceId,
            orderId: `gift-${data.card.code}`,
            unlockedAt: Date.now(),
          });
          setRedeemed(data.card);
          onRedeemed();
          return;
        }
      }
    } catch {
      // fallback below
    }

    const updated = redeemGiftCard(card.code, fallbackResourceId);
    if (!updated) {
      setError('兑换失败');
      return;
    }
    recordUnlock({
      sku: updated.giftSku,
      resourceId: fallbackResourceId,
      orderId: `gift-${updated.code}`,
      unlockedAt: Date.now(),
    });
    setRedeemed(updated);
    onRedeemed();
  };

  if (redeemed) {
    const opt = GIFT_CARD_OPTIONS.find(o => o.giftSku === redeemed.giftSku);
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: `${theme.cardSurface}aa`, borderColor: theme.cardBorder }}
      >
        <div className="text-4xl mb-2">{opt?.emoji ?? '✦'}</div>
        <h3 className="text-xl mb-2" style={{ color: theme.text, fontFamily: 'var(--font-display)' }}>
          兑换成功
        </h3>
        <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
          {redeemed.fromName ? `${redeemed.fromName} 送给你的` : '一份'}
          {opt?.label ?? '礼物'}已经解锁
        </p>
        {redeemed.message && (
          <div
            className="rounded-xl p-4 mb-6 text-sm italic"
            style={{ background: theme.accentSoft, color: theme.text }}
          >
            “{redeemed.message}”
          </div>
        )}
        <Link
          href={
            redeemed.giftSku === 'monthly-report'
              ? '/mysti/monthly/'
              : redeemed.giftSku === 'dual-report'
              ? '/mysti/'
              : '/mysti/'
          }
          className="inline-block px-6 py-3 rounded-xl text-sm"
          style={{
            background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
            color: '#fff',
          }}
        >
          ✦ 去查看你的{opt?.label ?? '礼物'}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: `${theme.cardSurface}aa`, borderColor: theme.cardBorder }}
    >
      <label className="block text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: theme.textSubtle }}>
        输入或粘贴兑换码
      </label>
      <input
        type="text"
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="MYSTI-XXXX-XXXX-XXXX"
        className="w-full rounded-lg border p-3 font-mono tracking-wider text-sm bg-transparent focus:outline-none"
        style={{ borderColor: theme.divider, color: theme.text }}
      />
      <button
        onClick={handleLookup}
        className="mt-4 w-full py-3 rounded-xl text-sm"
        style={{
          background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
          color: '#fff',
        }}
      >
        查找礼品卡
      </button>

      {error && (
        <p className="mt-3 text-xs text-center" style={{ color: '#FFB1B1' }}>
          {error}
        </p>
      )}

      {card && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border p-4"
          style={{ borderColor: theme.cardBorder, background: theme.accentSoft }}
        >
          <div className="text-sm" style={{ color: theme.text }}>
            {card.fromName ? `${card.fromName} 送给你` : '有人送给你'}：
            <strong className="ml-1">
              {GIFT_CARD_OPTIONS.find(o => o.giftSku === card.giftSku)?.label ?? card.giftSku}
            </strong>
          </div>
          {card.message && (
            <div className="mt-2 text-xs italic" style={{ color: theme.textMuted }}>
              “{card.message}”
            </div>
          )}
          {card.redeemed ? (
            <div className="mt-3 text-xs" style={{ color: theme.textSubtle }}>
              本卡已被兑换
            </div>
          ) : (
            <button
              onClick={handleRedeem}
              className="mt-4 w-full py-2.5 rounded-lg text-sm"
              style={{
                background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
                color: '#fff',
              }}
            >
              立即兑换
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
