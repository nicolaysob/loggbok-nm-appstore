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
        <p className="text-body text-navy-700">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map((group) => (
            <li key={group.customerId} className={`px-4 py-4 ${cardStaticClass}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/kunde/${group.customerId}`}
                  className="text-heading text-navy-900 hover:text-navy-700"
                >
                  {group.name}
                </Link>
                <span className="font-mono text-heading tabular-nums text-navy-900">
                  {formatHours(group.hours)} t
                </span>
              </div>

              <ul className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
                {group.lines.map((line) => (
                  <li key={line.id} className="flex items-start gap-3">
                    <form
                      action={setExtraWorkHandled.bind(
                        null,
                        line.id,
                        !handled,
                      )}
                      className="pt-1"
                    >
                      <button
                        type="submit"
                        aria-pressed={handled}
                        aria-label={
                          handled
                            ? "Merk som ikke håndtert"
                            : "Merk som håndtert"
                        }
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border text-meta font-bold ${
                          handled
                            ? "border-green-700/30 bg-green-50 text-green-700"
                            : "border-line bg-white text-navy-100"
                        }`}
                      >
                        {handled ? "✓" : ""}
                      </button>
                    </form>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-meta font-medium text-navy-700">
                        {formatDate(line.at)} · {formatHours(line.hours)} t ·{" "}
                        {line.userName}
                      </p>
                      {line.comment && (
                        <p
                          className={`text-body text-navy-900 ${
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
