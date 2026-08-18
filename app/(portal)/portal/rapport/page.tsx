import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { getCustomerReport } from "@/lib/customer-report";
import { listCustomerActivityMonths } from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { formatHours } from "@/lib/format";
import { formatDate } from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { ActivityList } from "@/components/activity-list";
import { MonthFolderList } from "@/components/month-folder-list";
import { PrintButton } from "@/components/print-button";

export default async function PortalReportPage({
  searchParams,
}: PageProps<"/portal/rapport">) {
  const user = await requireCustomer();
  const { maaned } = await searchParams;
  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );

  if (!parsed) {
    const folders = await listCustomerActivityMonths(user.customerId);

    return (
      <div className="flex animate-rise flex-col gap-6">
        <div className="flex flex-col gap-4">
          <BackLink fallback="/portal" />
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-ink">Månedsrapport</h1>
            <p className="text-body text-ink-2">
              Velg en måned. Rapporten kan skrives ut eller lagres som PDF, for
              eksempel til styremøtet.
            </p>
          </div>
        </div>

        <MonthFolderList
          folders={folders}
          hrefFor={(param) => `/portal/rapport?maaned=${param}`}
          emptyText="Ingen registreringer ennå."
          countLabel={(count) =>
            count === 1 ? "1 registrering" : `${count} registreringer`
          }
        />
      </div>
    );
  }

  const period = calendarMonth(parsed.year, parsed.month);
  const [customer, report] = await Promise.all([
    db.customer.findUnique({
      where: { id: user.customerId },
      select: { name: true },
    }),
    getCustomerReport(user.customerId, period),
  ]);

  const { items, summary } = report;

  return (
    <div className="flex animate-rise flex-col gap-6">
      {/* Skjermnavigasjon — skal ikke være med i utskriften */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <BackLink fallback="/portal/rapport" />
        <PrintButton />
      </div>

      <article className="report flex flex-col gap-7">
        <header className="flex flex-col gap-1 border-b border-hair pb-5">
          <p className="text-eyebrow uppercase text-ink-3">
            N&amp;M Vaktmesterservice AS
          </p>
          <h1 className="mt-1 text-display text-ink">{period.label}</h1>
          <p className="text-title text-ink-2">{customer?.name}</p>
          <p className="mt-2 text-micro text-ink-3">
            Månedsrapport · skrevet ut {formatDate(new Date())}
          </p>
        </header>

        <section>
          <h2 className="mb-3 px-1 text-eyebrow uppercase text-ink-3">
            Oppsummering
          </h2>
          <dl className="grid grid-cols-2 gap-2.5">
            <Stat label="Besøk" value={String(summary.visits)} />
            <Stat label="Oppgaver utført" value={String(summary.tasksDone)} />
            <Stat
              label="Ekstraarbeid"
              value={
                summary.extraHours > 0
                  ? `${formatHours(summary.extraHours)} t`
                  : "0 t"
              }
            />
            <Stat
              label="Avvik"
              value={
                summary.issuesClosed > 0
                  ? `${summary.issuesReported} meldt · ${summary.issuesClosed} utbedret`
                  : `${summary.issuesReported} meldt`
              }
            />
          </dl>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-eyebrow uppercase text-ink-3">
            Utført arbeid
          </h2>
          <ActivityList
            items={items}
            emptyText="Ingen registreringer denne måneden."
          />
        </section>

        <footer className="border-t border-hair pt-4 text-micro text-ink-3">
          N&amp;M Vaktmesterservice AS · Spørsmål til rapporten kan sendes fra
          Loggbok under «Meld fra til oss».
        </footer>
      </article>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-hair bg-surface px-4 py-3.5 shadow-card">
      <dt className="text-eyebrow uppercase text-ink-3">{label}</dt>
      <dd className="mt-2 text-title tabular-nums text-ink">{value}</dd>
    </div>
  );
}
