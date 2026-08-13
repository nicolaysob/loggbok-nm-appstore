import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { decimalToNumber, formatHours } from "@/lib/format";
import {
  calendarMonth,
  currentMonth,
  parseYearMonth,
  shiftMonth,
  yearMonthParam,
} from "@/lib/period";
import { backLinkClass, cardStaticClass } from "@/lib/ui";
import { BillingList, type BillingGroup } from "./billing-list";

function groupEntries(
  entries: {
    id: string;
    occurredAt: Date;
    hours: { toString(): string } | null;
    comment: string | null;
    user: { name: string };
    area: { customerId: string; customer: { name: string } };
  }[],
): BillingGroup[] {
  const byCustomer = new Map<string, BillingGroup>();

  for (const entry of entries) {
    const customerId = entry.area.customerId;
    let group = byCustomer.get(customerId);
    if (!group) {
      group = {
        customerId,
        name: entry.area.customer.name,
        hours: 0,
        lines: [],
      };
      byCustomer.set(customerId, group);
    }

    const hours = entry.hours ? decimalToNumber(entry.hours) : 0;
    group.hours += hours;
    group.lines.push({
      id: entry.id,
      at: entry.occurredAt,
      hours,
      comment: entry.comment,
      userName: entry.user.name,
    });
  }

  return [...byCustomer.values()].sort((a, b) => {
    if (b.hours !== a.hours) return b.hours - a.hours;
    return a.name.localeCompare(b.name, "nb-NO");
  });
}

export default async function BillingPage({
  searchParams,
}: PageProps<"/mnd">) {
  await requireAdmin();
  const { maaned } = await searchParams;

  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );
  const period = parsed
    ? calendarMonth(parsed.year, parsed.month)
    : currentMonth();

  const previous = shiftMonth(period.year, period.month, -1);
  const next = shiftMonth(period.year, period.month, 1);
  const thisMonth = currentMonth();
  const isCurrent =
    period.year === thisMonth.year && period.month === thisMonth.month;

  const entries = await db.logEntry.findMany({
    where: {
      type: "EXTRA_WORK",
      occurredAt: { gte: period.start, lt: period.end },
    },
    orderBy: { occurredAt: "asc" },
    select: {
      id: true,
      occurredAt: true,
      hours: true,
      comment: true,
      handledAt: true,
      user: { select: { name: true } },
      area: {
        select: { customerId: true, customer: { select: { name: true } } },
      },
    },
  });

  const open = groupEntries(entries.filter((entry) => entry.handledAt === null));
  const done = groupEntries(entries.filter((entry) => entry.handledAt !== null));
  const openHours = open.reduce((sum, group) => sum + group.hours, 0);
  const doneHours = done.reduce((sum, group) => sum + group.hours, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Fakturering</h1>
          <p className="text-body text-navy-700">
            Ekstratimer i {period.label.toLowerCase()}. Huk av når de er lagt
            inn — de flyttes til ferdig håndtert.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/mnd?maaned=${yearMonthParam(previous.year, previous.month)}`}
            className={backLinkClass}
          >
            ← {previous.label}
          </Link>
          {!isCurrent && (
            <Link href="/mnd" className={backLinkClass}>
              Denne måneden
            </Link>
          )}
          <Link
            href={`/mnd?maaned=${yearMonthParam(next.year, next.month)}`}
            className={backLinkClass}
          >
            {next.label} →
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`px-4 py-4 ${cardStaticClass}`}>
          <p className="text-meta font-medium text-navy-700">Til faktura</p>
          <p className="font-mono text-display tabular-nums text-navy-900">
            {formatHours(openHours)} t
          </p>
        </div>
        <div className={`px-4 py-4 ${cardStaticClass}`}>
          <p className="text-meta font-medium text-navy-700">Håndtert</p>
          <p className="font-mono text-display tabular-nums text-navy-900">
            {formatHours(doneHours)} t
          </p>
        </div>
      </div>

      <BillingList
        title="Til fakturering"
        emptyText={`Ingen åpne ekstratimer i ${period.label.toLowerCase()}.`}
        groups={open}
        handled={false}
      />

      <BillingList
        title="Ferdig håndtert"
        emptyText="Ingen håndterte poster denne måneden."
        groups={done}
        handled={true}
      />
    </div>
  );
}
