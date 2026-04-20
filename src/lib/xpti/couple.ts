/**
 * XPTI · Couple Sharing Core
 *
 * Sprint 2 — 关系合并报告。
 *
 * 设计原则：
 *  1. **零后端**：邀请数据完全编码在 URL 中（base64），不依赖数据库。
 *     这意味着任何静态托管 / SSR / Edge 都能跑。
 *  2. **隐私友好**：编码内容只有 9 维分数 (1-3) + archetype slug，不含答案文本。
 *  3. **稳定 schema**：增加版本前缀 `v1.` 以便未来升级而不破坏旧链接。
 */

import { XPTI_PERSONALITY_TYPES, type XptiPersonalityType } from './personalities';
import type { XptiDimensionScore } from './scoring';
import { computeItcAxes, type ItcAxisScore } from './itc';
import { matchTensionPairing, type TensionPairing } from './itc-pairing';
import type { ItcSignature } from './itc';

const SCHEMA_VERSION = 'v1';
const DIM_ORDER = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'] as const;

export interface CoupleInvitePayload {
  /** Inviter (A side) archetype slug */
  slug: string;
  /** Inviter dimension scores, 1-3 each, in DIM_ORDER */
  dims: number[];
  /** Inviter display nick (optional, max 12 chars; sanitized) */
  nick?: string;
}

/** Encode A's data into a short URL-safe string. */
export function encodeCoupleInvite(payload: CoupleInvitePayload): string {
  const safeNick = (payload.nick ?? '').slice(0, 12).replace(/[^\p{L}\p{N}\s_-]/gu, '');
  const safeDims = payload.dims.slice(0, 9).map((d) => Math.max(1, Math.min(3, Math.round(d))));
  const json = JSON.stringify({ s: payload.slug, d: safeDims, n: safeNick });
  // base64url
  const b64 = base64UrlEncode(utf8Encode(json));
  return `${SCHEMA_VERSION}.${b64}`;
}

/** Decode an invite string back into a payload. Returns null on any failure. */
export function decodeCoupleInvite(raw: string | null | undefined): CoupleInvitePayload | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const dot = trimmed.indexOf('.');
  if (dot < 0) return null;
  const version = trimmed.slice(0, dot);
  if (version !== SCHEMA_VERSION) return null;
  const b64 = trimmed.slice(dot + 1);
  try {
    const json = utf8Decode(base64UrlDecode(b64));
    const obj = JSON.parse(json) as { s?: string; d?: number[]; n?: string };
    if (!obj || typeof obj.s !== 'string' || !Array.isArray(obj.d) || obj.d.length !== 9) return null;
    if (!XPTI_PERSONALITY_TYPES.find((p) => p.slug === obj.s)) return null;
    return {
      slug: obj.s,
      dims: obj.d.map((n) => Math.max(1, Math.min(3, Math.round(Number(n))))),
      nick: typeof obj.n === 'string' ? obj.n : undefined,
    };
  } catch {
    return null;
  }
}

/** Convert dimension scores (1-3 floats) to ItcSignature using the same ±0.25 thresholds as deriveItcSignature. */
export function dimsToSignature(dims: number[]): ItcSignature {
  const axes = computeItcAxes(dimsToScores(dims));
  const map = new Map(axes.map((a) => [a.id, a] as const));
  const c = map.get('control');
  const d = map.get('distance');
  const n = map.get('novelty');
  const cTier: ItcSignature['control'] =
    !c || Math.abs(c.signed) < 0.25 ? 'NEUTRAL' : c.signed > 0 ? 'CONTROL' : 'SURRENDER';
  const dTier: ItcSignature['distance'] =
    !d || Math.abs(d.signed) < 0.25 ? 'NEUTRAL' : d.signed > 0 ? 'IMMERSION' : 'DISTANCE';
  const nTier: ItcSignature['novelty'] =
    !n || Math.abs(n.signed) < 0.25 ? 'NEUTRAL' : n.signed > 0 ? 'NOVELTY' : 'REPETITION';
  return { control: cTier, distance: dTier, novelty: nTier, label: `${cTier} · ${dTier} · ${nTier}` };
}

function dimsToScores(dims: number[]): XptiDimensionScore[] {
  return DIM_ORDER.map((id, i) => {
    const score = dims[i] ?? 2;
    const level: XptiDimensionScore['level'] = score >= 2.34 ? 'H' : score >= 1.67 ? 'M' : 'L';
    return { id, score, level };
  });
}

export interface CoupleMergeResult {
  inviter: { slug: string; archetype: XptiPersonalityType; dims: number[]; signature: ItcSignature; axes: ItcAxisScore[] };
  partner: { slug: string; archetype: XptiPersonalityType; dims: number[]; signature: ItcSignature; axes: ItcAxisScore[] };
  pairing: TensionPairing;
}

/** Build the full merged report from two sides' raw dimension scores + slugs. */
export function buildCoupleMerge(
  inviter: { slug: string; dims: number[] },
  partner: { slug: string; dims: number[] }
): CoupleMergeResult {
  const a = enrichSide(inviter);
  const b = enrichSide(partner);
  const pairing = matchTensionPairing(a.signature, b.signature);
  return { inviter: a, partner: b, pairing };
}

function enrichSide(side: { slug: string; dims: number[] }) {
  const archetype =
    XPTI_PERSONALITY_TYPES.find((p) => p.slug === side.slug) ?? XPTI_PERSONALITY_TYPES[0];
  const sig = dimsToSignature(side.dims);
  const axes = computeItcAxes(dimsToScores(side.dims));
  return { slug: archetype.slug, archetype, dims: side.dims, signature: sig, axes };
}

// ─── base64url helpers ────────────────────────────────────────
function utf8Encode(s: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
  // Fallback (very rare in modern envs)
  const arr: number[] = [];
  for (let i = 0; i < s.length; i++) arr.push(s.charCodeAt(i));
  return new Uint8Array(arr);
}

function utf8Decode(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(bytes);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa !== 'undefined' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
