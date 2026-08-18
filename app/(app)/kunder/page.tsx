import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { solidActionClass } from "@/lib/ui";
import { CustomerTable } from "./customer-table";

export default async function CustomersPage() {
  await requireAdmin();

  const customers = await db.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-display">Kunder</h1>
          <p className="text-body text-ink-2">
            Rediger kunder, kalenderoppdrag og oppgavemaler.
          </p>
        </div>
        <Link
          href="/kunder/ny"
          className={`flex min-h-12 shrink-0 items-center rounded-xl px-4 text-meta font-semibold ${solidActionClass}`}
        >
          Ny kunde
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="rounded-2xl bg-surface px-5 py-5 text-body text-ink-2 shadow-card">
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
