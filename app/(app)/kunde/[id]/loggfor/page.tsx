import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { osloDateTimeLocalKey } from "@/lib/period";
import { BackLink } from "@/components/back-link";
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
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Loggfør besøk</h1>
          <p className="text-body text-navy-700">{customer.name}</p>
        </div>
      </div>

      <LogForm
        customerId={customer.id}
        defaultDateTime={osloDateTimeLocalKey()}
      />
    </div>
  );
}
