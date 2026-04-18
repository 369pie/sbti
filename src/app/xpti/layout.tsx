export default function XptiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Editorial paper theme is the default for XPTI landing + quiz.
  // Result pages can opt back into the dark seductive theme via their own wrapper.
  return (
    <div
      className="min-h-screen selection:bg-rose-200/60 selection:text-rose-900"
      style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}
    >
      {children}
    </div>
  );
}
