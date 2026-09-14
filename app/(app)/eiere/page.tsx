import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { BackLink } from "@/components/back-link";
import { OwnersManager, type OwnerRow } from "./owners-manager";

export default async function OwnersPage() {
  await requireAdmin();

  const owners = await db.owner.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      shortName: true,
      contactPerson: true,
      _count: { select: { customers: true, portalUsers: true } },
    },
  });

  const rows: OwnerRow[] = owners.map((owner) => ({
    id: owner.id,
    name: owner.name,
    shortName: owner.shortName,
    contactPerson: owner.contactPerson,
    customerCount: owner._count.customers,
    hasPortalUser: owner._count.portalUsers > 0,
  }));

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback="/mer" />
        <div className="flex flex-col gap-1">
          <h1 className="text-display text-ink">Eiere</h1>
          <p className="text-body text-ink-2">
            En eier binder flere kundekort til samme kontaktperson. Hvert
            kundekort beholder sin egen kontrakt og faktureres som før.
          </p>
        </div>
      </div>

      <OwnersManager owners={rows} />
    </div>
  );
}
