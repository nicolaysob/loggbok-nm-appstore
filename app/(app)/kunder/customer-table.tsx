"use client";

import Link from "next/link";
import { deleteCustomer } from "@/app/actions/customers";
import { contractTypeLabels } from "@/lib/labels";
import type { ContractType } from "@/generated/prisma/enums";

export type CustomerRow = {
  id: string;
  name: string;
  active: boolean;
  contractType: ContractType;
};

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {customers.map((customer) => (
        <li key={customer.id}>
          <div className="flex items-stretch overflow-hidden rounded-md bg-white shadow-card">
            <Link
              href={`/kunder/${customer.id}`}
              className="flex min-h-[4.5rem] min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-2 text-navy-900 active:bg-navy-50"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-heading font-semibold">
                  {customer.name}
                  {!customer.active && (
                    <span className="ml-2 text-meta font-medium text-navy-700">
                      (inaktiv)
                    </span>
                  )}
                </span>
                <span className="text-meta font-medium text-navy-700">
                  {contractTypeLabels[customer.contractType]}
                </span>
              </span>
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-50"
              >
                ›
              </span>
            </Link>
            <form
              action={deleteCustomer.bind(null, customer.id)}
              onSubmit={(event) => {
                if (
                  !window.confirm(
                    `Slette kunden «${customer.name}»?\n\nAll logg, timer, avvik og oppgaver for kunden blir borte for godt.`,
                  )
                ) {
                  event.preventDefault();
                }
              }}
              className="flex"
            >
              <button
                type="submit"
                className="min-w-16 px-3 text-meta font-semibold text-red-700 active:bg-red-50"
              >
                Slett
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
