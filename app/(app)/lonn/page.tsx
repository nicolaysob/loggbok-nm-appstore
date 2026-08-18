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
import { formatDate } from "@/lib/time";
import { outlineActionClass, cardStaticClass } from "@/lib/ui";
import { PayrollFolders, type PayrollFolder } from "./payroll-folders";

export default async function PayrollPage({
  searchParams,
}: PageProps<"/lonn">) {
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

  const entries = await db.timeEntry.findMany({
    where: {
      workedOn: { gte: period.start, lt: period.end },
      user: { payType: "HOURLY" },
    },
    orderBy: [{ workedOn: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      hours: true,
      comment: true,
      workedOn: true,
      user: { select: { id: true, name: true } },
    },
  });

  const byUser = new Map<string, PayrollFolder>();
  for (const entry of entries) {
    const hours = decimalToNumber(entry.hours);
    const existing = byUser.get(entry.user.id);
    const row = {
      id: entry.id,
      dateLabel: formatDate(entry.workedOn),
      hours,
      comment: entry.comment,
    };
    if (existing) {
      existing.hours += hours;
      existing.rows.push(row);
    } else {
      byUser.set(entry.user.id, {
        userId: entry.user.id,
        name: entry.user.name,
        hours,
        rows: [row],
      });
    }
  }

  const folders = [...byUser.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "nb-NO"),
  );
  const totalHours = folders.reduce((sum, folder) => sum + folder.hours, 0);

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display">Lønn</h1>
          <p className="text-body text-ink-2">
            Timelister fra timesbetalte · {period.label}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/lonn?maaned=${yearMonthParam(previous.year, previous.month)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-center text-body font-semibold ${outlineActionClass}`}
          >
            {previous.label}
          </Link>
          {!isCurrent && (
            <Link
              href="/lonn"
              className={`flex min-h-12 flex-1 items-center justify-center px-3 text-center text-body font-semibold ${outlineActionClass}`}
            >
              Denne
            </Link>
          )}
          <Link
            href={`/lonn?maaned=${yearMonthParam(next.year, next.month)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-center text-body font-semibold ${outlineActionClass}`}
          >
            {next.label}
          </Link>
        </div>
      </div>

      <div className={`flex flex-col gap-1.5 px-5 py-5 ${cardStaticClass}`}>
        <p className="text-meta text-ink-2">Totalt {period.label.toLowerCase()}</p>
        <p className="font-mono text-display tabular-nums text-ink">
          {formatHours(totalHours)} t
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Ansatte</h2>
        <PayrollFolders folders={folders} />
      </section>
    </div>
  );
}
