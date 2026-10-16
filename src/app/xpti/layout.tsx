export default function XptiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Editorial paper theme is the default for XPTI landing + quiz.
  // Result pages can opt back into the dark seductive theme via their own wrapper.
  return (
    <div
      className="min-h-screen selection:bg-accent/25 selection:text-text-primary"
      style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      {children}
    </div>
  );
}
