import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import {
  getCustomerActivity,
  listCustomerActivityMonths,
} from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { backLinkClass } from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { MonthFolderList } from "@/components/month-folder-list";

export default async function CustomerActivityArchivePage({
  params,
  searchParams,
}: PageProps<"/kunde/[id]/aktivitet">) {
  const user = await requireUser();
  const { id } = await params;
  const { maaned } = await searchParams;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );

  if (parsed) {
    const period = calendarMonth(parsed.year, parsed.month);
    const items = await getCustomerActivity(customer.id, {
      since: period.start,
      until: period.end,
    });

    return (
      <div className="flex animate-rise flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/kunde/${customer.id}/aktivitet`}
            className={backLinkClass}
          >
            ← Aktivitetsarkiv
          </Link>
          <h1 className="text-display tracking-tight">{period.label}</h1>
          <p className="text-body text-navy-700">
            Besøk, oppgaver, ekstraarbeid og avvik denne måneden.
          </p>
        </div>

        <ActivityList
          items={items}
          emptyText="Ingen registreringer denne måneden."
          canDelete={user.role === "ADMIN"}
          currentUserId={user.id}
          isAdmin={user.role === "ADMIN"}
        />
      </div>
    );
  }

  const folders = await listCustomerActivityMonths(customer.id);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/kunde/${customer.id}`} className={backLinkClass}>
          ← {customer.name}
        </Link>
        <h1 className="text-display tracking-tight">Aktivitetsarkiv</h1>
        <p className="text-body text-navy-700">
          Velg en måned. Når måneden er over, ligger den igjen som mappe.
        </p>
      </div>

      <MonthFolderList
        folders={folders}
        hrefFor={(param) => `/kunde/${customer.id}/aktivitet?maaned=${param}`}
        emptyText="Ingenting er registrert her ennå."
        countLabel={(count) =>
          count === 1 ? "1 registrering" : `${count} registreringer`
        }
      />
    </div>
  );
}
