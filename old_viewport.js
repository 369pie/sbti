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
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            borderRadius: 20,
            border: '1px solid rgba(201,166,118,0.2)',
            boxShadow: '0 30px 60px -24px rgba(0,0,0,0.68)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImageUrl}
            alt="人格神域大分享卡"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              background: '#120d26',
            }}
          />
        </div>
      </div>

      <div style={sheetActionGridStyle}>
        <button type="button" onClick={() => void onSave()} style={sheetPrimaryBtnStyle}>
          {pendingAction === 'save' ? '保存中…' : '保存图片'}
        </button>
        <button type="button" onClick={() => void onShareWeChat()} style={sheetSecondaryBtnStyle}>
          {pendingAction === 'wechat' ? '发送中…' : '发微信'}
        </button>
        <button type="button" onClick={() => void onShareXiaohongshu()} style={sheetSecondaryBtnStyle}>
          {pendingAction === 'xiaohongshu' ? '发送中…' : '发小红书'}
        </button>
        <button type="button" onClick={() => void onCopy()} style={sheetGhostBtnStyle}>
          {copied ? '✓ 链接已复制' : pendingAction === 'copy' ? '复制中…' : '复制链接'}
        </button>
      </div>

      {saveHint ? <p style={sheetHintStyle}>{saveHint}</p> : null}
    </div>
  );
}
