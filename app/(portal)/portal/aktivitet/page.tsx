import Link from "next/link";
import { requireCustomer } from "@/lib/dal";
import {
  getCustomerActivity,
  listCustomerActivityMonths,
} from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { backLinkClass } from "@/lib/ui";
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
        <div className="flex flex-col gap-2">
          <Link href="/portal/aktivitet" className={backLinkClass}>
            ← Aktivitetsarkiv
          </Link>
          <h1 className="text-display tracking-tight text-navy-900">
            {period.label}
          </h1>
          <p className="text-body text-navy-700">
            Besøk, oppgaver, ekstraarbeid og avvik denne måneden.
          </p>
        </div>

        <ActivityList
          items={items}
          emptyText="Ingen registreringer denne måneden."
        />
      </div>
    );
  }

  const folders = await listCustomerActivityMonths(user.customerId);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/portal" className={backLinkClass}>
          ← Forside
        </Link>
        <h1 className="text-display tracking-tight text-navy-900">
          Aktivitetsarkiv
        </h1>
        <p className="text-body text-navy-700">
          Velg en måned. Når måneden er over, ligger den igjen som mappe.
        </p>
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
