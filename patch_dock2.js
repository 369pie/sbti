const fs = require('fs');
const oldStr = fs.readFileSync('old_viewport.js', 'utf8');

const newStr = `function ShareCardViewport({
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
                  borderTopColor: '#C9A676',
                }}
              />
              <div style={{ color: '#D4B58A', fontSize: 13, letterSpacing: 4, textAlign: 'center' }}>
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
}`;

const path = 'src/components/galaxy/share/GalaxyShareDock.tsx';
let content = fs.readFileSync(path, 'utf8');
if (content.includes(oldStr)) {
  fs.writeFileSync(path, content.replace(oldStr, newStr));
  console.log("Success");
} else {
  console.log("oldStr not found");
}
