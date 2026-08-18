import "server-only";
import { db } from "@/lib/db";

export type CustomerOverviewRow = {
  id: string;
  name: string;
  openIssues: number;
  unreadMessages: number;
  openTodos: number;
  lastVisit: Date | null;
};

export async function getCustomerOverview(): Promise<CustomerOverviewRow[]> {
  const customers = await db.customer.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      areas: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true },
      },
      _count: {
        select: {
          messages: { where: { readAt: null } },
          todos: { where: { doneAt: null } },
        },
      },
    },
  });

  const areaIds = customers.flatMap((customer) =>
    customer.areas.map((area) => area.id),
  );
  const customerByArea = new Map(
    customers.flatMap((customer) =>
      customer.areas.map((area) => [area.id, customer.id] as const),
    ),
  );

  const [lastVisits, openIssueGroups] = await Promise.all([
    areaIds.length === 0
      ? Promise.resolve([])
      : db.logEntry.groupBy({
          by: ["areaId"],
          where: { areaId: { in: areaIds } },
          _max: { occurredAt: true },
        }),
    areaIds.length === 0
      ? Promise.resolve([])
      : db.issue.groupBy({
          by: ["areaId"],
          where: {
            areaId: { in: areaIds },
            status: { in: ["OPEN", "IN_PROGRESS"] },
          },
          _count: { _all: true },
        }),
  ]);

  const lastVisitByCustomer = new Map<string, Date>();
  for (const row of lastVisits) {
    const customerId = customerByArea.get(row.areaId);
    if (!customerId || !row._max.occurredAt) continue;
    const current = lastVisitByCustomer.get(customerId);
    if (!current || row._max.occurredAt > current) {
      lastVisitByCustomer.set(customerId, row._max.occurredAt);
    }
  }

  const openIssuesByCustomer = new Map<string, number>();
  for (const row of openIssueGroups) {
    const customerId = customerByArea.get(row.areaId);
    if (!customerId) continue;
    openIssuesByCustomer.set(
      customerId,
      (openIssuesByCustomer.get(customerId) ?? 0) + row._count._all,
    );
  }

  return customers
    .map((customer) => ({
      id: customer.id,
      name: customer.name,
      openIssues: openIssuesByCustomer.get(customer.id) ?? 0,
      unreadMessages: customer._count.messages,
      openTodos: customer._count.todos,
      lastVisit: lastVisitByCustomer.get(customer.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.openIssues > 0 !== b.openIssues > 0) {
        return a.openIssues > 0 ? -1 : 1;
      }
      if (b.openIssues !== a.openIssues) {
        return b.openIssues - a.openIssues;
      }
      if (a.unreadMessages > 0 !== b.unreadMessages > 0) {
        return a.unreadMessages > 0 ? -1 : 1;
      }
      if (b.unreadMessages !== a.unreadMessages) {
        return b.unreadMessages - a.unreadMessages;
      }
      if (a.openTodos > 0 !== b.openTodos > 0) {
        return a.openTodos > 0 ? -1 : 1;
      }
      if (b.openTodos !== a.openTodos) {
        return b.openTodos - a.openTodos;
      }
      if (!a.lastVisit && !b.lastVisit) {
        return a.name.localeCompare(b.name, "nb-NO");
      }
      if (!a.lastVisit) return -1;
      if (!b.lastVisit) return 1;
      return a.lastVisit.getTime() - b.lastVisit.getTime();
    });
}
