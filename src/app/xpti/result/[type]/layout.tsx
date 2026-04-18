export default function XptiResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Result pages now share the editorial paper theme with the rest of the
  // XPTI route. The outer /xpti/layout.tsx already paints the paper bg.
  return <>{children}</>;
}
