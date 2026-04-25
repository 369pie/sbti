/**
 * Mirror 支付模式 — 复用 Mysti 的 live/stub 策略。
 *
 * - `live`: 走真实虎皮椒支付。
 * - `stub`: 本地开发用，模拟支付成功。
 */

export type MirrorPaymentProviderMode = 'live' | 'stub';

export function getMirrorPaymentProviderMode(): MirrorPaymentProviderMode {
  const configured = process.env.MIRROR_PAYMENT_PROVIDER;
  if (configured === 'live' || configured === 'stub') {
    return configured;
  }
  // 复用全局 Mysti 配置，若未配置则按环境决定
  const mystiConfigured = process.env.MYSTI_PAYMENT_PROVIDER;
  if (mystiConfigured === 'live' || mystiConfigured === 'stub') {
    return mystiConfigured;
  }
  return process.env.NODE_ENV === 'production' ? 'live' : 'stub';
}

export function isMirrorPaymentStubMode(): boolean {
  return getMirrorPaymentProviderMode() === 'stub';
}
