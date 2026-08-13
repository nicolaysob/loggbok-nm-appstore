import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { CustomerTable } from "./customer-table";

export default async function CustomersPage() {
  await requireAdmin();

  const customers = await db.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Kunder</h1>
          <p className="text-body text-navy-700">
            Rediger kunder, kalenderoppdrag og oppgavemaler.
          </p>
        </div>
        <Link
          href="/kunder/ny"
          className="rounded-md bg-brand px-4 py-2.5 text-meta font-semibold text-white shadow-lift transition-colors hover:bg-brand-dark"
        >
          Ny kunde
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="text-meta font-medium text-navy-700">
          Ingen kunder er lagt inn ennå.
        </p>
      ) : (
        <CustomerTable
          customers={customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            active: customer.active,
            contractType: customer.contractType,
          }))}
        />
      )}
    </div>
  );
}
