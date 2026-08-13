import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { osloDateTimeLocalKey } from "@/lib/period";
import { backLinkClass } from "@/lib/ui";
import { LogForm } from "./log-form";

export default async function LogVisitPage({
  params,
}: PageProps<"/kunde/[id]/loggfor">) {
  await requireUser();
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Link href={`/kunde/${customer.id}`} className={backLinkClass}>
          ← {customer.name}
        </Link>
        <h1 className="text-display tracking-tight">Loggfør besøk</h1>
      </div>

      <LogForm
        customerId={customer.id}
        defaultDateTime={osloDateTimeLocalKey()}
      />
    </div>
  );
}
