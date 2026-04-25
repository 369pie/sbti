'use client';

/**
 * GalaxyShareDock · 结果页底部悬浮 dock + 大分享卡抽屉
 *
 * 功能：
 *  - 复制分享链接（result/[id] 的公共可访问 URL）
 *  - 打开大分享卡（服务端 PNG 预览）
 *  - 保存图片（桌面直下，移动端走系统保存/分享面板）
 *  - 快捷分享（显式写成微信 / 小红书，底层走系统文件分享）
 */

import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { downloadBlob } from '@/lib/museum/share-card';
import { trackGalaxyEvent } from '@/lib/wtfi/galaxy-analytics';
import { SHARE_SITE_URL } from '@/lib/site';
import type { GalaxySession } from '@/lib/wtfi/galaxy-session';

export function GalaxyShareDock({ session }: { session: GalaxySession }) {
  const [cardOpen, setCardOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveHint, setSaveHint] = useState('');
  const [pendingAction, setPendingAction] = useState<
    'save' | 'wechat' | 'xiaohongshu' | 'copy' | null
  >(null);

  const shareUrl = `${SHARE_SITE_URL}wtfti/galaxy/result/${session.resultId}/`;
  const cardImageUrl = useMemo(() => buildShrineCardUrl(session), [session]);
  const fileName = useMemo(() => {
    const shadowPart = session.result.shadow ? `-${session.result.shadow.bucket}` : '';
    return `wtfti-galaxy-${session.personalitySlug}-${session.result.homePlanet.code.toLowerCase()}${shadowPart}.png`;
  }, [session]);

  const handleCopy = useCallback(async () => {
    try {
      setPendingAction('copy');
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      trackGalaxyEvent('galaxy_share_card_open', {
        slug: session.personalitySlug,
        step: 'copy_link',
      });
    } catch {
      /* noop */
    } finally {
      setPendingAction(null);
    }
  }, [shareUrl, session.personalitySlug]);

  const handleOpenCard = useCallback(() => {
    setCardOpen(true);
    setSaveHint('');
    trackGalaxyEvent('galaxy_share_card_open', {
      slug: session.personalitySlug,
      step: 'open_sheet',
    });
  }, [session.personalitySlug]);

  const createPreviewFile = useCallback(async () => {
    const response = await fetch(cardImageUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/png' });
  }, [cardImageUrl, fileName]);

  const handleDownload = useCallback(async () => {
    setPendingAction('save');
    setSaveHint('');
    try {
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择“保存到照片”或“存储到文件”。');
            await navigator.share({ files: [file], title: file.name });
            trackGalaxyEvent('galaxy_share_card_download', {
              slug: session.personalitySlug,
              step: 'save_via_system_sheet',
            });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
        }

        setSaveHint(
          isWeChatBrowser()
            ? '微信内置浏览器不支持直接弹出保存面板，请长按上方图片保存，或右上角用系统浏览器打开后再保存。'
            : '当前浏览器不能直接弹出保存面板，请长按上方图片保存到相册。',
        );
        trackGalaxyEvent('galaxy_share_card_download', {
          slug: session.personalitySlug,
          step: 'save_hint_fallback',
        });
        return;
      }

      const blob = await (await fetch(cardImageUrl)).blob();
      downloadBlob(blob, fileName);
      trackGalaxyEvent('galaxy_share_card_download', {
        slug: session.personalitySlug,
        step: 'desktop_download',
      });
    } finally {
      setPendingAction(null);
    }
  }, [cardImageUrl, createPreviewFile, fileName, session.personalitySlug]);

  const handleChannelShare = useCallback(
    async (channel: 'wechat' | 'xiaohongshu') => {
      setPendingAction(channel);
      setSaveHint(`系统将打开分享面板，请选择${channel === 'wechat' ? '微信' : '小红书'}。`);
      try {
        const file = await createPreviewFile();
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title:
              channel === 'wechat'
                ? `WTFTI 人格神域 · ${session.result.homePlanet.name}`
                : `我的人格神域是 ${session.result.homePlanet.name}`,
            text:
              channel === 'wechat'
                ? `把我的人格神域发给你：${shareUrl}`
                : `测出了我的人格神域：${session.result.homePlanet.name}。${shareUrl}`,
          });
          trackGalaxyEvent('galaxy_share_card_open', {
            slug: session.personalitySlug,
            step: `share_${channel}`,
          });
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }

      await handleDownload();
    },
    [createPreviewFile, handleDownload, session.personalitySlug, session.result.homePlanet.name, shareUrl],
  );

  return (
    <>
      <aside
        role="toolbar"
        aria-label="分享你的神域"
        style={dockStyle}
      >
        <button type="button" onClick={handleCopy} style={dockBtnStyle}>
          {copied ? '✓ 已复制' : '复制链接'}
        </button>
        <button type="button" onClick={handleOpenCard} style={dockPrimaryStyle}>
          ✦ 生成大分享卡 ✦
        </button>
        <button type="button" onClick={handleDownload} style={dockBtnStyle}>
          {pendingAction === 'save' ? '保存中…' : '保存图片'}
        </button>
      </aside>

      {cardOpen && (
        <CardSheet onClose={() => setCardOpen(false)}>
          <ShareCardViewport
            cardImageUrl={cardImageUrl}
            copied={copied}
            onCopy={handleCopy}
            onSave={handleDownload}
            onShareWeChat={() => void handleChannelShare('wechat')}
            onShareXiaohongshu={() => void handleChannelShare('xiaohongshu')}
            pendingAction={pendingAction}
            saveHint={saveHint}
          />
        </CardSheet>
      )}
    </>
  );
}

function ShareCardViewport({
  cardImageUrl,
  copied,
  onCopy,
  onSave,
  onShareWeChat,
  onShareXiaohongshu,
  pendingAction,
  saveHint,
}: {
  cardImageUrl: string;
  copied: boolean;
  onCopy: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
  onShareWeChat: () => void | Promise<void>;
  onShareXiaohongshu: () => void | Promise<void>;
  pendingAction: 'save' | 'wechat' | 'xiaohongshu' | 'copy' | null;
  saveHint: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 620,
        margin: '0 auto',
        padding: '0 12px 36px',
      }}
    >
      <p
        style={{
          textAlign: 'center',
          color: 'rgba(245,240,232,0.55)',
          fontSize: 12,
          letterSpacing: '0.2em',
          margin: '12px 0 16px',
          textTransform: 'uppercase',
        }}
      >
        SHRINE CARD · 保存或发给微信 / 小红书
      </p>
      
      <div style={sheetActionGridStyle}>
        <button type="button" disabled={!imageLoaded || !!pendingAction} onClick={() => void onSave()} style={{...sheetPrimaryBtnStyle, opacity: imageLoaded && pendingAction !== 'save' ? 1 : 0.5}}>
          {pendingAction === 'save' ? '保存中…' : '保存图片'}
        </button>
        <button type="button" disabled={!imageLoaded || !!pendingAction} onClick={() => void onShareWeChat()} style={{...sheetSecondaryBtnStyle, opacity: imageLoaded && pendingAction !== 'wechat' ? 1 : 0.5}}>
          {pendingAction === 'wechat' ? '发送中…' : '发微信'}
        </button>
        <button type="button" disabled={!imageLoaded || !!pendingAction} onClick={() => void onShareXiaohongshu()} style={{...sheetSecondaryBtnStyle, opacity: imageLoaded && pendingAction !== 'xiaohongshu' ? 1 : 0.5}}>
          {pendingAction === 'xiaohongshu' ? '发送中…' : '发小红书'}
        </button>
        <button type="button" disabled={!imageLoaded || !!pendingAction} onClick={() => void onCopy()} style={{...sheetGhostBtnStyle, opacity: imageLoaded && pendingAction !== 'copy' ? 1 : 0.5}}>
          {copied ? '✓ 链接已复制' : pendingAction === 'copy' ? '复制中…' : '复制链接'}
        </button>
      </div>

      {saveHint ? <p style={sheetHintStyle}>{saveHint}</p> : null}

      <div
        style={{
          width: '100%',
          maxWidth: 560,
          margin: '24px auto 0',
          position: 'relative',
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            borderRadius: 20,
            border: '1px solid rgba(201,166,118,0.2)',
            boxShadow: '0 30px 60px -24px rgba(0,0,0,0.68)',
            minHeight: 480,
            background: '#120d26',
            position: 'relative',
          }}
        >
          {!imageLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 40,
                background: 'radial-gradient(circle at 50% 30%, #1a1530 0%, #0f0a22 100%)',
                zIndex: 10,
              }}
            >
              {/* Spinning loader */}
              <div
                className="animate-spin"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '2px solid rgba(201,166,118,0.2)',
                  borderTopColor: 'var(--color-gold)',
                }}
              />
              <div style={{ color: 'var(--color-gold)', fontSize: 13, letterSpacing: 4, textAlign: 'center' }}>
                RENDERING SHRINE
              </div>
              <div style={{ color: 'rgba(245,240,232,0.6)', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
                正在将你的潜意识投影至神域<br/>
                （首次渲染耗时约 5-8 秒）
              </div>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImageUrl}
            alt="人格神域大分享卡"
            onLoad={() => setImageLoaded(true)}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              background: '#120d26',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
function CardSheet({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(10,8,32,0.88)',
        backdropFilter: 'blur(12px)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '16px 0 24px' }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 20px 12px',
            zIndex: 2,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(245,240,232,0.08)',
              color: 'rgba(245,240,232,0.85)',
              border: '1px solid rgba(245,240,232,0.18)',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            ✕ close
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

const dockStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 'max(16px, env(safe-area-inset-bottom))',
  display: 'flex',
  justifyContent: 'center',
  gap: 10,
  padding: '10px 14px',
  zIndex: 90,
  pointerEvents: 'none',
};

const dockBtnStyle: CSSProperties = {
  pointerEvents: 'auto',
  padding: '10px 16px',
  borderRadius: 999,
  background: 'rgba(26,21,48,0.78)',
  border: '1px solid rgba(201,166,118,0.32)',
  color: 'var(--galaxy-cream, #F5F0E8)',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontStyle: 'italic',
  fontSize: 13,
  letterSpacing: '0.08em',
  cursor: 'pointer',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 14px 30px -14px rgba(0,0,0,0.6)',
};

const dockPrimaryStyle: CSSProperties = {
  pointerEvents: 'auto',
  padding: '12px 22px',
  borderRadius: 999,
  background:
    'linear-gradient(120deg, var(--galaxy-rose, #C07A8E) 0%, var(--galaxy-gold, #C9A676) 100%)',
  border: 'none',
  color: 'var(--galaxy-ink, #1A1530)',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 14,
  letterSpacing: '0.14em',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow:
    '0 18px 40px -14px rgba(192,122,142,0.65), 0 0 0 1px rgba(245,240,232,0.18) inset',
};

const sheetActionGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  width: 'min(100%, 560px)',
  margin: '16px auto 0',
};

const sheetPrimaryBtnStyle: CSSProperties = {
  padding: '14px 18px',
  borderRadius: 16,
  border: 'none',
  background:
    'linear-gradient(120deg, var(--galaxy-rose, #C07A8E) 0%, var(--galaxy-gold, #C9A676) 100%)',
  color: 'var(--galaxy-ink, #1A1530)',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 16,
  letterSpacing: '0.08em',
  fontWeight: 600,
  cursor: 'pointer',
};

const sheetSecondaryBtnStyle: CSSProperties = {
  padding: '14px 18px',
  borderRadius: 16,
  border: '1px solid rgba(201,166,118,0.24)',
  background: 'rgba(245,240,232,0.06)',
  color: 'var(--galaxy-cream, #F5F0E8)',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 15,
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
};

const sheetGhostBtnStyle: CSSProperties = {
  ...sheetSecondaryBtnStyle,
  gridColumn: '1 / -1',
};

const sheetHintStyle: CSSProperties = {
  width: 'min(100%, 560px)',
  margin: '14px auto 0',
  textAlign: 'center',
  color: 'rgba(245,240,232,0.72)',
  fontSize: 12,
  lineHeight: 1.7,
};

function buildShrineCardUrl(session: GalaxySession) {
  const q = new URLSearchParams({
    home: session.result.homePlanet.slug,
    code: session.result.homePlanet.code,
    personality: session.personalitySlug,
  });
  if (session.result.shadow) {
    q.set('shadow', session.result.shadow.bucket);
  }
  return `/api/galaxy/shrine-card/?${q.toString()}`;
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}
