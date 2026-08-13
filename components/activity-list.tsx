import type { ActivityItem } from "@/lib/customer-activity-shared";
import { groupByMonth } from "@/lib/time";
import { ActivityRow } from "@/components/activity-row";

export function ActivityList({
  items,
  emptyText,
  groupByMonth: useMonthGroups = false,
  canDelete = false,
  currentUserId,
  isAdmin = false,
}: {
  items: ActivityItem[];
  emptyText: string;
  groupByMonth?: boolean;
  // Kun for admin i internappen — aldri i kundeportalen
  canDelete?: boolean;
  // Eier eller admin kan rette tekst — aldri i kundeportalen
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="border-y border-line py-5 text-body text-navy-700">
        {emptyText}
      </p>
    );
  }

  function rowProps(item: ActivityItem) {
    const canEdit =
      Boolean(currentUserId) && (isAdmin || item.userId === currentUserId);
    return { canDelete, canEdit };
  }

  if (!useMonthGroups) {
    return (
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white shadow-card">
        {items.map((item) => (
          <ActivityRow key={item.key} item={item} {...rowProps(item)} />
        ))}
      </ul>
    );
  }

  const groups = groupByMonth(items, (item) => item.at);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <h2 className="text-heading text-navy-900">{group.label}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white shadow-card">
            {group.items.map((item) => (
              <ActivityRow key={item.key} item={item} {...rowProps(item)} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
