import { ImageResponse } from 'next/og';

export const socialImageAlt = 'SBTI personality test preview image';

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const socialImageContentType = 'image/png';

export function createSocialImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 55%, #1f2937 100%)',
          color: '#f8fafc',
          padding: '52px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '380px',
            height: '380px',
            borderRadius: '999px',
            background: 'rgba(249, 115, 22, 0.18)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-40px',
            width: '320px',
            height: '320px',
            borderRadius: '999px',
            background: 'rgba(34, 211, 238, 0.12)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(15, 23, 42, 0.55)',
              padding: '12px 18px',
              fontSize: '24px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            SBTI
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '28px',
              maxWidth: '760px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '96px',
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              Find your type.
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '16px',
                fontSize: '34px',
                lineHeight: 1.3,
                color: '#cbd5e1',
              }}
            >
              5 models, 15 dimensions, 27 personality results.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '999px',
                  background: 'rgba(249, 115, 22, 0.14)',
                  border: '1px solid rgba(249, 115, 22, 0.45)',
                  padding: '10px 16px',
                  fontSize: '22px',
                  color: '#fdba74',
                }}
              >
                27 results
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '999px',
                  background: 'rgba(34, 211, 238, 0.14)',
                  border: '1px solid rgba(34, 211, 238, 0.4)',
                  padding: '10px 16px',
                  fontSize: '22px',
                  color: '#67e8f9',
                }}
              >
                15 dimensions
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.14)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '10px 16px',
                  fontSize: '22px',
                  color: '#6ee7b7',
                }}
              >
                Pure frontend
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: '24px',
                fontSize: '22px',
                color: '#94a3b8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              sbtinb.com
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              padding: '22px 24px',
              borderRadius: '28px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '18px',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Featured types
            </div>
            <div style={{ display: 'flex', marginTop: '14px', gap: '10px' }}>
              {['CTRL', 'BOSS', 'CHILL'].map((label, index) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    width: '82px',
                    height: '82px',
                    borderRadius: '22px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      index === 0
                        ? 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)'
                        : index === 1
                          ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                          : 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
                    color: '#020617',
                    fontSize: '21px',
                    fontWeight: 800,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}