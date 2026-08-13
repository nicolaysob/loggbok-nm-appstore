import type { JobScheduleKind } from "@/generated/prisma/enums";
import {
  daysBetween,
  osloMidnight,
  osloYmd,
  type Ymd,
  weekdayIndex,
  ymdKey,
} from "@/lib/period";

export type CalendarJob = {
  id: string;
  kind: JobScheduleKind;
  dueOn: Date | null;
  weekday: number | null;
  startsOn: Date;
  active: boolean;
};

// Returnerer true hvis oppdraget skal ligge på denne kalenderdagen.
export function occursOn(job: CalendarJob, day: Ymd): boolean {
  if (!job.active) return false;

  const start = osloYmd(job.startsOn);

  if (job.kind === "ONCE") {
    if (!job.dueOn) return false;
    return ymdKey(osloYmd(job.dueOn)) === ymdKey(day);
  }

  // Ikke før startdato
  if (daysBetween(start, day) < 0) return false;

  if (job.kind === "WEEKLY") {
    return job.weekday !== null && weekdayIndex(day) === job.weekday;
  }

  if (job.kind === "BIWEEKLY") {
    if (job.weekday === null || weekdayIndex(day) !== job.weekday) return false;
    const startMonUtc = new Date(
      Date.UTC(start.year, start.month - 1, start.day - weekdayIndex(start), 12),
    );
    const dayMondayUtc = new Date(
      Date.UTC(day.year, day.month - 1, day.day - weekdayIndex(day), 12),
    );
    const weeks =
      (dayMondayUtc.getTime() - startMonUtc.getTime()) / (7 * 86_400_000);
    return Number.isInteger(weeks) && weeks >= 0 && weeks % 2 === 0;
  }

  if (job.kind === "MONTHLY") {
    return day.day === start.day;
  }

  return false;
}

export function scheduledInstant(day: Ymd): Date {
  return osloMidnight(day.year, day.month, day.day);
}
