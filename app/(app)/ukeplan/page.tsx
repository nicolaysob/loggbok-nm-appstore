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
import { outlineActionClass } from "@/lib/ui";
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
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display">Ukeplan</h1>
          <p className="text-body text-ink-2">
            Skriv uka fritt — få forslag til kalenderen · {week.label}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/ukeplan?uke=${weekParam(previous.monday)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
          >
            Forrige
          </Link>
          {!isCurrent && (
            <Link
              href="/ukeplan"
              className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
            >
              Denne
            </Link>
          )}
          <Link
            href={`/ukeplan?uke=${weekParam(next.monday)}`}
            className={`flex min-h-12 flex-1 items-center justify-center px-3 text-body font-semibold ${outlineActionClass}`}
          >
            Neste
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
