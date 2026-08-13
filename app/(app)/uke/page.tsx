import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { decimalToNumber, formatHours } from "@/lib/format";
import { currentWeek } from "@/lib/period";
import { cardClass, cardStaticClass } from "@/lib/ui";

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Denne uken</h1>
          <p className="text-body text-navy-700">{week.label}</p>
        </div>
        <Link
          href="/mnd"
          className="text-meta font-medium text-navy-700 hover:text-navy-900"
        >
          Se fakturering →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`px-4 py-4 ${cardStaticClass}`}>
          <p className="text-meta font-medium text-navy-700">Ekstraarbeid</p>
          <p className="font-mono text-display tabular-nums text-navy-900">
            {formatHours(totalHours)} t
          </p>
        </div>
        <div className={`px-4 py-4 ${cardStaticClass}`}>
          <p className="text-meta font-medium text-navy-700">Åpne avvik</p>
          <p className="font-mono text-display tabular-nums text-navy-900">
            {totalOpen}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-body text-navy-700">
          Ingen ekstraarbeid denne uken, og ingen åpne avvik.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((item) => (
            <li key={item.customerId}>
              <Link
                href={`/kunde/${item.customerId}`}
                className={`flex min-h-16 flex-col justify-center gap-1 px-4 py-3 active:bg-navy-50 ${cardClass}`}
              >
                <span className="text-heading text-navy-900">{item.name}</span>
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
