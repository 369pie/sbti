'use client';

/**
 * /mirror/palm · 掌纹仪式（velvet）
 * photo → API → structured lines overlay；写 has_palm；照片不落库。
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { getApiPath } from '@/lib/api';
import type { PalmHand, PalmLine, PalmReadingResult } from '@/lib/mirror/palm-reading';

import styles from './palm.module.css';

const MAX_SIDE = 1400;
const MAX_DATA_URI = 2_800_000;

type Phase = 'idle' | 'reading' | 'done' | 'guest' | 'error';

function lineClass(key: PalmLine['key']): string {
  if (key === 'life') return styles.lineLife;
  if (key === 'head') return styles.lineHead;
  if (key === 'heart') return styles.lineHeart;
  return styles.lineFate;
}

function pointsToPath(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 100} ${p.y * 100}`).join(' ');
}

async function fileToDataUrl(file: File): Promise<string> {
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
  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > MAX_DATA_URI && quality > 0.45) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  if (dataUrl.length > MAX_DATA_URI) throw new Error('too_large');
  return dataUrl;
}

export function PalmClient() {
  const [hand, setHand] = useState<PalmHand>('right');
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<PalmReadingResult | null>(null);
  const [completeness, setCompleteness] = useState<number | null>(null);
  const [replayed, setReplayed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/mirror/palm' });
  }, []);

  const onFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setReading(null);
    setPhase('idle');
    try {
      const url = await fileToDataUrl(file);
      setPreview(url);
    } catch {
      setError('照片太大或格式不对，换一张清晰的掌心照试试');
      setPreview(null);
    }
  }, []);

  const submit = useCallback(async () => {
    if (!preview || !consent) return;
    setPhase('reading');
    setError(null);
    try {
      const res = await fetch(getApiPath('/mirror/palm/'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: preview,
          hand,
          consentAccepted: true,
        }),
      });
      if (res.status === 401) {
        setPhase('guest');
        return;
      }
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reading?: PalmReadingResult;
        replayed?: boolean;
        profile?: { completeness_pct?: number } | null;
      };
      if (!res.ok || !data.ok || !data.reading) {
        setError(
          data.error === 'rate_limited'
            ? '太频繁了，稍等一分钟再试'
            : data.error === 'consent_required'
              ? '请先勾选同意说明'
              : '这次没读出来，换张光线好一点的掌心照再试',
        );
        setPhase('error');
        return;
      }
      setReading(data.reading);
      setReplayed(Boolean(data.replayed));
      setCompleteness(data.profile?.completeness_pct ?? null);
      setPhase('done');
      // Drop heavy payload from memory after success — keep preview for overlay only.
    } catch {
      setError('网络不太稳，稍后再试');
      setPhase('error');
    }
  }, [preview, consent, hand]);

  return (
    <main className={`skin-velvet ${styles.page}`}>
      <div className={styles.inner}>
        <Link href="/mirror/" prefetch={false} className={styles.back}>
          ← 美我
        </Link>

        <header className={styles.hero}>
          <p className="s-eyebrow">PALM · 掌纹</p>
          <h1 className={`s-title ${styles.title}`}>手心里的地图</h1>
          <p className={styles.sub}>拍一张掌心。我们只在这一次标出四条主线——照片处理完就丢掉。</p>
        </header>

        {phase === 'guest' ? (
          <div className={`s-card ${styles.card} ${styles.guest}`}>
            <p>掌纹会写进你的档案，请先登录。</p>
            <Link href="/auth/login/?next=/mirror/palm/" prefetch={false}>
              去登录 →
            </Link>
          </div>
        ) : (
          <>
            <div className={`s-card ${styles.card}`}>
              <div className={styles.handRow}>
                <button
                  type="button"
                  className={`${styles.handBtn} ${hand === 'left' ? styles.handBtnOn : ''}`}
                  onClick={() => setHand('left')}
                >
                  左手
                </button>
                <button
                  type="button"
                  className={`${styles.handBtn} ${hand === 'right' ? styles.handBtnOn : ''}`}
                  onClick={() => setHand('right')}
                >
                  右手
                </button>
              </div>

              <div className={styles.previewWrap}>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="掌心预览" />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--s-mute)',
                      fontSize: 13,
                      letterSpacing: '0.14em',
                    }}
                  >
                    掌心朝上 · 光线均匀
                  </div>
                )}
                {reading ? (
                  <svg className={styles.overlay} viewBox="0 0 100 100" preserveAspectRatio="none">
                    {reading.lines.map((line) => (
                      <path
                        key={line.key}
                        d={pointsToPath(line.points)}
                        fill="none"
                        strokeWidth="1.2"
                        className={lineClass(line.key)}
                        opacity={0.9}
                      />
                    ))}
                  </svg>
                ) : null}
              </div>

              <div className={styles.upload}>
                <label className={styles.fileBtn}>
                  {preview ? '换一张掌心照' : '上传掌心照'}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={onFile}
                  />
                </label>
              </div>

              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  我同意本次仅用这张照片做掌纹分析；照片不会入库或公开展示，处理完即删除。
                </span>
              </label>

              {error ? <p className={styles.err}>{error}</p> : null}

              <button
                type="button"
                className="s-btn"
                disabled={!preview || !consent || phase === 'reading'}
                onClick={() => void submit()}
              >
                {phase === 'reading' ? '正在描线…' : '开始阅读'}
              </button>
            </div>

            {reading && phase === 'done' ? (
              <div className={`s-card ${styles.card}`}>
                {reading.stub ? <span className={styles.stubTag}>演示解读</span> : null}
                {replayed ? <span className={styles.stubTag}>同图复读 · 结果一致</span> : null}
                <p className={styles.meta}>
                  {reading.hand === 'left' ? '左手' : '右手'} · {reading.handShapeLabel}
                  {completeness != null ? ` · 档案 ${completeness}%` : ''}
                </p>
                <p className={`s-title ${styles.summary}`}>{reading.summary}</p>
                <div className={styles.lines}>
                  {reading.lines.map((line) => (
                    <div key={line.key} className={styles.lineItem}>
                      <h3>
                        {line.label}
                        <span style={{ opacity: 0.55, fontWeight: 400 }}>
                          {' '}
                          · {line.length}/{line.quality}
                        </span>
                      </h3>
                      <p>{line.reading}</p>
                    </div>
                  ))}
                </div>
                <p className={styles.meta} style={{ marginTop: 16 }}>
                  已写入档案 · has_palm。娱乐向自照，非命运断言。
                </p>
                <Link href="/today/" prefetch={false} className="s-btn" style={{ marginTop: 12 }}>
                  去看今日卡
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
