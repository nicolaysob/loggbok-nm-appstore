import Link from "next/link";
import { requireCustomer } from "@/lib/dal";
import {
  getCustomerActivity,
  listCustomerActivityMonths,
} from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth, yearMonthParam } from "@/lib/period";
import { actionSize, outlineActionClass } from "@/lib/ui";
import { BackLink } from "@/components/back-link";
import { ActivityList } from "@/components/activity-list";
import { MonthFolderList } from "@/components/month-folder-list";

export default async function PortalActivityArchivePage({
  searchParams,
}: PageProps<"/portal/aktivitet">) {
  const user = await requireCustomer();
  const { maaned } = await searchParams;
  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );

  if (parsed) {
    const period = calendarMonth(parsed.year, parsed.month);
    const items = await getCustomerActivity(user.customerId, {
      since: period.start,
      until: period.end,
    });

    return (
      <div className="flex animate-rise flex-col gap-6">
        <div className="flex flex-col gap-4">
          <BackLink fallback="/portal/aktivitet" />
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-ink">
              {period.label}
            </h1>
            <p className="text-body text-ink-2">
              Besøk, oppgaver, ekstraarbeid og avvik denne måneden.
            </p>
          </div>
        </div>

        <ActivityList
          items={items}
          emptyText="Ingen registreringer denne måneden."
        />

        <Link
          href={`/portal/rapport?maaned=${yearMonthParam(parsed.year, parsed.month)}`}
          className={`${actionSize} ${outlineActionClass}`}
        >
          Se som månedsrapport
        </Link>
      </div>
    );
  }

  const folders = await listCustomerActivityMonths(user.customerId);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback="/portal" />
        <div className="flex flex-col gap-1">
          <h1 className="text-display text-ink">
            Aktivitetsarkiv
          </h1>
          <p className="text-body text-ink-2">
            Velg en måned. Når måneden er over, ligger den igjen som mappe.
          </p>
        </div>
      </div>

      <MonthFolderList
        folders={folders}
        hrefFor={(param) => `/portal/aktivitet?maaned=${param}`}
        emptyText="Ingen registreringer ennå."
        countLabel={(count) =>
          count === 1 ? "1 registrering" : `${count} registreringer`
        }
      />
    </div>
  );
}
