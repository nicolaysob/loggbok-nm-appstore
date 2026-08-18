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
          <div className="flex items-stretch overflow-hidden rounded-2xl bg-surface shadow-card">
            <Link
              href={`/kunder/${customer.id}`}
              className="flex min-h-[4.5rem] min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-2 text-ink active:bg-sunken"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-heading font-semibold">
                  {customer.name}
                  {!customer.active && (
                    <span className="ml-2 text-meta font-medium text-ink-2">
                      (inaktiv)
                    </span>
                  )}
                </span>
                <span className="text-meta font-medium text-ink-2">
                  {contractTypeLabels[customer.contractType]}
                </span>
              </span>
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-2"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
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
                className="min-w-16 px-3 text-meta font-semibold text-danger active:bg-danger-soft"
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
