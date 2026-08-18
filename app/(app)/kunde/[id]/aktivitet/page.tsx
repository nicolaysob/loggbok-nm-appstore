import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import {
  getCustomerActivity,
  listCustomerActivityMonths,
} from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { BackLink } from "@/components/back-link";
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
      <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
        <div className="flex flex-col gap-4">
          <BackLink fallback={`/kunde/${customer.id}/aktivitet`} />
          <div className="flex flex-col gap-1">
            <h1 className="text-display">{period.label}</h1>
            <p className="text-body text-ink-2">
              Besøk, oppgaver, ekstraarbeid og avvik denne måneden.
            </p>
          </div>
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
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <div className="flex flex-col gap-1">
          <h1 className="text-display">Aktivitetsarkiv</h1>
          <p className="text-body text-ink-2">
            Velg en måned. Når måneden er over, ligger den igjen som mappe.
          </p>
        </div>
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
