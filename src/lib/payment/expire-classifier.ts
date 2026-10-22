/**
 * Classify a Xunhupay query outcome for the expire-pending cron.
 *  - 'paid'   → only on status OD (caller still runs the normal reconcile path).
 *  - 'failed' → status CD (cancelled).
 *  - 'expire' → definitive "not paid": any other status (WP etc.), or errcode
 *               responses meaning the order does not exist at Xunhupay.
 *  - 'skip'   → network / HTTP / parse / unknown errors. Never guess.
 */
export type ExpireDecision = 'paid' | 'failed' | 'expire' | 'skip';

export function classifyXunhupayQuery(
  outcome: { status: string } | { error: string },
): { decision: ExpireDecision; reason: string } {
  if ('status' in outcome) {
    const s = outcome.status;
    if (s === 'OD') return { decision: 'paid', reason: 'status_OD' };
    if (s === 'CD') return { decision: 'failed', reason: 'status_CD' };
    if (s) return { decision: 'expire', reason: `status_${s}` };
    return { decision: 'skip', reason: 'empty_status' };
  }
  const msg = outcome.error || '';
  // queryXunhupayOrder throws `xunhupay_query_<errcode>_<errmsg>` for errcode != 0.
  if (/^xunhupay_query_-?\d+_/.test(msg) && /not\s*(be\s*)?found|not\s*exist|不存在/i.test(msg)) {
    return { decision: 'expire', reason: 'not_found' };
  }
  if (msg.startsWith('xunhupay_http_')) return { decision: 'skip', reason: msg.slice(0, 40) };
  if (msg.startsWith('xunhupay_request_failed')) return { decision: 'skip', reason: 'network' };
  if (msg === 'xunhupay_invalid_response') return { decision: 'skip', reason: 'invalid_response' };
  return { decision: 'skip', reason: `unknown:${msg.replace(/[^\w\-! ]/g, '').slice(0, 60)}` };
}
