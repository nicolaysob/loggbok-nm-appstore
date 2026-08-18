import { db } from "@/lib/db";
import { getCustomerActivity, type ActivityItem } from "@/lib/customer-activity";
import type { PeriodRange } from "@/lib/period";

export type ReportSummary = {
  /** Antall besøksregistreringer */
  visits: number;
  /** Antall avkryssede oppgaver, ikke antall registreringer */
  tasksDone: number;
  /** Timer ekstraarbeid — den eneste fakturerbare typen */
  extraHours: number;
  issuesReported: number;
  issuesClosed: number;
};

export type CustomerReport = {
  items: ActivityItem[];
  summary: ReportSummary;
};

export function summarise(
  items: ActivityItem[],
  issuesClosed: number,
): ReportSummary {
  let visits = 0;
  let tasksDone = 0;
  let extraHours = 0;
  let issuesReported = 0;

  for (const item of items) {
    if (item.kind === "VISIT_NOTE") visits += 1;
    if (item.kind === "TASK_COMPLETION") tasksDone += item.tasks.length;
    if (item.kind === "EXTRA_WORK") extraHours += item.hours ?? 0;
    if (item.kind === "ISSUE") issuesReported += 1;
  }

  return { visits, tasksDone, extraHours, issuesReported, issuesClosed };
}

/** Alt kunden skal se for én måned, i én runde mot databasen. */
export async function getCustomerReport(
  customerId: string,
  period: PeriodRange,
): Promise<CustomerReport> {
  const [items, issuesClosed] = await Promise.all([
    getCustomerActivity(customerId, {
      since: period.start,
      until: period.end,
    }),
    // Utbedret i perioden — teller uansett når avviket ble meldt
    db.issue.count({
      where: {
        area: { customerId },
        status: "CLOSED",
        closedAt: { gte: period.start, lt: period.end },
      },
    }),
  ]);

  return { items, summary: summarise(items, issuesClosed) };
}
