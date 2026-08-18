import Link from "next/link";
import { setExtraWorkHandled } from "@/app/actions/billing";
import { formatHours } from "@/lib/format";
import { formatDate } from "@/lib/time";
import { cardStaticClass } from "@/lib/ui";

export type BillingLine = {
  id: string;
  at: Date;
  hours: number;
  comment: string | null;
  userName: string;
};

export type BillingGroup = {
  customerId: string;
  name: string;
  hours: number;
  lines: BillingLine[];
};

export function BillingList({
  title,
  emptyText,
  groups,
  handled,
}: {
  title: string;
  emptyText: string;
  groups: BillingGroup[];
  handled: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-heading">{title}</h2>

      {groups.length === 0 ? (
        <p className="rounded-2xl bg-surface px-5 py-5 text-body text-ink-2 shadow-card">
          {emptyText}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map((group) => (
            <li key={group.customerId} className={`px-4 py-4 ${cardStaticClass}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/kunde/${group.customerId}`}
                  className="text-heading text-ink hover:text-ink-2"
                >
                  {group.name}
                </Link>
                <span className="font-mono text-heading tabular-nums text-ink">
                  {formatHours(group.hours)} t
                </span>
              </div>

              <ul className="mt-3 flex flex-col gap-3 pt-1">
                {group.lines.map((line) => (
                  <li key={line.id} className="flex items-start gap-3">
                    <form
                      action={setExtraWorkHandled.bind(
                        null,
                        line.id,
                        !handled,
                      )}
                      className="shrink-0"
                    >
                      <button
                        type="submit"
                        aria-pressed={handled}
                        aria-label={
                          handled
                            ? "Merk som ikke håndtert"
                            : "Merk som håndtert"
                        }
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full text-heading font-bold ${
                          handled
                            ? "bg-brand text-white shadow-brand"
                            : "bg-surface text-edge shadow-card"
                        }`}
                      >
                        {handled ? "✓" : ""}
                      </button>
                    </form>
                    <div className="min-w-0 flex-1">
                      <p className="text-meta tabular-nums text-ink-2">
                        {formatDate(line.at)} · {formatHours(line.hours)} t ·{" "}
                        {line.userName}
                      </p>
                      {line.comment && (
                        <p
                          className={`text-body text-ink ${
                            handled ? "opacity-80" : ""
                          }`}
                        >
                          {line.comment}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
