import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { daysSince, formatLastVisit } from "@/lib/time";

function visitTone(lastVisit: Date | null): {
  label: string;
  className: string;
} {
  if (!lastVisit) {
    return {
      label: "Aldri",
      className: "text-amber-700",
    };
  }

  const days = daysSince(lastVisit);
  if (days >= 14) {
    return {
      label: formatLastVisit(lastVisit),
      className: "text-amber-700",
    };
  }
  if (days <= 0) {
    return {
      label: "I dag",
      className: "text-green-700",
    };
  }

  return {
    label: formatLastVisit(lastVisit),
    className: "text-navy-700",
  };
}

export default async function HomePage() {
  const user = await requireUser();

  // Lett kundeliste først — tellere og siste besøk hentes i to groupBy-kall
  // i stedet for nested take:1 per område (som ble tregt mot Supabase).
  const customers = await db.customer.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      areas: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true },
      },
      _count: {
        select: {
          messages: { where: { readAt: null } },
          todos: { where: { doneAt: null } },
        },
      },
    },
  });

  const areaIds = customers.flatMap((customer) =>
    customer.areas.map((area) => area.id),
  );
  const customerByArea = new Map(
    customers.flatMap((customer) =>
      customer.areas.map((area) => [area.id, customer.id] as const),
    ),
  );

  const [lastVisits, openIssueGroups] = await Promise.all([
    areaIds.length === 0
      ? Promise.resolve([])
      : db.logEntry.groupBy({
          by: ["areaId"],
          where: { areaId: { in: areaIds } },
          _max: { occurredAt: true },
        }),
    areaIds.length === 0
      ? Promise.resolve([])
      : db.issue.groupBy({
          by: ["areaId"],
          where: {
            areaId: { in: areaIds },
            status: { in: ["OPEN", "IN_PROGRESS"] },
          },
          _count: { _all: true },
        }),
  ]);

  const lastVisitByCustomer = new Map<string, Date>();
  for (const row of lastVisits) {
    const customerId = customerByArea.get(row.areaId);
    if (!customerId || !row._max.occurredAt) continue;
    const current = lastVisitByCustomer.get(customerId);
    if (!current || row._max.occurredAt > current) {
      lastVisitByCustomer.set(customerId, row._max.occurredAt);
    }
  }

  const openIssuesByCustomer = new Map<string, number>();
  for (const row of openIssueGroups) {
    const customerId = customerByArea.get(row.areaId);
    if (!customerId) continue;
    openIssuesByCustomer.set(
      customerId,
      (openIssuesByCustomer.get(customerId) ?? 0) + row._count._all,
    );
  }

  const sorted = customers
    .map((customer) => ({
      id: customer.id,
      name: customer.name,
      openIssues: openIssuesByCustomer.get(customer.id) ?? 0,
      unreadMessages: customer._count.messages,
      openTodos: customer._count.todos,
      lastVisit: lastVisitByCustomer.get(customer.id) ?? null,
    }))
    // Avvik → meldinger → gjøremål → eldste besøk
    .sort((a, b) => {
      if (a.openIssues > 0 !== b.openIssues > 0) {
        return a.openIssues > 0 ? -1 : 1;
      }
      if (b.openIssues !== a.openIssues) {
        return b.openIssues - a.openIssues;
      }
      if (a.unreadMessages > 0 !== b.unreadMessages > 0) {
        return a.unreadMessages > 0 ? -1 : 1;
      }
      if (b.unreadMessages !== a.unreadMessages) {
        return b.unreadMessages - a.unreadMessages;
      }
      if (a.openTodos > 0 !== b.openTodos > 0) {
        return a.openTodos > 0 ? -1 : 1;
      }
      if (b.openTodos !== a.openTodos) {
        return b.openTodos - a.openTodos;
      }
      if (!a.lastVisit && !b.lastVisit) {
        return a.name.localeCompare(b.name, "nb-NO");
      }
      if (!a.lastVisit) return -1;
      if (!b.lastVisit) return 1;
      return a.lastVisit.getTime() - b.lastVisit.getTime();
    });

  const firstName = user.name.split(/\s+/)[0] ?? user.name;
  const totalOpen = sorted.reduce((sum, row) => sum + row.openIssues, 0);
  const totalUnread = sorted.reduce((sum, row) => sum + row.unreadMessages, 0);
  const totalTodos = sorted.reduce((sum, row) => sum + row.openTodos, 0);

  if (sorted.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-4">
        <h1 className="text-display tracking-tight">Hei, {firstName}</h1>
        <p className="text-body text-navy-700">
          Ingen aktive kunder er lagt inn ennå.
        </p>
        {user.role === "ADMIN" && (
          <Link
            href="/kunder"
            className="text-body font-medium text-navy-700 hover:text-navy-900"
          >
            Gå til kundeadministrasjon
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-navy-900">
          Hei, {firstName}
        </h1>
        <p className="text-body text-navy-700">
          Trykk på en kunde for å loggføre.
          {totalOpen > 0
            ? ` ${totalOpen} åpne avvik står øverst.`
            : totalUnread > 0
              ? ` ${totalUnread === 1 ? "1 usignert melding" : `${totalUnread} usignerte meldinger`} står øverst.`
              : totalTodos > 0
                ? ` ${totalTodos === 1 ? "1 åpent gjøremål" : `${totalTodos} åpne gjøremål`} står øverst.`
                : " De som har ventet lengst står øverst."}
        </p>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white shadow-card">
        {sorted.map((customer) => {
          const tone = visitTone(customer.lastVisit);
          return (
            <li
              key={customer.id}
              className={`flex items-stretch ${
                customer.openIssues > 0
                  ? "bg-red-50/40"
                  : customer.unreadMessages > 0
                    ? "bg-navy-50/70"
                    : customer.openTodos > 0
                      ? "bg-amber-50/50"
                      : ""
              }`}
            >
              <Link
                href={`/kunde/${customer.id}`}
                prefetch
                className="flex min-h-16 min-w-0 flex-1 items-center gap-2.5 py-3.5 pl-4 pr-3 text-navy-900 transition-colors active:bg-navy-50"
              >
                <span className="min-w-0 flex-1 truncate text-heading">
                  {customer.name}
                </span>
                {customer.openIssues > 0 && (
                  <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-meta font-semibold text-red-700">
                    {customer.openIssues === 1
                      ? "1 avvik"
                      : `${customer.openIssues} avvik`}
                  </span>
                )}
                {customer.unreadMessages > 0 && (
                  <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-meta font-semibold text-navy-900">
                    {customer.unreadMessages === 1
                      ? "1 melding"
                      : `${customer.unreadMessages} meldinger`}
                  </span>
                )}
                {customer.openTodos > 0 && (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-meta font-semibold text-amber-700">
                    {customer.openTodos === 1
                      ? "1 gjøremål"
                      : `${customer.openTodos} gjøremål`}
                  </span>
                )}
                <span
                  className={`shrink-0 font-mono text-meta font-medium ${tone.className}`}
                >
                  {tone.label}
                </span>
              </Link>
              {/* Snarvei rett til loggføring — sparer turen innom kundekortet */}
              <Link
                href={`/kunde/${customer.id}/loggfor`}
                prefetch
                aria-label={`Loggfør besøk hos ${customer.name}`}
                className="flex w-14 shrink-0 items-center justify-center border-l border-line text-brand transition-colors active:bg-brand-50"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
