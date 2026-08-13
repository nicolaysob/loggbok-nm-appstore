import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { decimalToNumber, formatHours } from "@/lib/format";
import { currentWeek } from "@/lib/period";
import { cardClass, outlineActionClass } from "@/lib/ui";

export default async function WeekSummaryPage() {
  await requireAdmin();
  const week = currentWeek();

  const [extraWork, openIssues] = await Promise.all([
    db.logEntry.findMany({
      where: {
        type: "EXTRA_WORK",
        occurredAt: { gte: week.start, lt: week.end },
      },
      select: {
        hours: true,
        area: {
          select: { customerId: true, customer: { select: { name: true } } },
        },
      },
    }),
    db.issue.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      select: {
        area: {
          select: { customerId: true, customer: { select: { name: true } } },
        },
      },
    }),
  ]);

  type Row = {
    customerId: string;
    name: string;
    hours: number;
    openIssues: number;
  };

  const byCustomer = new Map<string, Row>();

  function row(customerId: string, name: string): Row {
    const existing = byCustomer.get(customerId);
    if (existing) return existing;
    const created = { customerId, name, hours: 0, openIssues: 0 };
    byCustomer.set(customerId, created);
    return created;
  }

  for (const entry of extraWork) {
    const current = row(entry.area.customerId, entry.area.customer.name);
    current.hours += entry.hours ? decimalToNumber(entry.hours) : 0;
  }

  for (const issue of openIssues) {
    row(issue.area.customerId, issue.area.customer.name).openIssues += 1;
  }

  const rows = [...byCustomer.values()].sort((a, b) => {
    if (b.hours !== a.hours) return b.hours - a.hours;
    if (b.openIssues !== a.openIssues) return b.openIssues - a.openIssues;
    return a.name.localeCompare(b.name, "nb-NO");
  });

  const totalHours = rows.reduce((sum, item) => sum + item.hours, 0);
  const totalOpen = rows.reduce((sum, item) => sum + item.openIssues, 0);

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Denne uken</h1>
          <p className="text-body text-navy-700">{week.label}</p>
        </div>
        <Link
          href="/mnd"
          className={`flex min-h-[4.5rem] items-center justify-between px-4 ${outlineActionClass}`}
        >
          <span className="text-heading font-semibold">Se fakturering</span>
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-full bg-navy-50"
          >
            ›
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-md bg-white px-3.5 py-4 shadow-card">
          <p className="text-meta text-navy-700">Ekstraarbeid</p>
          <p className="mt-1.5 font-mono text-[1.35rem] font-bold leading-tight text-navy-900">
            {formatHours(totalHours)} t
          </p>
        </div>
        <div
          className={`rounded-md px-3.5 py-4 shadow-card ${
            totalOpen > 0 ? "bg-red-50" : "bg-white"
          }`}
        >
          <p className="text-meta text-navy-700">Åpne avvik</p>
          <p
            className={`mt-1.5 font-mono text-[1.35rem] font-bold leading-tight ${
              totalOpen > 0 ? "text-red-700" : "text-navy-900"
            }`}
          >
            {totalOpen}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md bg-white px-5 py-5 text-body text-navy-700 shadow-card">
          Ingen ekstraarbeid denne uken, og ingen åpne avvik.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((item) => (
            <li key={item.customerId}>
              <Link
                href={`/kunde/${item.customerId}`}
                className={`flex min-h-[4.5rem] items-center justify-between gap-3 px-4 py-3 ${cardClass}`}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-heading font-semibold text-navy-900">
                    {item.name}
                  </span>
                  <span className="font-mono text-meta font-medium text-navy-700">
                    {formatHours(item.hours)} t ekstraarbeid
                    {item.openIssues > 0 && (
                      <>
                        {" · "}
                        <span className="font-semibold text-red-700">
                          {item.openIssues}{" "}
                          {item.openIssues === 1 ? "åpent avvik" : "åpne avvik"}
                        </span>
                      </>
                    )}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-50"
                >
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
