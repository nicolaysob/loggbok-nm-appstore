export function PageLoading({ label = "Laster …" }: { label?: string }) {
  return (
    <div
      className="mx-auto flex w-full max-w-lg flex-col gap-4 py-8"
      role="status"
      aria-live="polite"
    >
      <p className="text-body font-medium text-ink-2">{label}</p>
      <div className="h-14 animate-pulse rounded-2xl bg-sunken" />
      <div className="h-14 animate-pulse rounded-2xl bg-sunken" />
      <div className="h-14 animate-pulse rounded-2xl bg-sunken" />
      <div className="h-32 animate-pulse rounded-2xl bg-sunken" />
    </div>
  );
}
