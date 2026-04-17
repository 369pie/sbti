/**
 * 虎皮椒（Xunhupay）支付集成
 * 文档：https://www.xunhupay.com/doc/api/pay.html
 *
 * 已签约：微信 + 支付宝。该模块封装签名 / 下单 / 回调验签，所有错误向上抛出。
 *
 * 安全要点：
 * - APPID / APPSECRET 仅服务端可见（不要走 NEXT_PUBLIC_）
 * - 回调验签必须严格匹配，避免伪造解锁
 * - 订单号建议带业务前缀方便对账
 */

import { createHash } from 'node:crypto';

export type XunhupayPaymentChannel = 'wechat' | 'alipay';

export interface XunhupayConfig {
  channel: XunhupayPaymentChannel;
  appid: string;
  appsecret: string;
  /** 接口域名，默认官方 */
  apiBase?: string;
  /** 来源：独立渠道配置，或兼容旧版共享配置 */
  source: 'channel' | 'shared';
}

export interface CreatePaymentParams {
  /** 业务订单号 */
  tradeOrderId: string;
  /** 单位：元，保留 2 位小数 */
  totalFee: number;
  /** 商品标题 */
  title: string;
  /** 用户透传字段（unlock token / userId 等），最长 256 */
  attach?: string;
  /** 业务决定的异步通知地址（必须公网可达） */
  notifyUrl: string;
  /** 业务决定的同步跳转地址 */
  returnUrl: string;
  /** 用户取消支付后的业务回跳地址 */
  callbackUrl?: string;
  /** 'wechat' | 'alipay' */
  paymentType?: XunhupayPaymentChannel;
}

export interface CreatePaymentResult {
  /** 微信扫码 / H5 / 支付宝跳转 URL */
  url: string;
  qrcode?: string;
  orderId: string;
  errcode: number;
  errmsg: string;
}

/**
 * 虎皮椒 hash 签名规则：
 * 1. 把所有非空参数（除 hash 自身）按 key 升序排序
 * 2. 拼成 key=value&key=value 形式
 * 3. 末尾追加 appsecret（不带 key=）
 * 4. md5 后转小写
 */
export function signXunhupay(
  params: Record<string, string | number>,
  appsecret: string,
): string {
  const filtered = Object.entries(params).filter(
    ([key, val]) =>
      key !== 'hash' &&
      val !== undefined &&
      val !== null &&
      String(val).length > 0,
  );
  filtered.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const concat = filtered.map(([k, v]) => `${k}=${v}`).join('&') + appsecret;
  return createHash('md5').update(concat, 'utf8').digest('hex');
}

export function verifyXunhupayCallback(
  payload: Record<string, string | number>,
  appsecret: string,
): boolean {
  const incoming = String(payload.hash ?? '');
  if (!incoming) return false;
  const expected = signXunhupay(payload, appsecret);
  return incoming.toLowerCase() === expected.toLowerCase();
}

function readSharedConfig(
  channel: XunhupayPaymentChannel,
): XunhupayConfig | null {
  const appid = process.env.XUNHUPAY_APP_ID;
  const appsecret = process.env.XUNHUPAY_APP_SECRET;
  if (!appid || !appsecret) return null;
  return {
    channel,
    appid,
    appsecret,
    apiBase: process.env.XUNHUPAY_API_BASE || 'https://api.xunhupay.com',
    source: 'shared',
  };
}

export function readXunhupayConfig(
  channel: XunhupayPaymentChannel,
): XunhupayConfig | null {
  const prefix = channel === 'wechat' ? 'XUNHUPAY_WECHAT_' : 'XUNHUPAY_ALIPAY_';
  const appid = process.env[`${prefix}APP_ID`];
  const appsecret = process.env[`${prefix}APP_SECRET`];
  if (appid && appsecret) {
    return {
      channel,
      appid,
      appsecret,
      apiBase:
        process.env[`${prefix}API_BASE`] ||
        process.env.XUNHUPAY_API_BASE ||
        'https://api.xunhupay.com',
      source: 'channel',
    };
  }
  return readSharedConfig(channel);
}

export function hasAnyXunhupayConfig(): boolean {
  return (
    readXunhupayConfig('wechat') !== null ||
    readXunhupayConfig('alipay') !== null
  );
}

export async function createXunhupayOrder(
  cfg: XunhupayConfig,
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  const payload: Record<string, string> = {
    version: '1.1',
    appid: cfg.appid,
    trade_order_id: params.tradeOrderId,
    total_fee: params.totalFee.toFixed(2),
    title: params.title,
    time: Math.floor(Date.now() / 1000).toString(),
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    nonce_str: Math.random().toString(36).slice(2, 12),
  };
  if (params.attach) payload.attach = params.attach.slice(0, 256);
  if (params.callbackUrl) payload.callback_url = params.callbackUrl;
  if (cfg.source === 'shared' && params.paymentType === 'wechat') {
    payload.type = 'WAP';
  }
  // 独立渠道配置时由各自 appid/appsecret 决定商户，不再强行用 type 分流。

  payload.hash = signXunhupay(payload, cfg.appsecret);

  const endpoint =
    params.paymentType === 'alipay'
      ? `${cfg.apiBase ?? 'https://api.xunhupay.com'}/payment/do.html`
      : `${cfg.apiBase ?? 'https://api.xunhupay.com'}/payment/do.html`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
  });

  if (!res.ok) {
    throw new Error(`xunhupay_http_${res.status}`);
  }
  const json = (await res.json()) as {
    errcode: number;
    errmsg: string;
    url?: string;
    url_qrcode?: string;
    oderno?: string;
  };
  if (json.errcode !== 0 || !json.url) {
    throw new Error(`xunhupay_${json.errcode}_${json.errmsg}`);
  }
  return {
    url: json.url,
    qrcode: json.url_qrcode,
    orderId: json.oderno ?? params.tradeOrderId,
    errcode: json.errcode,
    errmsg: json.errmsg,
  };
}
