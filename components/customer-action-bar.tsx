import Link from "next/link";
import type { StaffAccess } from "@/lib/access";
import { actionSize, solidActionClass } from "@/lib/ui";

// «Oppgaver» er ikke egen flis lenger — kundens oppgaveliste ligger
// inne i Loggfør, så avkryssing og fritekst blir én registrering.
const tiles = [
  { href: "timer", label: "Timer", icon: "clock", capability: "hours" },
  { href: "avvik", label: "Avvik", icon: "issue", capability: "issues" },
  {
    href: "meldingsarkiv",
    label: "Meldinger",
    icon: "message",
    capability: "log",
  },
] as const;

function TileIcon({ name }: { name: (typeof tiles)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "message") {
    return (
      <svg {...common}>
        <path d="M20.5 11.5a7.9 7.9 0 0 1-8.5 7.9 8.6 8.6 0 0 1-3.1-.6L4 20.5l1.7-4.7a7.7 7.7 0 0 1-.7-3.4 7.9 7.9 0 0 1 8.5-7.9 7.9 7.9 0 0 1 7 7Z" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 8v4.5l3 1.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 9v4.5M12 17.2h.01M10.3 5.2 3.8 16.5A1.8 1.8 0 0 0 5.4 19h13.2a1.8 1.8 0 0 0 1.6-2.5L13.7 5.2a1.8 1.8 0 0 0-3.4 0Z" />
    </svg>
  );
}

export function CustomerActionBar({
  customerId,
  access,
  openIssues = 0,
  unreadMessages = 0,
}: {
  customerId: string;
  access: StaffAccess;
  openIssues?: number;
  unreadMessages?: number;
}) {
  const visible = tiles.filter((tile) => access[tile.capability]);
  if (!access.log && visible.length === 0) return null;

  const counts: Record<string, number> = {
    avvik: openIssues,
    meldingsarkiv: unreadMessages,
  };

  const cols =
    visible.length === 1
      ? "grid-cols-1"
      : visible.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="flex flex-col gap-2.5">
      {access.log ? (
        <Link
          href={`/kunde/${customerId}/loggfor`}
          prefetch
          className={`${actionSize} min-h-[3.625rem] ${solidActionClass}`}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Loggfør besøk
        </Link>
      ) : null}

      {visible.length > 0 ? (
        <div className={`grid ${cols} gap-2.5`}>
          {visible.map((tile) => {
            const count = counts[tile.href] ?? 0;
            return (
              <Link
                key={tile.href}
                href={`/kunde/${customerId}/${tile.href}`}
                prefetch
                className="relative flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-2xl border border-hair bg-surface px-1 text-ink shadow-card transition-colors active:bg-sunken"
              >
                {count > 0 ? (
                  <span
                    aria-hidden
                    className={`absolute right-2.5 top-2.5 flex min-w-[1.375rem] items-center justify-center rounded-full px-1.5 py-0.5 text-micro font-bold text-white ${
                      tile.href === "avvik" ? "bg-danger" : "bg-ink-3"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
                <TileIcon name={tile.icon} />
                <span className="text-meta font-bold leading-none">
                  {tile.label}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
