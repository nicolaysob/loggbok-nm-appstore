import Link from "next/link";
import { db } from "@/lib/db";
import { requireStaffAccess } from "@/lib/dal";
import { occursOn } from "@/lib/calendar";
import { weekdayLabels } from "@/lib/labels";
import {
  daysOfWeek,
  mondayOf,
  parseWeekParam,
  shiftWeek,
  weekFromMonday,
  weekParam,
  ymdKey,
  osloYmd,
} from "@/lib/period";
import { outlineActionClass } from "@/lib/ui";
import {
  CalendarBoard,
  type CalendarItem,
} from "./calendar-board";

const monthShort = new Intl.DateTimeFormat("nb-NO", {
  month: "short",
  timeZone: "UTC",
});

export default async function CalendarPage({
  searchParams,
}: PageProps<"/kalender">) {
  const user = await requireStaffAccess("calendar");
  const { uke } = await searchParams;

  const monday =
    parseWeekParam(typeof uke === "string" ? uke : undefined) ?? mondayOf();
  const week = weekFromMonday(monday);
  const previous = shiftWeek(monday, -1);
  const next = shiftWeek(monday, 1);
  const thisMonday = mondayOf();
  const isCurrent = weekParam(monday) === weekParam(thisMonday);
  const todayKey = ymdKey(osloYmd(new Date()));
  const days = daysOfWeek(monday);

  const [jobs, customers, jobTypes] = await Promise.all([
    db.customerJob.findMany({
      where: {
        OR: [
          { active: true },
          {
            completions: {
              some: {
                scheduledFor: { gte: week.start, lt: week.end },
              },
            },
          },
        ],
        area: { customer: { active: true } },
      },
      select: {
        id: true,
        kind: true,
        dueOn: true,
        weekday: true,
        startsOn: true,
        active: true,
        notes: true,
        title: true,
        jobType: { select: { name: true } },
        area: {
          select: {
            customerId: true,
            customer: { select: { name: true } },
          },
        },
        completions: {
          where: { scheduledFor: { gte: week.start, lt: week.end } },
          select: {
            scheduledFor: true,
            user: { select: { name: true } },
          },
        },
      },
    }),
    db.customer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.jobType.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  const pendingByDay = new Map<string, CalendarItem[]>();
  const doneByDay = new Map<string, CalendarItem[]>();
  for (const day of days) {
    pendingByDay.set(ymdKey(day), []);
    doneByDay.set(ymdKey(day), []);
  }

  for (const job of jobs) {
    const completionByDay = new Map(
      job.completions.map((completion) => [
        ymdKey(osloYmd(completion.scheduledFor)),
        completion.user.name,
      ]),
    );

    for (const day of days) {
      const key = ymdKey(day);
      if (!occursOn(job, day) && !completionByDay.has(key)) continue;

      const item: CalendarItem = {
        jobId: job.id,
        dayKey: key,
        customerId: job.area.customerId,
        customerName: job.area.customer.name,
        typeName: job.title || job.jobType?.name || "Oppdrag",
        notes: job.notes,
        completedBy: completionByDay.get(key) ?? null,
      };

      if (completionByDay.has(key)) {
        doneByDay.get(key)?.push(item);
      } else if (job.active && occursOn(job, day)) {
        pendingByDay.get(key)?.push(item);
      }
    }
  }

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display">Kalender</h1>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/kalender?uke=${weekParam(previous.monday)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
          >
            Forrige
          </Link>
          {!isCurrent && (
            <Link
              href="/kalender"
              className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
            >
              I dag
            </Link>
          )}
          <Link
            href={`/kalender?uke=${weekParam(next.monday)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
          >
            Neste
          </Link>
        </div>
      </div>

      <CalendarBoard
        weekLabel={week.label}
        canAdd={user.role === "ADMIN"}
        customers={customers}
        jobTypes={jobTypes}
        days={days.map((day, index) => {
          const key = ymdKey(day);
          const utc = new Date(Date.UTC(day.year, day.month - 1, day.day, 12));
          return {
            key,
            weekday: weekdayLabels[index],
            dayNumber: day.day,
            monthShort: monthShort.format(utc),
            isToday: key === todayKey,
            pending: pendingByDay.get(key) ?? [],
            done: doneByDay.get(key) ?? [],
          };
        })}
      />
    </div>
  );
}
