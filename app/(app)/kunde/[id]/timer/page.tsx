import { notFound } from "next/navigation";
import { getOpenTimeClock } from "@/lib/time-clock-query";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { osloDateTimeLocalKey } from "@/lib/period";
import { BackLink } from "@/components/back-link";
import { ManualEntryDisclosure } from "@/components/manual-entry-disclosure";
import { TimeClockPanel } from "@/components/time-clock-panel";
import { HoursForm } from "./hours-form";

export default async function ExtraWorkPage({
  params,
}: PageProps<"/kunde/[id]/timer">) {
  await requireStaff();
  const { id } = await params;

  const [customer, openClockRow] = await Promise.all([
    db.customer.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
    getOpenTimeClock(),
  ]);

  if (!customer) notFound();

  const openClock = openClockRow
    ? {
        kind: openClockRow.kind,
        customerId: openClockRow.customerId,
        customerName: openClockRow.customer?.name ?? null,
        startedAt: openClockRow.startedAt.toISOString(),
      }
    : null;

  return (
    <div className="flex animate-rise flex-col gap-8">
      <div className="flex flex-col gap-4">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Timeregistrering</h1>
          <p className="text-body text-navy-700">{customer.name}</p>
        </div>
      </div>

      <TimeClockPanel
        mode="EXTRA_WORK"
        customerId={customer.id}
        openClock={openClock}
      />

      <ManualEntryDisclosure>
        <HoursForm
          customerId={customer.id}
          defaultDateTime={osloDateTimeLocalKey()}
        />
      </ManualEntryDisclosure>
    </div>
  );
}
