'use client';

interface LogoProps {
  className?: string;
  height?: number;
  showMark?: boolean;
  showText?: boolean;
}

export function Logo({
  className,
  height = 28,
  showMark = true,
  showText = true,
}: LogoProps) {
  return (
    <svg
      className={`shrink-0 ${className ?? ''}`}
      width={(height * 90) / 34}
      height={height}
      viewBox="0 0 90 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WTFTI"
      role="img"
    >
      <defs>
        <linearGradient id="wtf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d6d" />
          <stop offset="100%" stopColor="#e06088" />
        </linearGradient>
      </defs>

      {showMark && (
        <>
          {/* Feminine W: outer legs curve inward like a silhouette,
              bottom flare suggests an A-line dress shape. */}
          <path
            d="M 8,6 Q 10,18 4,30 L 24,10 L 44,30 Q 38,18 40,6"
            stroke="url(#wtf-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Teardrop jewel above the waist — crown/essence accent */}
          <path
            d="M 24,2.5 C 26.5,5 26.5,7 24,8.5 C 21.5,7 21.5,5 24,2.5 Z"
            fill="url(#wtf-gradient)"
          />
        </>
      )}

      {showText && (
        <text
          x="54"
          y="28"
          fontSize="22"
          fontWeight="600"
          fontFamily="Space Grotesk, system-ui, sans-serif"
          fill="currentColor"
        >
          TI
        </text>
      )}
    </svg>
  );
}
