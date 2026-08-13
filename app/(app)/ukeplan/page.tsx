import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { weekdayLabels } from "@/lib/labels";
import {
  daysOfWeek,
  mondayOf,
  parseWeekParam,
  shiftWeek,
  weekFromMonday,
  weekParam,
  ymdKey,
} from "@/lib/period";
import { backLinkClass } from "@/lib/ui";
import { WeekPlanForm } from "./week-plan-form";

const dayFormat = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export default async function WeekPlanPage({
  searchParams,
}: PageProps<"/ukeplan">) {
  await requireAdmin();
  const { uke } = await searchParams;

  const monday =
    parseWeekParam(typeof uke === "string" ? uke : undefined) ?? mondayOf();
  const week = weekFromMonday(monday);
  const previous = shiftWeek(monday, -1);
  const next = shiftWeek(monday, 1);
  const thisMonday = mondayOf();
  const isCurrent = weekParam(monday) === weekParam(thisMonday);
  const weekMondayKey = weekParam(monday);

  const customers = await db.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const dayOptions = daysOfWeek(monday).map((day, index) => ({
    key: ymdKey(day),
    label: `${weekdayLabels[index]} ${dayFormat.format(
      new Date(Date.UTC(day.year, day.month - 1, day.day)),
    )}`,
  }));

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Ukeplan</h1>
          <p className="text-body text-navy-700">
            Skriv uka fritt — få forslag til kalenderen · {week.label}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/ukeplan?uke=${weekParam(previous.monday)}`}
            className={backLinkClass}
          >
            ← Forrige
          </Link>
          {!isCurrent && (
            <Link href="/ukeplan" className={backLinkClass}>
              Denne uken
            </Link>
          )}
          <Link
            href={`/ukeplan?uke=${weekParam(next.monday)}`}
            className={backLinkClass}
          >
            Neste →
          </Link>
        </div>
      </div>

      <WeekPlanForm
        key={weekMondayKey}
        weekMondayKey={weekMondayKey}
        weekLabel={week.label}
        dayOptions={dayOptions}
        customers={customers}
      />
    </div>
  );
}
