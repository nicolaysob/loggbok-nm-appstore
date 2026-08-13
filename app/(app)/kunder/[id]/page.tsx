import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/time";
import { updateCustomer } from "@/app/actions/customers";
import { adminBackLinkClass as backLinkClass } from "@/lib/ui";
import { CustomerForm } from "../customer-form";
import { CustomerJobs } from "./customer-jobs";
import { DeleteCustomerButton } from "./delete-customer-button";
import { TaskTemplates } from "./task-templates";

export default async function CustomerAdminPage({
  params,
}: PageProps<"/kunder/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const [customer, jobTypes] = await Promise.all([
    db.customer.findUnique({
      where: { id },
      include: {
        areas: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: {
            taskTemplates: {
              orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
              select: { id: true, title: true, frequency: true },
            },
            customerJobs: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                title: true,
                kind: true,
                dueOn: true,
                weekday: true,
                startsOn: true,
                notes: true,
                active: true,
                jobType: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    db.jobType.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!customer) notFound();

  const area = customer.areas[0];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href="/kunder" className={backLinkClass}>
            ← Kunder
          </Link>
          <h1 className="text-display tracking-tight">{customer.name}</h1>
        </div>

        <CustomerForm
          action={updateCustomer.bind(null, customer.id)}
          values={{
            name: customer.name,
            contractType: customer.contractType,
            active: customer.active,
          }}
          submitLabel="Lagre kunde"
        />

        <div className="max-w-lg border-t border-line pt-6">
          <p className="mb-3 text-meta text-navy-700">
            Sletting fjerner kunden og all historikk permanent. Bruk heller
            «Aktiv»-avhukingen hvis kunden bare skal skjules fra lista.
          </p>
          <DeleteCustomerButton
            customerId={customer.id}
            customerName={customer.name}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Kalenderoppdrag</h2>
        <p className="text-meta text-navy-700">
          Bestilte jobber i ukeplanen. Skriv hva som skal gjøres — hurtigvalg er
          valgfritt.
        </p>
        <CustomerJobs
          customerId={customer.id}
          jobTypes={jobTypes}
          jobs={(area?.customerJobs ?? []).map((job) => ({
            id: job.id,
            typeName: job.title || job.jobType?.name || "Oppdrag",
            kind: job.kind,
            dueOn: job.dueOn ? formatDate(job.dueOn) : null,
            weekday: job.weekday,
            startsOn: formatDate(job.startsOn),
            notes: job.notes,
            active: job.active,
          }))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-heading">Oppgavemaler</h2>
        <TaskTemplates
          customerId={customer.id}
          templates={area?.taskTemplates ?? []}
        />
      </section>
    </div>
  );
}
