import Link from "next/link";

export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      {title ? (
        <p className="px-1 pb-0.5 text-eyebrow uppercase text-ink-3">{title}</p>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-hair bg-surface shadow-card">
        {children}
      </div>
    </section>
  );
}

export function SettingsLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-14 items-center justify-between gap-3 border-b border-hair px-4 last:border-b-0 active:bg-sunken"
    >
      <span className="text-body font-medium text-ink">{label}</span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5 shrink-0 text-ink-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
    </Link>
  );
}

export function SettingsButton({
  label,
  type = "submit",
  destructive = false,
}: {
  label: string;
  type?: "submit" | "button";
  destructive?: boolean;
}) {
  return (
    <button
      type={type}
      className={`flex min-h-14 w-full items-center px-4 text-body font-semibold active:bg-sunken ${
        destructive ? "text-danger" : "text-ink"
      }`}
    >
      {label}
    </button>
  );
}
