import assert from 'node:assert/strict';
import { classifyXunhupayQuery as c } from '../src/lib/payment/expire-classifier';
const cases: [Parameters<typeof c>[0], string][] = [
  [{ status: 'OD' }, 'paid'], [{ status: 'CD' }, 'failed'], [{ status: 'WP' }, 'expire'], [{ status: '' }, 'skip'],
  [{ error: 'xunhupay_query_-1_Order is not found!' }, 'expire'],
  [{ error: 'xunhupay_query_40029_订单不存在' }, 'expire'],
  [{ error: 'xunhupay_query_-1_sign error' }, 'skip'],
  [{ error: 'xunhupay_http_502' }, 'skip'], [{ error: 'xunhupay_request_failed:fetch failed' }, 'skip'],
  [{ error: 'xunhupay_invalid_response' }, 'skip'], [{ error: 'xunhupay_query_missing_status' }, 'skip'],
];
for (const [i, want] of cases) assert.equal(c(i).decision, want, JSON.stringify(i));
console.log(`expire-classifier: ${cases.length} passed`);
