/**
 * CPTI is part of 「我和他」 (audit 2026-10-20 decision 3): URLs stay for SEO,
 * the look is v3 journal via the legacy-token bridge (src/app/skins.css .skin-bridge).
 */
export default function CptiLayout({ children }: { children: React.ReactNode }) {
  return <div className="skin-journal skin-bridge">{children}</div>;
}
