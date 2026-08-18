import type { ActivityItem } from "@/lib/customer-activity-shared";
import { groupByDay, groupByMonth } from "@/lib/time";
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
      <p className="rounded-2xl border border-hair bg-surface px-4 py-6 text-center text-body text-ink-3 shadow-card">
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
    return <DayTimeline items={items} rowProps={rowProps} />;
  }

  const groups = groupByMonth(items, (item) => item.at);

  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-3 text-title text-ink">{group.label}</h2>
          <DayTimeline items={group.items} rowProps={rowProps} />
        </section>
      ))}
    </div>
  );
}

/** Tidslinje med dagsskiller. Nyeste øverst. */
function DayTimeline({
  items,
  rowProps,
}: {
  items: ActivityItem[];
  rowProps: (item: ActivityItem) => { canDelete: boolean; canEdit: boolean };
}) {
  const days = groupByDay(items, (item) => item.at);

  return (
    <div className="flex flex-col gap-5">
      {days.map((day) => (
        <section key={day.key}>
          <h3 className="mb-3 px-1 text-eyebrow uppercase text-ink-3">
            {day.label}
          </h3>
          <ul className="pl-1">
            {day.items.map((item, index) => (
              <ActivityRow
                key={item.key}
                item={item}
                last={index === day.items.length - 1}
                {...rowProps(item)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
