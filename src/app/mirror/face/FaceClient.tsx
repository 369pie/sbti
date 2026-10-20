'use client';

/**
 * /mirror/face · 脸型妆容（journal）
 * 自述三题 ± 可选自拍 → vision/规则库 → has_face。无 MediaPipe 重依赖。
 */

import { quotaMessage, trackQuotaExhausted } from '@/lib/member-client';
import Link from 'next/link';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';

import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { getApiPath } from '@/lib/api';
import type { FaceMakeupResult, FaceSelfHint } from '@/lib/mirror/face-shape';

import styles from './face.module.css';

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

export function FaceClient() {
  const [jaw, setJaw] = useState<FaceSelfHint['jaw'] | null>(null);
  const [cheek, setCheek] = useState<FaceSelfHint['cheek'] | null>(null);
  const [length, setLength] = useState<FaceSelfHint['length'] | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState(false);
  const [result, setResult] = useState<FaceMakeupResult | null>(null);
  const [completeness, setCompleteness] = useState<number | null>(null);

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/mirror/face' });
  }, []);

  const onFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImageDataUrl(await optionalSelfie(file));
      setError(null);
    } catch {
      setError('自拍太大了，换一张或跳过');
      setImageDataUrl(null);
    }
  }, []);

  const submit = useCallback(async () => {
    if (!jaw || !cheek || !length || !consent) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(getApiPath('/mirror/face/'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jaw, cheek, length, imageDataUrl, consentAccepted: true }),
      });
      if (res.status === 401) {
        setGuest(true);
        setBusy(false);
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        result?: FaceMakeupResult;
        profile?: { completeness_pct?: number } | null;
      };
      if (!res.ok || !data.ok || !data.result) {
        if (data.error === 'quota_exhausted') { trackQuotaExhausted(data); setError(quotaMessage(data)); } else setError(data.error === 'rate_limited' ? '太频繁了，稍后再试' : '这次没看出来，再试一次');
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
  }, [jaw, cheek, length, consent, imageDataUrl]);

  if (guest) {
    return (
      <main className={`skin-journal ${styles.page}`}>
        <div className={styles.inner}>
          <div className={`s-card ${styles.card} ${styles.guest}`}>
            <p>脸型妆容会写进档案，请先登录。</p>
            <Link href="/auth/login/?next=/mirror/face/" prefetch={false}>
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
        <p className="s-eyebrow">FACE · 脸型妆容</p>
        <h1 className={`s-title ${styles.hi}`}>我的脸适合什么妆？</h1>
        <p className={styles.lead}>
          三道自述题 + 可选自拍。浏览器端不做重型人脸模型；有视觉模型时辅助判断，否则走规则妆容库。
        </p>

        {!result ? (
          <>
            <div className={`s-card s-card--lined ${styles.card}`}>
              <span className="s-tape s-tape--peach" aria-hidden />
              <p className={styles.q}>1. 下颌线条？</p>
              <div className={styles.opts}>
                {(
                  [
                    ['soft', '柔和圆润'],
                    ['angular', '偏有棱角'],
                    ['pointed', '下巴偏尖'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.opt} ${jaw === id ? styles.optOn : ''}`}
                    onClick={() => setJaw(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`s-card ${styles.card}`}>
              <p className={styles.q}>2. 颧骨感觉？</p>
              <div className={styles.opts}>
                {(
                  [
                    ['full', '饱满'],
                    ['flat', '较平'],
                    ['high', '偏高/突出'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.opt} ${cheek === id ? styles.optOn : ''}`}
                    onClick={() => setCheek(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`s-card ${styles.card}`}>
              <p className={styles.q}>3. 脸的纵向长度？</p>
              <div className={styles.opts}>
                {(
                  [
                    ['short', '偏短/圆'],
                    ['balanced', '适中'],
                    ['long', '偏长'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.opt} ${length === id ? styles.optOn : ''}`}
                    onClick={() => setLength(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`s-card ${styles.card}`}>
              <p className={styles.q}>可选 · 自然光正面自拍</p>
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
              <span>同意本次分析；自拍仅用于本次，处理完即删除、不入库。</span>
            </label>
            {error ? <p className={styles.err}>{error}</p> : null}
            <button
              type="button"
              className="s-btn"
              disabled={!jaw || !cheek || !length || !consent || busy}
              onClick={() => void submit()}
            >
              {busy ? '分析中…' : '给我妆容建议'}
            </button>
          </>
        ) : (
          <div className={`s-card s-card--lined ${styles.card}`}>
            <span className="s-tape s-tape--sage" aria-hidden />
            <p className="s-eyebrow">{result.stub ? '规则妆容库' : 'VISION + 妆容库'}</p>
            <h2 className={`s-title ${styles.resultTitle}`}>{result.shapeLabel}</h2>
            <p className={styles.lead}>{result.summary}</p>
            <p className={styles.q}>妆容</p>
            <ul className={styles.list}>
              {result.makeup.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className={styles.q}>发型</p>
            <ul className={styles.list}>
              {result.hair.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className={styles.q}>少做</p>
            <ul className={styles.list}>
              {result.avoid.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className={styles.lead} style={{ color: 'var(--s-mute)', fontSize: 12 }}>
              已写入档案 · has_face
              {completeness != null ? ` · 完整度 ${completeness}%` : ''}
            </p>
            <Link href="/mirror/atelier/?mode=beauty" prefetch={false} className="s-btn" style={{ marginTop: 8 }}>
              去灵镜深度妆发
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
