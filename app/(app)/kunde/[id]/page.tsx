import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import {
  backLinkClass,
  outlineActionClass,
  solidActionClass,
} from "@/lib/ui";
import { PageLoading } from "@/components/page-loading";
import { CustomerBody } from "./customer-body";

const actions = [
  {
    href: "loggfor",
    title: "Loggfør besøk",
    hint: "Notat fra runden",
    primary: true,
  },
  {
    href: "oppgaver",
    title: "Oppgaver",
    hint: "Kryss av faste jobber",
    primary: false,
  },
  {
    href: "timer",
    title: "Timeregistrering",
    hint: "Ekstraarbeid til faktura",
    primary: false,
  },
  {
    href: "avvik",
    title: "Meld avvik",
    hint: "Feil og mangler",
    primary: false,
  },
  {
    href: "meldingsarkiv",
    title: "Meldingsarkiv",
    hint: "Signerte meldinger fra kunden",
    primary: false,
  },
] as const;

export default async function CustomerPage({
  params,
  searchParams,
}: PageProps<"/kunde/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const { lagret } = await searchParams;

  // Kun kundenavn først — handlingene kan vises med én gang
  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  return (
    <div className="flex animate-rise flex-col gap-8">
      {lagret && (
        <p
          role="status"
          className="rounded-md border border-green-700/20 bg-green-50 px-4 py-3 text-body font-semibold text-green-700"
        >
          Registreringen er lagret.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Link href="/" className={backLinkClass}>
          ← Kunder
        </Link>
        <h1 className="text-display tracking-tight">{customer.name}</h1>
        <p className="text-body text-navy-700">Hva skal registreres?</p>
      </div>

      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={`/kunde/${customer.id}/${action.href}`}
            prefetch
            className={`flex min-h-20 items-center justify-between gap-3 rounded-md px-5 py-4 ${
              action.primary ? solidActionClass : outlineActionClass
            }`}
          >
            <span className="flex flex-col gap-0.5 text-left">
              <span className="text-heading font-semibold">{action.title}</span>
              <span
                className={`text-meta font-medium ${
                  action.primary ? "text-white/75" : "text-navy-700"
                }`}
              >
                {action.hint}
              </span>
            </span>
            <span
              aria-hidden
              className={`text-display leading-none ${
                action.primary ? "text-white/50" : "text-navy-100"
              }`}
            >
              ›
            </span>
          </Link>
        ))}
      </div>

      <Suspense fallback={<PageLoading label="Henter detaljer …" />}>
        <CustomerBody
          customerId={customer.id}
          currentUserId={user.id}
          isAdmin={user.role === "ADMIN"}
        />
      </Suspense>
    </div>
  );
}
