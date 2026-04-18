/**
 * Mysti 支付模式。
 *
 * - `live`: 必须走真实支付配置，缺配置时直接失败。
 * - `stub`: 允许本地/开发环境走假支付链路。
 *
 * 默认策略：生产环境默认 `live`，非生产默认 `stub`。
 * 如需显式覆盖，可设置 `MYSTI_PAYMENT_PROVIDER=live|stub`。
 */

export type MystiPaymentProviderMode = 'live' | 'stub';

export function getMystiPaymentProviderMode(): MystiPaymentProviderMode {
  const configured = process.env.MYSTI_PAYMENT_PROVIDER;
  if (configured === 'live' || configured === 'stub') {
    return configured;
  }
  return process.env.NODE_ENV === 'production' ? 'live' : 'stub';
}

export function isMystiPaymentStubMode(): boolean {
  return getMystiPaymentProviderMode() === 'stub';
}