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
        className="min-h-14 rounded-2xl bg-surface px-4 text-meta font-semibold text-danger shadow-card active:bg-danger-soft"
      >
        Slett kunde
      </button>
    </form>
  );
}
