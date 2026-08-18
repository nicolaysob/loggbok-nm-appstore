import { requireAdmin } from "@/lib/dal";
import { createCustomer } from "@/app/actions/customers";
import { BackLink } from "@/components/back-link";
import { CustomerForm, emptyCustomer } from "../customer-form";

export default async function NewCustomerPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback="/kunder" />
        <h1 className="text-display">Ny kunde</h1>
      </div>

      <CustomerForm
        action={createCustomer}
        values={emptyCustomer}
        submitLabel="Opprett kunde"
      />
    </div>
  );
}
