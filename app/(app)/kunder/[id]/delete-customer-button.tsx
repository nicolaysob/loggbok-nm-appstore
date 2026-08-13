"use client";

import { deleteCustomer } from "@/app/actions/customers";

export function DeleteCustomerButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  return (
    <form
      action={deleteCustomer.bind(null, customerId)}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Slette kunden «${customerName}»?\n\nAll logg, timer, avvik og oppgaver for kunden blir borte for godt.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-700/30 px-4 py-2 text-meta font-semibold text-red-700 transition-colors hover:bg-red-50"
      >
        Slett kunde
      </button>
    </form>
  );
}
