"use client";

import { useMemo, useState } from "react";
import { CustomerPickList } from "@/components/customer-pick-list";
import { needsAttention } from "@/lib/access";
import type { CustomerOverviewRow } from "@/lib/customer-overview";

export function CustomerWorkList({
  customers,
  canLog = true,
}: {
  customers: CustomerOverviewRow[];
  canLog?: boolean;
}) {
  const [query, setQuery] = useState("");
  const attentionCount = customers.filter(needsAttention).length;
  const [filter, setFilter] = useState<"attention" | "all">(
    attentionCount > 0 ? "attention" : "all",
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("nb-NO");
    const pool = needle
      ? customers.filter((customer) =>
          customer.name.toLocaleLowerCase("nb-NO").includes(needle),
        )
      : filter === "attention"
        ? customers.filter(needsAttention)
        : customers;
    return pool;
  }, [customers, query, filter]);

  const searching = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Søk kunde"
          enterKeyHint="search"
          autoCapitalize="none"
          autoCorrect="off"
          aria-label="Søk etter kunde"
          className="min-h-14 min-w-0 flex-1 rounded-2xl border border-hair bg-surface pl-12 pr-4 text-body text-ink shadow-card outline-none placeholder:text-ink-3 focus:border-brand"
        />
      </div>

      {!searching && attentionCount > 0 ? (
        <div className="flex gap-1 rounded-2xl bg-sunken p-1">
          <FilterChip
            label="Oppfølging"
            count={attentionCount}
            active={filter === "attention"}
            onClick={() => setFilter("attention")}
          />
          <FilterChip
            label="Alle"
            count={customers.length}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-hair bg-surface px-4 py-5 text-body text-ink-2">
          {searching ? "Ingen treff." : "Ingen kunder."}
        </p>
      ) : (
        <CustomerPickList customers={filtered} canLog={canLog} />
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl text-meta font-bold transition-colors ${
        active ? "bg-surface text-ink shadow-card" : "text-ink-2"
      }`}
    >
      {label}
      <span className="tabular-nums opacity-55">{count}</span>
    </button>
  );
}
