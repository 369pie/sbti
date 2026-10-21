'use client';

/* eslint-disable @next/next/no-img-element -- Xunhupay QR is a remote, short-lived image. */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const TRUSTED = /(^|\.)(xunhupay\.com|dpweixin\.com)$/i;

function trusted(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && TRUSTED.test(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

function safeBack(path: string | null): string {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

export function WechatPayGuide() {
  const sp = useSearchParams();
  const kind = sp.get('kind') === 'mirror' ? 'mirror' : 'mysti';
  const orderId = (sp.get('orderId') ?? '').slice(0, 64);
  const channel = sp.get('channel') === 'alipay' ? 'alipay' : 'wechat';
  const qr = trusted(sp.get('qr'));
  const back = safeBack(sp.get('back'));
  const [copied, setCopied] = useState(false);

  const doneHref =
    kind === 'mirror'
      ? `/mirror/?paid=1&orderId=${encodeURIComponent(orderId)}`
      : `/mysti/payment/return/?orderId=${encodeURIComponent(orderId)}`;

  const copy = async () => {
    const link = `${window.location.origin}${back}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt('复制这个链接，到浏览器里打开：', link);
    }
    setCopied(true);
  };

  return (
    <main className="skin-journal" data-wechat-pay-guide style={{ minHeight: '100vh', padding: '24px 20px 96px' }}>
      <div aria-hidden style={{ position: 'fixed', top: 6, right: 14, fontSize: 30, lineHeight: 1, color: 'var(--s-accent-text)' }}>↗</div>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--s-mute)', margin: '28px 0 8px' }}>支付 · 小提示</p>
        <h1 className="s-title" style={{ fontSize: 24, margin: '0 0 10px', fontFamily: 'var(--s-h-font)' }}>微信里没法直接付款</h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--s-ink-2)', margin: 0 }}>
          微信内置浏览器会拦截网页{channel === 'alipay' ? '支付宝' : '微信'}支付。换到手机浏览器里打开，就能正常付。订单已经保留，不会重复扣款。
        </p>

        <ol style={{ listStyle: 'none', padding: 0, margin: '20px 0', display: 'grid', gap: 10 }}>
          {['点右上角「···」', '选「在浏览器打开」（安卓可能叫「在默认浏览器中打开」）', '在浏览器里重新点一次支付'].map((t, i) => (
            <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--s-card)', border: '1px solid var(--s-line)', borderRadius: 6, padding: '12px 14px', fontSize: 14 }}>
              <span style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--s-accent-soft)', color: 'var(--s-accent-text)', display: 'grid', placeItems: 'center', fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>

        <button type="button" onClick={copy} className="s-btn" style={{ width: '100%', padding: '14px 0', borderRadius: 999, background: 'var(--s-cta)', color: 'var(--s-on-cta)', border: 0, fontSize: 15 }}>
          {copied ? '已复制，去浏览器粘贴打开' : '复制链接，去浏览器打开'}
        </button>

        {qr && (
          <section data-wechat-pay-qr style={{ marginTop: 24, textAlign: 'center', background: 'var(--s-card)', border: '1px solid var(--s-line)', borderRadius: 6, padding: 18 }}>
            <p style={{ fontSize: 14, margin: '0 0 10px' }}>或者：长按二维码 →「识别图中二维码」直接付</p>
            <img src={qr} alt="支付二维码" width={200} height={200} style={{ margin: '0 auto', display: 'block' }} />
            <p style={{ fontSize: 12, color: 'var(--s-mute)', margin: '10px 0 0' }}>识别不了的话，截图后用另一台手机扫码，或用上面的浏览器方式。</p>
          </section>
        )}

        <div style={{ marginTop: 24, display: 'grid', gap: 10, textAlign: 'center', fontSize: 14 }}>
          <Link href={doneHref} prefetch={false} style={{ color: 'var(--s-accent-text)' }}>我已经付好了，查看结果 →</Link>
          <Link href={back} prefetch={false} style={{ color: 'var(--s-mute)' }}>先不付了，返回</Link>
        </div>
      </div>
    </main>
  );
}
