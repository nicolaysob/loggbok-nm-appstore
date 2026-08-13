import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/format";
import {
  type ActivityItem,
  type ActivityKind,
} from "@/lib/customer-activity-shared";
import {
  calendarMonth,
  currentMonth,
  osloYmd,
  yearMonthParam,
} from "@/lib/period";

export {
  type ActivityItem,
  type ActivityKind,
  activityKindLabels,
  activityKindTone,
} from "@/lib/customer-activity-shared";

export const RECENT_ACTIVITY_DAYS = 14;
export const RECENT_ACTIVITY_LIMIT = 15;

export type ActivityMonthFolder = {
  year: number;
  month: number;
  param: string;
  label: string;
  count: number;
  isCurrent: boolean;
};

export function recentActivitySince(now = new Date()): Date {
  const since = new Date(now);
  since.setDate(since.getDate() - RECENT_ACTIVITY_DAYS);
  return since;
}

export async function getCustomerActivity(
  customerId: string,
  options?: { since?: Date; until?: Date; take?: number },
): Promise<ActivityItem[]> {
  const since = options?.since;
  const until = options?.until;
  const take = options?.take;

  const logOccurredAt =
    since || until
      ? {
          ...(since ? { gte: since } : {}),
          ...(until ? { lt: until } : {}),
        }
      : undefined;
  const issueCreatedAt =
    since || until
      ? {
          ...(since ? { gte: since } : {}),
          ...(until ? { lt: until } : {}),
        }
      : undefined;

  const [logEntries, issues] = await Promise.all([
    db.logEntry.findMany({
      where: {
        area: { customerId },
        ...(logOccurredAt ? { occurredAt: logOccurredAt } : {}),
      },
      orderBy: { occurredAt: "desc" },
      ...(take ? { take } : {}),
      select: {
        id: true,
        type: true,
        occurredAt: true,
        hours: true,
        comment: true,
        userId: true,
        user: { select: { name: true } },
        completedTasks: {
          select: { taskTemplate: { select: { title: true } } },
        },
        photos: { select: { url: true }, take: 3 },
      },
    }),
    db.issue.findMany({
      where: {
        area: { customerId },
        ...(issueCreatedAt ? { createdAt: issueCreatedAt } : {}),
      },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true } },
        photos: { select: { url: true }, take: 3 },
      },
    }),
  ]);

  const items: ActivityItem[] = [
    ...logEntries.map((entry) => ({
      key: `log-${entry.id}`,
      id: entry.id,
      kind: entry.type as ActivityKind,
      at: entry.occurredAt,
      userId: entry.userId,
      userName: entry.user.name,
      text: entry.comment,
      hours: entry.hours === null ? null : decimalToNumber(entry.hours),
      tasks: entry.completedTasks.map((task) => task.taskTemplate.title),
      status: null,
      photoUrls: entry.photos.map((photo) => photo.url),
    })),
    ...issues.map((issue) => ({
      key: `issue-${issue.id}`,
      id: issue.id,
      kind: "ISSUE" as const,
      at: issue.createdAt,
      userId: issue.userId,
      userName: issue.user.name,
      text: issue.description,
      hours: null,
      tasks: [] as string[],
      status: issue.status,
      photoUrls: issue.photos.map((photo) => photo.url),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return take ? items.slice(0, take) : items;
}

export async function listCustomerActivityMonths(
  customerId: string,
): Promise<ActivityMonthFolder[]> {
  const [logDates, issueDates] = await Promise.all([
    db.logEntry.findMany({
      where: { area: { customerId } },
      select: { occurredAt: true },
    }),
    db.issue.findMany({
      where: { area: { customerId } },
      select: { createdAt: true },
    }),
  ]);

  const counts = new Map<string, number>();
  for (const row of logDates) {
    const { year, month } = osloYmd(row.occurredAt);
    const key = yearMonthParam(year, month);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const row of issueDates) {
    const { year, month } = osloYmd(row.createdAt);
    const key = yearMonthParam(year, month);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const now = currentMonth();
  const currentKey = yearMonthParam(now.year, now.month);
  if (!counts.has(currentKey)) {
    counts.set(currentKey, 0);
  }

  return [...counts.entries()]
    .map(([param, count]) => {
      const [year, month] = param.split("-").map(Number);
      const period = calendarMonth(year, month);
      return {
        year,
        month,
        param,
        label: period.label,
        count,
        isCurrent: param === currentKey,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

export type MessageMonthFolder = ActivityMonthFolder;

export async function listCustomerMessageMonths(
  customerId: string,
): Promise<MessageMonthFolder[]> {
  const dates = await db.customerMessage.findMany({
    where: { customerId, readAt: { not: null } },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (const row of dates) {
    const { year, month } = osloYmd(row.createdAt);
    const key = yearMonthParam(year, month);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const now = currentMonth();
  const currentKey = yearMonthParam(now.year, now.month);
  if (!counts.has(currentKey)) {
    counts.set(currentKey, 0);
  }

  return [...counts.entries()]
    .map(([param, count]) => {
      const [year, month] = param.split("-").map(Number);
      const period = calendarMonth(year, month);
      return {
        year,
        month,
        param,
        label: period.label,
        count,
        isCurrent: param === currentKey,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

export type ClosedIssueMonthFolder = ActivityMonthFolder;

/** Lukkede avvik gruppert etter closedAt (fallback: updatedAt). */
export async function listCustomerClosedIssueMonths(
  customerId: string,
): Promise<ClosedIssueMonthFolder[]> {
  const rows = await db.issue.findMany({
    where: {
      area: { customerId },
      status: "CLOSED",
    },
    select: { closedAt: true, updatedAt: true },
  });

  const counts = new Map<string, number>();
  for (const row of rows) {
    const at = row.closedAt ?? row.updatedAt;
    const { year, month } = osloYmd(at);
    const key = yearMonthParam(year, month);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const now = currentMonth();
  const currentKey = yearMonthParam(now.year, now.month);
  if (!counts.has(currentKey)) {
    counts.set(currentKey, 0);
  }

  return [...counts.entries()]
    .map(([param, count]) => {
      const [year, month] = param.split("-").map(Number);
      const period = calendarMonth(year, month);
      return {
        year,
        month,
        param,
        label: period.label,
        count,
        isCurrent: param === currentKey,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}
