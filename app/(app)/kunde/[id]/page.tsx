import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { formatLastVisit, formatTime } from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { CustomerActionBar } from "@/components/customer-action-bar";
import { PageLoading } from "@/components/page-loading";
import { CustomerBody } from "./customer-body";

export default async function CustomerPage({
  params,
  searchParams,
}: PageProps<"/kunde/[id]">) {
  const user = await requireStaff();
  const { id } = await params;
  const { lagret } = await searchParams;

  // Toppen skal stå ferdig før detaljene lastes — derfor bare de tallene
  // handlingsraden trenger, ikke hele innholdet.
  const [customer, openIssues, lastEntry] = await Promise.all([
    db.customer.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
    user.access.issues
      ? db.issue.count({
          where: {
            area: { customerId: id },
            status: { in: ["OPEN", "IN_PROGRESS"] },
          },
        })
      : Promise.resolve(0),
    db.logEntry.findFirst({
      where: { area: { customerId: id } },
      orderBy: { occurredAt: "desc" },
      select: { occurredAt: true },
    }),
  ]);

  if (!customer) notFound();

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      {lagret ? (
        <p
          role="status"
          className="flex animate-toast items-center gap-3 rounded-2xl bg-brand px-4 py-3.5 text-on-brand shadow-brand"
        >
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20"
          >
            <svg
              viewBox="0 0 24 24"
              className="check-anim size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5 9.5 17 19 7" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-body font-bold">Lagret i loggen</span>
            <span className="block truncate text-meta text-on-brand/75">
              {customer.name} · {formatTime(new Date())}
            </span>
          </span>
        </p>
      ) : null}

      <header className="-mt-1">
        <div className="-ml-3">
          <BackLink fallback="/" />
        </div>
        <h1 className="mt-1 text-display text-ink">{customer.name}</h1>
        <p className="mt-1.5 text-meta text-ink-2">
          Sist besøk:{" "}
          {formatLastVisit(lastEntry?.occurredAt ?? null).toLowerCase()}
        </p>
      </header>

      <CustomerActionBar
        customerId={customer.id}
        access={user.access}
        openIssues={openIssues}
      />

      <Suspense fallback={<PageLoading label="Henter detaljer …" />}>
        <CustomerBody
          customerId={customer.id}
          currentUserId={user.id}
          isAdmin={user.role === "ADMIN"}
          access={user.access}
        />
      </Suspense>
    </div>
  );
}
