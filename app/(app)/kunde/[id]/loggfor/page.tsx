import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffAccess } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { frequencyOrder } from "@/lib/labels";
import { osloDateTimeLocalKey } from "@/lib/period";
import { formatDate } from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { LogForm, type LogTaskOption } from "./log-form";

export default async function LogVisitPage({
  params,
}: PageProps<"/kunde/[id]/loggfor">) {
  await requireStaffAccess("log");
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const areaId = await primaryAreaId(customer.id);

  const templates = areaId
    ? await db.taskTemplate.findMany({
        where: { areaId },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { id: true, title: true, frequency: true },
      })
    : [];

  // Alle avhukinger nyeste først. Første treff per oppgave er den siste gangen
  // den ble utført — én spørring i stedet for én per oppgave.
  const completions =
    areaId && templates.length > 0
      ? await db.completedTask.findMany({
          where: { taskTemplate: { areaId } },
          orderBy: { logEntry: { occurredAt: "desc" } },
          select: {
            taskTemplateId: true,
            logEntry: {
              select: { occurredAt: true, user: { select: { name: true } } },
            },
          },
        })
      : [];

  const lastDone = new Map<string, string>();
  for (const completion of completions) {
    if (!lastDone.has(completion.taskTemplateId)) {
      lastDone.set(
        completion.taskTemplateId,
        `${formatDate(completion.logEntry.occurredAt)} · ${completion.logEntry.user.name}`,
      );
    }
  }

  // Flat liste, hyppigste frekvens først — skjemaet trenger ingen grupper
  const tasks: LogTaskOption[] = frequencyOrder.flatMap((frequency) =>
    templates
      .filter((template) => template.frequency === frequency)
      .map((template) => ({
        id: template.id,
        title: template.title,
        lastDone: lastDone.get(template.id) ?? null,
      })),
  );

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <header>
        <div className="-mx-2 flex items-center gap-1">
          <BackLink fallback={`/kunde/${customer.id}`} />
          <p className="min-w-0 truncate text-meta font-semibold text-ink-2">
            {customer.name}
          </p>
        </div>
        <h1 className="mt-1 text-display text-ink">Loggfør besøk</h1>
      </header>

      <LogForm
        customerId={customer.id}
        defaultDateTime={osloDateTimeLocalKey()}
        tasks={tasks}
      />
    </div>
  );
}
