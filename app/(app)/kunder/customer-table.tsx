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
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <table className="w-full border-collapse text-meta">
        <thead>
          <tr className="border-b border-line bg-navy-50/70 text-left">
            <th className="px-4 py-3 font-semibold">Navn</th>
            <th className="px-4 py-3 font-semibold">Kontraktstype</th>
            <th className="px-4 py-3 text-right font-semibold">
              <span className="sr-only">Handlinger</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="border-b border-line transition-colors last:border-b-0 hover:bg-navy-50/50"
            >
              <td className="px-4 py-3.5">
                <Link
                  href={`/kunder/${customer.id}`}
                  className="font-medium text-navy-900 hover:text-navy-700"
                >
                  {customer.name}
                </Link>
                {!customer.active && (
                  <span className="ml-2 font-medium text-navy-700">
                    (inaktiv)
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5 text-navy-700">
                {contractTypeLabels[customer.contractType]}
              </td>
              <td className="px-4 py-3.5 text-right">
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
                  className="inline"
                >
                  <button
                    type="submit"
                    className="text-meta font-semibold text-red-700 hover:underline"
                  >
                    Slett
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
