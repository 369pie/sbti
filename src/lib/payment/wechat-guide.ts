import { isTrustedXunhupayUrl, isWechatInAppBrowser } from '@/lib/payment/xunhupay';

/**
 * Inside WeChat's in-app browser neither WeChat H5 pay nor Alipay works, so instead of
 * sending the user to a cashier that fails silently (→ the ~48 stuck pending orders),
 * create routes return our own guide page: "open in system browser" + Xunhupay QR fallback.
 */
export function wechatGuideUrl(args: {
  kind: 'mysti' | 'mirror';
  orderId: string;
  userAgent?: string | null;
  qrcode?: string | null;
  cashier?: string | null;
  paymentType: 'wechat' | 'alipay';
  back: string;
}): string | null {
  if (!isWechatInAppBrowser(args.userAgent)) return null;
  const q = new URLSearchParams({ kind: args.kind, orderId: args.orderId, channel: args.paymentType, back: args.back });
  if (isTrustedXunhupayUrl(args.qrcode)) q.set('qr', args.qrcode as string);
  if (isTrustedXunhupayUrl(args.cashier)) q.set('cashier', args.cashier as string);
  return `/pay/wechat/?${q.toString()}`;
}
