import { notFound } from "next/navigation";
import { getOpenTimeClock } from "@/lib/time-clock-query";
import { db } from "@/lib/db";
import { requireStaffAccess } from "@/lib/dal";
import { osloDateTimeLocalKey } from "@/lib/period";
import { BackLink } from "@/components/back-link";
import { ManualEntryDisclosure } from "@/components/manual-entry-disclosure";
import { TimeClockPanel } from "@/components/time-clock-panel";
import { HoursForm } from "./hours-form";

export default async function ExtraWorkPage({
  params,
}: PageProps<"/kunde/[id]/timer">) {
  await requireStaffAccess("hours");
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
        pausedAt: openClockRow.pausedAt?.toISOString() ?? null,
        pausedMs: openClockRow.pausedMs,
      }
    : null;

  return (
    <div className="flex animate-rise flex-col gap-8">
      <div className="-mx-2 flex items-center gap-1">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <h1 className="min-w-0 truncate text-heading">{customer.name}</h1>
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
