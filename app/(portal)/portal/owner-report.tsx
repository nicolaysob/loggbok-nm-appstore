import { formatHours } from "@/lib/format";
import { formatDate } from "@/lib/time";
import { ActivityList } from "@/components/activity-list";
import { PrintButton } from "@/components/print-button";
import { BackLink } from "@/components/back-link";
import type { CustomerReport } from "@/lib/customer-report";

export type OwnerReportPlace = {
  id: string;
  name: string;
  report: CustomerReport;
};

/**
 * Månedsrapport for en eier med flere steder: én oppsummeringstabell med
 * sumlinje, og deretter utført arbeid per sted. Dette er dokumentet et
 * styre tar med i møtet, så tallene skal kunne leses uten forklaring.
 */
export function OwnerReport({
  ownerName,
  monthLabel,
  places,
}: {
  ownerName: string;
  monthLabel: string;
  places: OwnerReportPlace[];
}) {
  const total = places.reduce(
    (sum, place) => ({
      visits: sum.visits + place.report.summary.visits,
      tasksDone: sum.tasksDone + place.report.summary.tasksDone,
      extraHours: sum.extraHours + place.report.summary.extraHours,
      issuesReported: sum.issuesReported + place.report.summary.issuesReported,
      issuesClosed: sum.issuesClosed + place.report.summary.issuesClosed,
    }),
    { visits: 0, tasksDone: 0, extraHours: 0, issuesReported: 0, issuesClosed: 0 },
  );

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <BackLink fallback="/portal/rapport" />
        <PrintButton />
      </div>

      <article className="report flex flex-col gap-7">
        <header className="flex flex-col gap-1 border-b border-hair pb-5">
          <p className="text-eyebrow uppercase text-ink-3">
            N&amp;M Vaktmesterservice AS
          </p>
          <h1 className="mt-1 text-display text-ink">{monthLabel}</h1>
          <p className="text-title text-ink-2">{ownerName}</p>
          <p className="mt-2 text-micro text-ink-3">
            Månedsrapport for {places.length}{" "}
            {places.length === 1 ? "sted" : "steder"} · skrevet ut{" "}
            {formatDate(new Date())}
          </p>
        </header>

        <section>
          <h2 className="mb-3 px-1 text-eyebrow uppercase text-ink-3">
            Per sted
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-meta">
              <thead>
                <tr className="border-b border-hair text-left text-micro uppercase tracking-wide text-ink-3">
                  <th className="py-2 pr-3 font-bold">Sted</th>
                  <th className="py-2 pr-3 text-right font-bold">Besøk</th>
                  <th className="py-2 pr-3 text-right font-bold">Oppgaver</th>
                  <th className="py-2 text-right font-bold">Timer</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id} className="border-b border-hair">
                    <td className="py-2.5 pr-3 font-semibold text-ink">
                      {place.name}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-ink">
                      {place.report.summary.visits}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-ink">
                      {place.report.summary.tasksDone}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-ink">
                      {formatHours(place.report.summary.extraHours)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-sunken">
                  <td className="py-2.5 pl-2 pr-3 font-bold text-ink">
                    Til sammen
                  </td>
                  <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-ink">
                    {total.visits}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-ink">
                    {total.tasksDone}
                  </td>
                  <td className="py-2.5 pr-2 text-right font-bold tabular-nums text-ink">
                    {formatHours(total.extraHours)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 px-1 text-micro text-ink-3">
            Avvik denne måneden: {total.issuesReported} meldt
            {total.issuesClosed > 0 ? `, ${total.issuesClosed} utbedret` : ""}.
          </p>
        </section>

        {places.map((place) => (
          <section key={place.id}>
            <h2 className="mb-3 px-1 text-eyebrow uppercase text-ink-3">
              {place.name}
            </h2>
            <ActivityList
              items={place.report.items}
              emptyText="Ingen registreringer denne måneden."
            />
          </section>
        ))}

        <footer className="border-t border-hair pt-4 text-micro text-ink-3">
          N&amp;M Vaktmesterservice AS · Spørsmål til rapporten kan sendes fra
          Loggbok under «Meld fra til oss».
        </footer>
      </article>
    </div>
  );
}
