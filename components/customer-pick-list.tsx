"use client";

import Link from "next/link";
import { useState } from "react";
import { formatLastVisit } from "@/lib/time";
import { badgeClass, type BadgeTone } from "@/lib/ui";
import type { CustomerOverviewRow } from "@/lib/customer-overview";

type Entry =
  | { kind: "place"; customer: CustomerOverviewRow }
  | {
      kind: "owner";
      ownerId: string;
      label: string;
      places: CustomerOverviewRow[];
    };

/** Eldst først — det vi ikke har vært på lengst skal ligge øverst. */
function byLastVisit(a: CustomerOverviewRow, b: CustomerOverviewRow) {
  if (!a.lastVisit && !b.lastVisit) {
    return a.name.localeCompare(b.name, "nb-NO");
  }
  if (!a.lastVisit) return -1;
  if (!b.lastVisit) return 1;
  return a.lastVisit.getTime() - b.lastVisit.getTime();
}

/**
 * Stedene til én eier legger seg under én rad. Et bygg med fire kundekort
 * skal ikke fylle fire skjermlengder i lista de ansatte bruker hver dag.
 *
 * Mappene ligger øverst, resten under sortert på sist loggført. Det som
 * haster ligger i Oppfølging-fanen — denne lista er til å finne fram i, og
 * da er fast rekkefølge verdt mer enn at et avvik flytter en rad oppover.
 */
function groupByOwner(customers: CustomerOverviewRow[]): Entry[] {
  const entries: Entry[] = [];
  const groups = new Map<string, Extract<Entry, { kind: "owner" }>>();

  for (const customer of customers) {
    if (!customer.ownerId) {
      entries.push({ kind: "place", customer });
      continue;
    }

    const existing = groups.get(customer.ownerId);
    if (existing) {
      existing.places.push(customer);
      continue;
    }

    const group = {
      kind: "owner" as const,
      ownerId: customer.ownerId,
      label: customer.ownerLabel ?? customer.name,
      places: [customer],
    };
    groups.set(customer.ownerId, group);
    entries.push(group);
  }

  // En eier med bare ett sted er ingen gruppe — da er raden bare et ekstra trykk
  const flattened: Entry[] = entries.map((entry) =>
    entry.kind === "owner" && entry.places.length === 1
      ? { kind: "place", customer: entry.places[0] }
      : entry,
  );

  const folders = flattened.filter(
    (entry): entry is Extract<Entry, { kind: "owner" }> =>
      entry.kind === "owner",
  );
  const singles = flattened.filter(
    (entry): entry is Extract<Entry, { kind: "place" }> =>
      entry.kind === "place",
  );

  for (const folder of folders) {
    folder.places.sort(byLastVisit);
  }
  singles.sort((a, b) => byLastVisit(a.customer, b.customer));

  return [...folders, ...singles];
}

export function CustomerPickList({
  customers,
  canLog = true,
  grouped = false,
}: {
  customers: CustomerOverviewRow[];
  canLog?: boolean;
  /** Samler stedene under eieren. Av ved søk og oppfølging — der vil man se alt. */
  grouped?: boolean;
}) {
  const entries = grouped
    ? groupByOwner(customers)
    : customers.map(
        (customer) => ({ kind: "place", customer }) satisfies Entry,
      );

  return (
    <ul className="overflow-hidden rounded-2xl border border-hair bg-surface shadow-card">
      {entries.map((entry) =>
        entry.kind === "owner" ? (
          <OwnerGroup key={entry.ownerId} group={entry} canLog={canLog} />
        ) : (
          <PlaceRow
            key={entry.customer.id}
            customer={entry.customer}
            canLog={canLog}
          />
        ),
      )}
    </ul>
  );
}

function OwnerGroup({
  group,
  canLog,
}: {
  group: Extract<Entry, { kind: "owner" }>;
  canLog: boolean;
}) {
  const [open, setOpen] = useState(false);

  const totals = group.places.reduce(
    (sum, place) => ({
      openIssues: sum.openIssues + place.openIssues,
      unreadMessages: sum.unreadMessages + place.unreadMessages,
      openTodos: sum.openTodos + place.openTodos,
    }),
    { openIssues: 0, unreadMessages: 0, openTodos: 0 },
  );

  // Det stedet det er lengst siden vi var på — ellers gjemmer et ferskt besøk
  // på nabobygget at ett av dem er glemt
  const oldest = group.places.reduce<{ seen: boolean; date: Date | null }>(
    (worst, place) => {
      if (!place.lastVisit) return { seen: true, date: null };
      if (worst.seen && !worst.date) return worst;
      if (!worst.date || place.lastVisit < worst.date) {
        return { seen: true, date: place.lastVisit };
      }
      return worst;
    },
    { seen: false, date: null },
  );

  return (
    <li className="border-b border-hair last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-[4.75rem] w-full items-center gap-3 py-3.5 pl-4 pr-3 text-left active:bg-sunken"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          >
            <path d="M4 21V8l8-5 8 5v13" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-heading text-ink">
            {group.label}
          </span>
          <span className="mt-1 block truncate text-meta text-ink-2">
            {group.places.length} steder · lengst siden:{" "}
            {formatLastVisit(oldest.date).toLowerCase()}
          </span>
          <Badges {...totals} />
        </span>
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-2"
        >
          {open ? "▾" : "›"}
        </span>
      </button>

      {open ? (
        <ul className="border-t border-hair bg-sunken pl-3">
          {group.places.map((place) => (
            <PlaceRow
              key={place.id}
              customer={place}
              canLog={canLog}
              nested
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function PlaceRow({
  customer,
  canLog,
  nested = false,
}: {
  customer: CustomerOverviewRow;
  canLog: boolean;
  nested?: boolean;
}) {
  return (
    <li
      className={`flex items-stretch border-b border-hair last:border-b-0 ${
        nested ? "border-l-[3px] border-l-brand/40 bg-surface" : ""
      }`}
    >
      <Link
        href={`/kunde/${customer.id}`}
        prefetch
        className="flex min-h-[4.75rem] min-w-0 flex-1 items-center py-3.5 pl-4 text-ink active:bg-sunken"
      >
        <span className="min-w-0">
          <span className="block truncate text-heading">{customer.name}</span>
          {customer.ownerLabel && !nested ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-micro font-bold text-brand">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinejoin="round"
              >
                <path d="M4 21V8l8-5 8 5v13" />
                <path d="M9 21v-6h6v6" />
              </svg>
              {customer.ownerLabel}
            </span>
          ) : null}
          <span className="mt-1 block truncate text-meta text-ink-2">
            Sist besøk: {formatLastVisit(customer.lastVisit).toLowerCase()}
          </span>
          <Badges
            openIssues={customer.openIssues}
            openTodos={customer.openTodos}
            unreadMessages={customer.unreadMessages}
          />
        </span>
      </Link>
      {canLog ? (
        <span className="flex shrink-0 items-center px-3">
          <Link
            href={`/kunde/${customer.id}/loggfor`}
            prefetch
            aria-label={`Loggfør hos ${customer.name}`}
            className="flex size-14 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-brand transition-colors active:bg-brand-strong"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </span>
      ) : null}
    </li>
  );
}

/** Merkelapper med tekst — små fargeprikker er ubrukelige i sollys. */
function Badges({
  openIssues,
  openTodos,
  unreadMessages,
}: {
  openIssues: number;
  openTodos: number;
  unreadMessages: number;
}) {
  const badges: { key: string; tone: BadgeTone; label: string }[] = [];

  if (openIssues > 0) {
    badges.push({
      key: "issues",
      tone: "danger",
      label: openIssues === 1 ? "1 avvik" : `${openIssues} avvik`,
    });
  }
  if (openTodos > 0) {
    badges.push({
      key: "todos",
      tone: "warn",
      label: openTodos === 1 ? "1 gjøremål" : `${openTodos} gjøremål`,
    });
  }
  if (unreadMessages > 0) {
    badges.push({
      key: "messages",
      tone: "neutral",
      label:
        unreadMessages === 1 ? "Ny melding" : `${unreadMessages} meldinger`,
    });
  }

  if (badges.length === 0) return null;

  return (
    <span className="mt-2 flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span key={badge.key} className={badgeClass[badge.tone]}>
          {badge.label}
        </span>
      ))}
    </span>
  );
}
