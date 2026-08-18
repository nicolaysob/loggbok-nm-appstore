import Link from "next/link";
import { formatLastVisit } from "@/lib/time";
import { badgeClass, type BadgeTone } from "@/lib/ui";
import type { CustomerOverviewRow } from "@/lib/customer-overview";

export function CustomerPickList({
  customers,
  canLog = true,
}: {
  customers: CustomerOverviewRow[];
  canLog?: boolean;
}) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-hair bg-surface shadow-card">
      {customers.map((customer) => (
        <li
          key={customer.id}
          className="flex items-stretch border-b border-hair last:border-b-0"
        >
          <Link
            href={`/kunde/${customer.id}`}
            prefetch
            className="flex min-h-[4.75rem] min-w-0 flex-1 items-center py-3.5 pl-4 text-ink active:bg-sunken"
          >
            <span className="min-w-0">
              <span className="block truncate text-heading">
                {customer.name}
              </span>
              <span className="mt-1 block truncate text-meta text-ink-2">
                Sist besøk: {formatLastVisit(customer.lastVisit).toLowerCase()}
              </span>
              <StatusBadges customer={customer} />
            </span>
          </Link>
          {canLog ? (
            <span className="flex shrink-0 items-center px-3">
              <Link
                href={`/kunde/${customer.id}/loggfor`}
                prefetch
                aria-label={`Loggfør hos ${customer.name}`}
                className="flex size-14 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-brand transition-colors active:bg-brand-strong"
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
              </Link>
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Merkelapper med tekst — små fargeprikker er ubrukelige i sollys. */
function StatusBadges({ customer }: { customer: CustomerOverviewRow }) {
  const badges: { key: string; tone: BadgeTone; label: string }[] = [];

  if (customer.openIssues > 0) {
    badges.push({
      key: "issues",
      tone: "danger",
      label:
        customer.openIssues === 1 ? "1 avvik" : `${customer.openIssues} avvik`,
    });
  }
  if (customer.openTodos > 0) {
    badges.push({
      key: "todos",
      tone: "warn",
      label:
        customer.openTodos === 1
          ? "1 gjøremål"
          : `${customer.openTodos} gjøremål`,
    });
  }
  if (customer.unreadMessages > 0) {
    badges.push({
      key: "messages",
      tone: "neutral",
      label:
        customer.unreadMessages === 1
          ? "Ny melding"
          : `${customer.unreadMessages} meldinger`,
    });
  }

  if (badges.length === 0) return null;

  return (
    <span className="mt-2 flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span key={badge.key} className={badgeClass[badge.tone]}>
          {badge.label}
        </span>
      ))}
    </span>
  );
}
