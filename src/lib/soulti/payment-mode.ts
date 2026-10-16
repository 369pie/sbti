/**
 * SoulTI 支付模式。
 *
 * - `live`: 必须走真实支付确认，禁止 stub 解锁。
 * - `stub`: 仅本地/开发环境允许假支付。
 *
 * 默认：生产环境 `live`，非生产 `stub`。
 * 可用 `SOULTI_PAYMENT_PROVIDER=live|stub` 显式覆盖。
 */

export type SoultiPaymentProviderMode = 'live' | 'stub';

export function getSoultiPaymentProviderMode(): SoultiPaymentProviderMode {
  const configured = process.env.SOULTI_PAYMENT_PROVIDER;
  if (configured === 'live' || configured === 'stub') {
    return configured;
  }
  return process.env.NODE_ENV === 'production' ? 'live' : 'stub';
}

export function isSoultiPaymentStubMode(): boolean {
  return getSoultiPaymentProviderMode() === 'stub';
}
