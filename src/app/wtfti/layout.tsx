import type { ReactNode } from 'react';

export default function WtftiLayout({ children }: { children: ReactNode }) {
  return <div className="wtfti-site-shell">{children}</div>;
}
