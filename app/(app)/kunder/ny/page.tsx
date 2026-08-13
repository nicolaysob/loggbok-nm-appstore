import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { createCustomer } from "@/app/actions/customers";
import { adminBackLinkClass as backLinkClass } from "@/lib/ui";
import { CustomerForm, emptyCustomer } from "../customer-form";

export default async function NewCustomerPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/kunder" className={backLinkClass}>
          ← Kunder
        </Link>
        <h1 className="text-display tracking-tight">Ny kunde</h1>
      </div>

      <CustomerForm
        action={createCustomer}
        values={emptyCustomer}
        submitLabel="Opprett kunde"
      />
    </div>
  );
}
