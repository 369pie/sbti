'use client';

/**
 * /mirror/color · 色彩季型 lite（journal）
 * 问卷 ± 可选自拍 → has_color_season；照片不落库。
 */

import { quotaMessage, trackQuotaExhausted } from '@/lib/member-client';
import Link from 'next/link';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';

import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { getApiPath } from '@/lib/api';
import type {
  ColorSeasonResult,
  ContrastLevel,
  MetalPref,
  VeinTone,
} from '@/lib/mirror/color-season';

import styles from './color.module.css';

const MAX_SIDE = 1200;
const MAX_DATA = 2_400_000;

async function optionalSelfie(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  let q = 0.82;
  let url = canvas.toDataURL('image/jpeg', q);
  while (url.length > MAX_DATA && q > 0.4) {
    q -= 0.1;
    url = canvas.toDataURL('image/jpeg', q);
  }
  if (url.length > MAX_DATA) throw new Error('too_large');
  return url;
}

export function ColorSeasonClient() {
  const [veinTone, setVeinTone] = useState<VeinTone | null>(null);
  const [contrast, setContrast] = useState<ContrastLevel | null>(null);
  const [metal, setMetal] = useState<MetalPref | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState(false);
  const [result, setResult] = useState<ColorSeasonResult | null>(null);
  const [completeness, setCompleteness] = useState<number | null>(null);

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/mirror/color' });
    enqueueProductEvent('mirror', 'mirror_view', { step: 'view', props: { feature: 'color_season' } });
  }, []);

  const onFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImageDataUrl(await optionalSelfie(file));
      setError(null);
    } catch {
      setError('自拍太大了，换一张或跳过自拍');
      setImageDataUrl(null);
    }
  }, []);

  const submit = useCallback(async () => {
    if (!veinTone || !contrast || !metal || !consent) return;
    setBusy(true);
    setError(null);
    try {
      enqueueProductEvent('mirror', 'mirror_analyze_submit', { step: 'submit', props: { feature: 'color_season' } });
      const res = await fetch(getApiPath('/mirror/color-season/'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veinTone,
          contrast,
          metal,
          imageDataUrl,
          consentAccepted: true,
        }),
      });
      if (res.status === 401) {
        setGuest(true);
        setBusy(false);
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        result?: ColorSeasonResult;
        profile?: { completeness_pct?: number } | null;
      };
      if (!res.ok || !data.ok || !data.result) {
        if (data.error === 'quota_exhausted') { trackQuotaExhausted(data); setError(quotaMessage(data)); } else setError(data.error === 'rate_limited' ? '太频繁了，稍后再试' : '这次没诊断出来，再试一次');
        setBusy(false);
        return;
      }
      setResult(data.result);
      setCompleteness(data.profile?.completeness_pct ?? null);
    } catch {
      setError('网络不太稳，稍后再试');
    } finally {
      setBusy(false);
    }
  }, [veinTone, contrast, metal, consent, imageDataUrl]);

  if (guest) {
    return (
      <main className={`skin-journal ${styles.page}`}>
        <div className={styles.inner}>
          <div className={`s-card ${styles.card} ${styles.guest}`}>
            <p>季型会写进档案，请先登录。</p>
            <Link href="/auth/login/?next=/mirror/color/" prefetch={false}>
              去登录 →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <Link href="/mirror/" prefetch={false} className={styles.back}>
          ← 美我
        </Link>
        <p className="s-eyebrow">COLOR · 色彩季型</p>
        <h1 className={`s-title ${styles.hi}`}>我适合什么颜色？</h1>
        <p className={styles.lead}>三道小问题就够；自拍可选。结果写入档案，今日幸运色会更贴你。</p>

        {!result ? (
          <>
            <div className={`s-card s-card--lined ${styles.card}`}>
              <span className="s-tape s-tape--sage" aria-hidden />
              <p className={styles.q}>1. 手腕内侧血管看起来偏？</p>
              <div className={styles.opts}>
                {(
                  [
                    ['cool', '偏蓝紫'],
                    ['warm', '偏青绿/橄榄'],
                    ['neutral', '说不清'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.opt} ${veinTone === id ? styles.optOn : ''}`}
                    onClick={() => setVeinTone(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`s-card ${styles.card}`}>
              <p className={styles.q}>2. 头发 / 眼睛 / 肤色对比？</p>
              <div className={styles.opts}>
                {(
                  [
                    ['low', '柔和接近'],
                    ['mid', '中等'],
                    ['high', '反差明显'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.opt} ${contrast === id ? styles.optOn : ''}`}
                    onClick={() => setContrast(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`s-card ${styles.card}`}>
              <p className={styles.q}>3. 银饰和金饰，哪个更衬？</p>
              <div className={styles.opts}>
                {(
                  [
                    ['silver', '银'],
                    ['gold', '金'],
                    ['both', '都行'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.opt} ${metal === id ? styles.optOn : ''}`}
                    onClick={() => setMetal(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`s-card ${styles.card}`}>
              <p className={styles.q}>可选 · 自然光自拍（素颜更好）</p>
              {imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageDataUrl} alt="自拍预览" className={styles.preview} />
              ) : null}
              <label className={styles.fileBtn}>
                {imageDataUrl ? '换一张' : '上传自拍（可跳过）'}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
              </label>
            </div>

            <label className={styles.consent}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>同意本次分析；若上传自拍，仅用于本次季型判断，处理完即删除、不入库。</span>
            </label>

            {error ? <p className={styles.err}>{error}</p> : null}

            <button
              type="button"
              className="s-btn"
              disabled={!veinTone || !contrast || !metal || !consent || busy}
              onClick={() => void submit()}
            >
              {busy ? '诊断中…' : '看出我的季型'}
            </button>
          </>
        ) : (
          <div className={`s-card s-card--lined ${styles.card}`}>
            <span className="s-tape s-tape--peach" aria-hidden />
            {result.stub ? (
              <p className="s-eyebrow" style={{ marginBottom: 8 }}>
                问卷规则 · 演示
              </p>
            ) : (
              <p className="s-eyebrow" style={{ marginBottom: 8 }}>
                VISION
              </p>
            )}
            <h2 className={`s-title ${styles.resultTitle}`}>
              {result.season}
              <span style={{ fontSize: 14, color: 'var(--s-mute)', marginLeft: 8 }}>{result.seasonEn}</span>
            </h2>
            <p className={styles.lead}>{result.summary}</p>
            <p className={styles.q}>适合</p>
            <div className={styles.chips}>
              {result.doColors.map((c) => (
                <span key={c} className={styles.chip}>
                  {c}
                </span>
              ))}
            </div>
            <p className={styles.q}>少碰</p>
            <div className={styles.chips}>
              {result.avoidColors.map((c) => (
                <span key={c} className={`${styles.chip} ${styles.chipAvoid}`}>
                  {c}
                </span>
              ))}
            </div>
            <p className={styles.lead} style={{ marginTop: 12 }}>
              妆容：{result.makeupTip}
            </p>
            <p className={styles.lead} style={{ color: 'var(--s-mute)', fontSize: 12 }}>
              已写入档案 · has_color_season
              {completeness != null ? ` · 完整度 ${completeness}%` : ''}
            </p>
            <Link href="/today/" prefetch={false} className="s-btn" style={{ marginTop: 8 }}>
              去看今日卡
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
