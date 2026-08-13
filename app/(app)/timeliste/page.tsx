import Link from "next/link";
import { getOpenTimeClock } from "@/lib/time-clock-query";
import { db } from "@/lib/db";
import { requireHourlyUser } from "@/lib/dal";
import { decimalToNumber, formatHours } from "@/lib/format";
import {
  mondayOf,
  parseWeekParam,
  shiftWeek,
  weekFromMonday,
  weekParam,
  ymdKey,
  osloYmd,
} from "@/lib/period";
import { formatDate } from "@/lib/time";
import { outlineActionClass, cardStaticClass } from "@/lib/ui";
import { ManualEntryDisclosure } from "@/components/manual-entry-disclosure";
import { TimeClockPanel } from "@/components/time-clock-panel";
import { TimeEntryForm } from "./time-entry-form";

export default async function TimeSheetPage({
  searchParams,
}: PageProps<"/timeliste">) {
  const user = await requireHourlyUser();
  const { uke } = await searchParams;

  const monday =
    parseWeekParam(typeof uke === "string" ? uke : undefined) ?? mondayOf();
  const week = weekFromMonday(monday);
  const previous = shiftWeek(monday, -1);
  const next = shiftWeek(monday, 1);
  const thisMonday = mondayOf();
  const isCurrent = weekParam(monday) === weekParam(thisMonday);
  const todayKey = ymdKey(osloYmd(new Date()));

  const [entries, openClockRow] = await Promise.all([
    db.timeEntry.findMany({
      where: {
        userId: user.id,
        workedOn: { gte: week.start, lt: week.end },
      },
      orderBy: [{ workedOn: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        hours: true,
        comment: true,
        workedOn: true,
      },
    }),
    getOpenTimeClock(),
  ]);

  const rows = entries.map((entry) => ({
    id: entry.id,
    hours: decimalToNumber(entry.hours),
    comment: entry.comment,
    dateLabel: formatDate(entry.workedOn),
  }));

  const totalHours = rows.reduce((sum, row) => sum + row.hours, 0);

  const openClock = openClockRow
    ? {
        kind: openClockRow.kind,
        customerId: openClockRow.customerId,
        customerName: openClockRow.customer?.name ?? null,
        startedAt: openClockRow.startedAt.toISOString(),
      }
    : null;

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Timeliste</h1>
          <p className="text-body text-navy-700">Dine timer · {week.label}</p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/timeliste?uke=${weekParam(previous.monday)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
          >
            Forrige
          </Link>
          {!isCurrent && (
            <Link
              href="/timeliste"
              className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
            >
              Denne
            </Link>
          )}
          <Link
            href={`/timeliste?uke=${weekParam(next.monday)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
          >
            Neste
          </Link>
        </div>
      </div>

      <div className={`flex flex-col gap-1.5 px-5 py-5 ${cardStaticClass}`}>
        <p className="text-meta font-medium text-navy-700">Totalt denne uken</p>
        <p className="font-mono text-display tabular-nums text-navy-900">
          {formatHours(totalHours)} t
        </p>
      </div>

      <TimeClockPanel mode="PAYROLL" openClock={openClock} />

      <ManualEntryDisclosure>
        <TimeEntryForm defaultDate={todayKey} />
      </ManualEntryDisclosure>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Registrert</h2>

        {rows.length === 0 ? (
          <p className={`px-4 py-5 text-body text-navy-700 ${cardStaticClass}`}>
            Ingen timer ført denne uken.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className={`flex flex-col gap-1 px-4 py-4 ${cardStaticClass}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-body font-semibold text-navy-900">
                    {row.dateLabel}
                  </p>
                  <p className="font-mono text-body tabular-nums text-navy-900">
                    {formatHours(row.hours)} t
                  </p>
                </div>
                <p className="text-body text-navy-700">{row.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
