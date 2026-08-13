import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { roleLabels } from "@/lib/labels";
import { daysSince, formatLastVisit } from "@/lib/time";
import { ProfileMenu } from "@/components/profile-menu";

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
  const todayLabel = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  }).format(new Date());
  const today =
    todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-meta font-medium text-navy-700">{today}</p>
          <h1 className="text-display tracking-tight text-navy-900">
            Hei, {firstName}
          </h1>
        </div>
        <ProfileMenu
          initial={firstName.charAt(0).toUpperCase()}
          name={user.name}
          subtitle={roleLabels[user.role]}
          links={[
            { href: "/profil", label: "Profil" },
            { href: "/support", label: "Support" },
            { href: "/personvern", label: "Personvern" },
          ]}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-md bg-white p-5 shadow-card">
          <p className="text-body text-navy-700">
            Ingen aktive kunder er lagt inn ennå.
          </p>
          {user.role === "ADMIN" && (
            <Link
              href="/kunder"
              className="mt-3 inline-flex min-h-12 items-center text-body font-semibold text-brand"
            >
              Gå til kundeadministrasjon
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-md bg-white px-3 py-3.5 shadow-card">
              <p
                className={`font-mono text-[1.65rem] font-bold leading-none ${
                  totalOpen > 0 ? "text-red-700" : "text-navy-900"
                }`}
              >
                {totalOpen}
              </p>
              <p className="mt-1.5 text-meta text-navy-700">Avvik</p>
            </div>
            <div className="rounded-md bg-white px-3 py-3.5 shadow-card">
              <p
                className={`font-mono text-[1.65rem] font-bold leading-none ${
                  totalTodos > 0 ? "text-amber-700" : "text-navy-900"
                }`}
              >
                {totalTodos}
              </p>
              <p className="mt-1.5 text-meta text-navy-700">Gjøremål</p>
            </div>
            <div className="rounded-md bg-brand px-3 py-3.5 shadow-brand">
              <p className="font-mono text-[1.65rem] font-bold leading-none text-white">
                {sorted.length}
              </p>
              <p className="mt-1.5 text-meta text-white/85">Kunder</p>
            </div>
          </div>

          {totalUnread > 0 && (
            <p className="px-0.5 text-meta font-medium text-navy-700">
              {totalUnread === 1
                ? "1 usignert melding"
                : `${totalUnread} usignerte meldinger`}
            </p>
          )}

          <ul className="flex flex-col gap-3">
            {sorted.map((customer) => {
              const tone = visitTone(customer.lastVisit);
              const initial = customer.name.charAt(0).toUpperCase();
              return (
                <li key={customer.id}>
                  <div className="flex items-stretch overflow-hidden rounded-md bg-white shadow-card">
                    <Link
                      href={`/kunde/${customer.id}`}
                      prefetch
                      className="flex min-h-[4.5rem] min-w-0 flex-1 items-center gap-3 py-3 pl-3.5 pr-2 text-navy-900 active:bg-navy-50"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-heading font-semibold text-brand">
                        {initial}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-heading font-semibold">
                          {customer.name}
                        </span>
                        <span className="flex flex-wrap items-center gap-1.5">
                          {customer.openIssues > 0 && (
                            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-meta font-medium text-red-700">
                              {customer.openIssues} avvik
                            </span>
                          )}
                          {customer.unreadMessages > 0 && (
                            <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-meta font-medium text-navy-800">
                              {customer.unreadMessages} melding
                              {customer.unreadMessages === 1 ? "" : "er"}
                            </span>
                          )}
                          {customer.openTodos > 0 && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-meta font-medium text-amber-700">
                              {customer.openTodos} gjøremål
                            </span>
                          )}
                          <span
                            className={`font-mono text-meta font-medium ${tone.className}`}
                          >
                            {tone.label}
                          </span>
                        </span>
                      </span>
                    </Link>
                    <Link
                      href={`/kunde/${customer.id}/loggfor`}
                      prefetch
                      aria-label={`Loggfør besøk hos ${customer.name}`}
                      className="flex w-16 shrink-0 items-center justify-center active:opacity-80"
                    >
                      <span className="flex size-11 items-center justify-center rounded-full bg-brand text-white shadow-brand">
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
