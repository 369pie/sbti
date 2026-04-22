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
  /** 接口域名，默认使用当前签约平台（现为 dpweixin 备用平台） */
  apiBase?: string;
  appidEnvKey: string;
  appsecretEnvKey: string;
  apiBaseEnvKey?: string;
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
  paymentType: XunhupayPaymentChannel;
  /** 发起支付请求的客户端 UA，用于判断微信 H5 WAP 模式 */
  userAgent?: string;
  /** 站点名称，供 WAP 场景展示 */
  siteName?: string;
}

export interface CreatePaymentResult {
  /** 微信扫码 / H5 / 支付宝跳转 URL */
  url: string;
  qrcode?: string;
  orderId: string;
  errcode: number;
  errmsg: string;
}

export interface QueryPaymentResult {
  /** OD=paid, WP=pending, CD=cancelled/refunded, RD/UD=refund states. */
  status: string;
  openOrderId?: string;
  totalFee?: number;
  orderTitle?: string;
  data: Record<string, unknown>;
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

interface ResolvedEnvValue {
  value?: string;
  key?: string;
  conflict?: {
    keys: string[];
    values: string[];
  };
}

function readEnvValue(names: readonly string[]): ResolvedEnvValue {
  const entries = names
    .map(name => ({ name, value: process.env[name]?.trim() }))
    .filter((entry): entry is { name: string; value: string } => Boolean(entry.value));

  if (entries.length === 0) return {};

  const values = [...new Set(entries.map(entry => entry.value))];
  if (values.length > 1) {
    return {
      conflict: {
        keys: entries.map(entry => entry.name),
        values,
      },
    };
  }

  return {
    value: entries[0].value,
    key: entries[0].name,
  };
}

function hasAnyEnv(names: readonly string[]): boolean {
  return names.some(name => Boolean(process.env[name]?.trim()));
}

function buildEnvNames(prefix: string) {
  return {
    appid: [`${prefix}APP_ID`, `${prefix}APPID`] as const,
    appsecret: [`${prefix}APP_SECRET`, `${prefix}APPSECRET`] as const,
    apiBase: [`${prefix}API_BASE`, `${prefix}APIBASE`] as const,
  };
}

export function maskXunhupayAppId(appid: string): string {
  if (appid.length <= 6) return `${appid.slice(0, 2)}***`;
  return `${appid.slice(0, 3)}***${appid.slice(-3)}`;
}

function logEnvConflict(
  channel: XunhupayPaymentChannel,
  source: XunhupayConfig['source'],
  field: 'appid' | 'appsecret' | 'apiBase',
  conflict: NonNullable<ResolvedEnvValue['conflict']>,
) {
  console.error('[xunhupay-config] conflicting env values', {
    channel,
    source,
    field,
    keys: conflict.keys,
    values:
      field === 'appid'
        ? conflict.values.map(maskXunhupayAppId)
        : conflict.values.map(() => '[redacted]'),
  });
}

function readSharedConfig(
  channel: XunhupayPaymentChannel,
): XunhupayConfig | null {
  const names = buildEnvNames('XUNHUPAY_');
  const appid = readEnvValue(names.appid);
  const appsecret = readEnvValue(names.appsecret);
  const apiBase = readEnvValue(names.apiBase);

  if (appid.conflict) {
    logEnvConflict(channel, 'shared', 'appid', appid.conflict);
    return null;
  }
  if (appsecret.conflict) {
    logEnvConflict(channel, 'shared', 'appsecret', appsecret.conflict);
    return null;
  }
  if (apiBase.conflict) {
    logEnvConflict(channel, 'shared', 'apiBase', apiBase.conflict);
    return null;
  }
  if (!appid.value || !appsecret.value || !appid.key || !appsecret.key) return null;

  return {
    channel,
    appid: appid.value,
    appsecret: appsecret.value,
    apiBase: apiBase.value || DEFAULT_XUNHUPAY_API_BASE,
    appidEnvKey: appid.key,
    appsecretEnvKey: appsecret.key,
    apiBaseEnvKey: apiBase.key,
    source: 'shared',
  };
}

export function readXunhupayConfig(
  channel: XunhupayPaymentChannel,
): XunhupayConfig | null {
  const prefix = channel === 'wechat' ? 'XUNHUPAY_WECHAT_' : 'XUNHUPAY_ALIPAY_';
  const names = buildEnvNames(prefix);
  const appid = readEnvValue(names.appid);
  const appsecret = readEnvValue(names.appsecret);
  const apiBase = readEnvValue(names.apiBase);

  if (appid.conflict) {
    logEnvConflict(channel, 'channel', 'appid', appid.conflict);
    return null;
  }
  if (appsecret.conflict) {
    logEnvConflict(channel, 'channel', 'appsecret', appsecret.conflict);
    return null;
  }
  if (apiBase.conflict) {
    logEnvConflict(channel, 'channel', 'apiBase', apiBase.conflict);
    return null;
  }

  if (appid.value && appsecret.value && appid.key && appsecret.key) {
    return {
      channel,
      appid: appid.value,
      appsecret: appsecret.value,
      apiBase:
        apiBase.value ||
        readSharedConfig(channel)?.apiBase ||
        DEFAULT_XUNHUPAY_API_BASE,
      appidEnvKey: appid.key,
      appsecretEnvKey: appsecret.key,
      apiBaseEnvKey: apiBase.key,
      source: 'channel',
    };
  }

  if (hasAnyEnv(names.appid) || hasAnyEnv(names.appsecret)) {
    console.error('[xunhupay-config] incomplete channel env', {
      channel,
      appidKeys: names.appid.filter(name => Boolean(process.env[name]?.trim())),
      appsecretKeys: names.appsecret.filter(name => Boolean(process.env[name]?.trim())),
    });
    return null;
  }

  return readSharedConfig(channel);
}

export function hasAnyXunhupayConfig(): boolean {
  return (
    readXunhupayConfig('wechat') !== null ||
    readXunhupayConfig('alipay') !== null
  );
}

const DEFAULT_XUNHUPAY_API_BASE = 'https://api.dpweixin.com';
const SECONDARY_XUNHUPAY_API_BASE = 'https://api.xunhupay.com';

function isLikelyMobileBrowser(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /android.+mobile|iphone|ipod|ipad|iemobile|mobile|phone|windows ce|wap/i.test(
    userAgent,
  );
}

function buildApiBaseCandidates(apiBase?: string): string[] {
  const candidates = [apiBase, DEFAULT_XUNHUPAY_API_BASE, SECONDARY_XUNHUPAY_API_BASE]
    .filter((value): value is string => Boolean(value))
    .map(value => value.replace(/\/$/, ''));
  return [...new Set(candidates)];
}

function isRetryableXunhupayError(message: string): boolean {
  return (
    message === 'xunhupay_invalid_response' ||
    message.startsWith('xunhupay_http_') ||
    message.startsWith('xunhupay_request_failed')
  );
}

export async function createXunhupayOrder(
  cfg: XunhupayConfig,
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  const channel = params.paymentType;
  const payload: Record<string, string> = {
    version: '1.1',
    appid: cfg.appid,
    plugins: channel,
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

  if (channel === 'wechat' && isLikelyMobileBrowser(params.userAgent)) {
    payload.type = 'WAP';
    try {
      const origin = new URL(params.returnUrl).origin;
      payload.wap_url = origin;
      payload.wap_name = (params.siteName || new URL(origin).host).slice(0, 32);
    } catch {
      payload.wap_name = (params.siteName || 'WTFTI').slice(0, 32);
    }
  }
  // `plugins` 需明确标识支付渠道；微信移动端还要附带 WAP 参数。

  payload.hash = signXunhupay(payload, cfg.appsecret);

  let lastError: Error | null = null;

  for (const apiBase of buildApiBaseCandidates(cfg.apiBase)) {
    const endpoint = `${apiBase}/payment/do.html`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
      });

      const raw = await res.text();

      if (!res.ok) {
        throw new Error(`xunhupay_http_${res.status}`);
      }

      let json: {
        errcode: number;
        errmsg: string;
        url?: string;
        url_qrcode?: string;
        oderno?: string;
        openid?: string;
      };

      try {
        json = JSON.parse(raw) as {
          errcode: number;
          errmsg: string;
          url?: string;
          url_qrcode?: string;
          oderno?: string;
          openid?: string;
        };
      } catch {
        throw new Error('xunhupay_invalid_response');
      }

      if (json.errcode !== 0 || !json.url) {
        throw new Error(`xunhupay_${json.errcode}_${json.errmsg}`);
      }

      return {
        url: json.url,
        qrcode: json.url_qrcode,
        orderId: json.oderno ?? json.openid ?? params.tradeOrderId,
        errcode: json.errcode,
        errmsg: json.errmsg,
      };
    } catch (error) {
      const normalized =
        error instanceof Error
          ? error.message.startsWith('xunhupay_')
            ? error
            : new Error(`xunhupay_request_failed:${error.message}`)
          : new Error('xunhupay_request_failed');

      lastError = normalized;
      if (!isRetryableXunhupayError(normalized.message)) {
        throw normalized;
      }
    }
  }

  throw lastError ?? new Error('xunhupay_request_failed');
}

export async function queryXunhupayOrder(
  cfg: XunhupayConfig,
  params: { tradeOrderId?: string; openOrderId?: string },
): Promise<QueryPaymentResult> {
  if (!params.tradeOrderId && !params.openOrderId) {
    throw new Error('xunhupay_query_missing_order_id');
  }

  const payload: Record<string, string> = {
    appid: cfg.appid,
    time: Math.floor(Date.now() / 1000).toString(),
    nonce_str: Math.random().toString(36).slice(2, 12),
  };
  if (params.tradeOrderId) payload.out_trade_order = params.tradeOrderId;
  if (!params.tradeOrderId && params.openOrderId) payload.open_order_id = params.openOrderId;

  payload.hash = signXunhupay(payload, cfg.appsecret);

  let lastError: Error | null = null;

  for (const apiBase of buildApiBaseCandidates(cfg.apiBase)) {
    const endpoint = `${apiBase}/payment/query.html`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
      });

      const raw = await res.text();

      if (!res.ok) {
        throw new Error(`xunhupay_http_${res.status}`);
      }

      let json: {
        errcode: number | string;
        errmsg?: string;
        data?: Record<string, unknown>;
      };

      try {
        json = JSON.parse(raw) as {
          errcode: number | string;
          errmsg?: string;
          data?: Record<string, unknown>;
        };
      } catch {
        throw new Error('xunhupay_invalid_response');
      }

      if (Number(json.errcode) !== 0 || !json.data) {
        throw new Error(`xunhupay_query_${json.errcode}_${json.errmsg ?? 'failed'}`);
      }

      const status = typeof json.data.status === 'string' ? json.data.status : '';
      if (!status) {
        throw new Error('xunhupay_query_missing_status');
      }

      const totalFee = Number(json.data.total_fee);

      return {
        status,
        openOrderId:
          typeof json.data.open_order_id === 'string'
            ? json.data.open_order_id
            : undefined,
        totalFee: Number.isFinite(totalFee) ? totalFee : undefined,
        orderTitle:
          typeof json.data.order_title === 'string'
            ? json.data.order_title
            : undefined,
        data: json.data,
      };
    } catch (error) {
      const normalized =
        error instanceof Error
          ? error.message.startsWith('xunhupay_')
            ? error
            : new Error(`xunhupay_request_failed:${error.message}`)
          : new Error('xunhupay_request_failed');

      lastError = normalized;
      if (!isRetryableXunhupayError(normalized.message)) {
        throw normalized;
      }
    }
  }

  throw lastError ?? new Error('xunhupay_request_failed');
}
