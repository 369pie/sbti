export default function XptiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Apply the dark seductive wine red theme to the entire XPTI route
  return <div className="xpti-dark-theme min-h-screen bg-bg-primary text-text-primary selection:bg-rose-900/40 selection:text-rose-100">{children}</div>;
}
