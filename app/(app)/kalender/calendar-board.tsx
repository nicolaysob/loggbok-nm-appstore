"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import type { JobScheduleKind } from "@/generated/prisma/enums";
import {
  completeCalendarJob,
  createJobFromCalendar,
  uncompleteCalendarJob,
} from "@/app/actions/jobs";
import { jobScheduleOptions } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { outlineActionClass, solidActionClass } from "@/lib/ui";

export type CalendarItem = {
  jobId: string;
  dayKey: string;
  customerId: string;
  customerName: string;
  typeName: string;
  notes: string | null;
  completedBy: string | null;
};

export type CalendarOption = { id: string; name: string };

export function CalendarBoard({
  weekLabel,
  days,
  customers,
  jobTypes,
  canAdd = false,
}: {
  weekLabel: string;
  days: {
    key: string;
    weekday: string;
    dayNumber: number;
    monthShort: string;
    isToday: boolean;
    pending: CalendarItem[];
    done: CalendarItem[];
  }[];
  customers: CalendarOption[];
  jobTypes: CalendarOption[];
  canAdd?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="px-0.5 text-meta font-medium text-ink-2">{weekLabel}</p>

      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-7 sm:gap-2">
        {days.map((day) => (
          <DayCell
            key={day.key}
            day={day}
            customers={customers}
            jobTypes={jobTypes}
            canAdd={canAdd}
          />
        ))}
      </div>
    </div>
  );
}

function DayCell({
  day,
  customers,
  jobTypes,
  canAdd,
}: {
  day: {
    key: string;
    weekday: string;
    dayNumber: number;
    monthShort: string;
    isToday: boolean;
    pending: CalendarItem[];
    done: CalendarItem[];
  };
  customers: CalendarOption[];
  jobTypes: CalendarOption[];
  canAdd: boolean;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section
      className={`flex flex-col rounded-2xl border bg-surface sm:min-h-[28rem] ${
        day.isToday ? "border-ink" : "border-hair"
      }`}
    >
      {/* Mobil: dag som rad. Desktop: kolonneoverskrift. */}
      <header className="flex items-baseline gap-2 px-4 pt-3 pb-1 sm:hidden">
        <p className="text-body font-semibold text-ink first-letter:uppercase">
          {day.weekday}
        </p>
        <p className="text-meta tabular-nums text-ink-2">
          {day.dayNumber}. {day.monthShort}
        </p>
        {day.isToday ? (
          <span className="ml-auto inline-flex min-h-7 items-center rounded-full bg-brand px-2.5 text-micro font-bold text-on-brand">
            I dag
          </span>
        ) : null}
      </header>

      <header className="hidden px-2 py-3 text-center sm:block">
        <p className="text-meta font-medium uppercase tracking-wide text-ink-2">
          {day.weekday.slice(0, 3)}
        </p>
        <p
          className={`mx-auto mt-1 flex size-9 items-center justify-center rounded-full font-mono text-heading ${
            day.isToday ? "bg-brand font-bold text-on-brand" : "text-ink"
          }`}
        >
          {day.dayNumber}
        </p>
        <p className="mt-0.5 text-meta text-ink-2">{day.monthShort}</p>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-3 pt-2 sm:p-2 sm:pt-0">
        {day.pending.map((item) => (
          <article
            key={`${item.jobId}-${item.dayKey}`}
            className="flex items-center gap-2 rounded-xl bg-sunken py-2 pl-3 pr-1 sm:flex-col sm:items-stretch sm:px-2"
          >
            <Link
              href={`/kunde/${item.customerId}`}
              className="min-w-0 flex-1"
            >
              <span className="block truncate text-meta font-semibold text-ink">
                {item.customerName}
              </span>
              <span className="block truncate text-meta text-ink-2">
                {item.typeName}
              </span>
            </Link>
            <form
              action={completeCalendarJob.bind(null, item.jobId, item.dayKey)}
              className="shrink-0 sm:mt-1"
            >
              <button
                type="submit"
                aria-label={`Sett ferdig hos ${item.customerName}`}
                className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors active:bg-brand active:text-on-brand sm:min-h-10 sm:w-full"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5 9.5 17 19 7" />
                </svg>
              </button>
            </form>
          </article>
        ))}

        {day.done.map((item) => (
          <article
            key={`done-${item.jobId}-${item.dayKey}`}
            className="flex items-center gap-2 rounded-xl px-3 py-2 sm:flex-col sm:items-stretch sm:px-2"
          >
            <p className="min-w-0 flex-1 truncate text-meta font-medium text-ink-2 line-through">
              {item.customerName}
              <span className="font-normal"> · {item.typeName}</span>
            </p>
            <form
              action={uncompleteCalendarJob.bind(null, item.jobId, item.dayKey)}
              className="shrink-0"
            >
              <button
                type="submit"
                className="min-h-11 px-2 text-meta font-medium text-ink-2 underline-offset-2 active:underline sm:min-h-0 sm:px-0"
              >
                Angre
              </button>
            </form>
          </article>
        ))}

        {adding ? (
          <AddJobForm
            dayKey={day.key}
            customers={customers}
            jobTypes={jobTypes}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : canAdd ? (
          <button
            type="button"
            aria-label={`Legg til oppdrag ${day.weekday}`}
            onClick={() => setAdding(true)}
            className={`min-h-11 rounded-xl text-meta font-semibold sm:mt-auto ${outlineActionClass}`}
          >
            +
          </button>
        ) : null}
      </div>
    </section>
  );
}

function AddJobForm({
  dayKey,
  customers,
  jobTypes,
  onDone,
  onCancel,
}: {
  dayKey: string;
  customers: CalendarOption[];
  jobTypes: CalendarOption[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createJobFromCalendar,
    undefined,
  );
  const [kind, setKind] = useState<JobScheduleKind>("ONCE");

  useEffect(() => {
    if (state?.message) onDone();
  }, [state, onDone]);

  const field =
    "w-full rounded-2xl bg-surface px-2 py-2 text-meta text-ink shadow-card outline-none focus:ring-2 focus:ring-brand/20";

  if (customers.length === 0) {
    return (
      <div className="rounded-xl bg-sunken px-2 py-2 text-meta text-ink-2">
        Mangler aktive kunder.
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 block font-semibold"
        >
          Lukk
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl bg-sunken p-2">
      <input type="hidden" name="dayKey" value={dayKey} />

      <label className="flex flex-col gap-1">
        <span className="text-meta font-semibold text-ink-2">Kunde</span>
        <select name="customerId" required className={field} defaultValue="">
          <option value="">Velg …</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-meta font-semibold text-ink-2">Gjøremål</span>
        <input
          name="title"
          required
          placeholder="F.eks. bytte pakninger på kran"
          className={field}
          list={jobTypes.length > 0 ? "job-type-suggestions" : undefined}
        />
        {jobTypes.length > 0 && (
          <datalist id="job-type-suggestions">
            {jobTypes.map((type) => (
              <option key={type.id} value={type.name} />
            ))}
          </datalist>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-meta font-semibold text-ink-2">Når</span>
        <select
          name="kind"
          required
          className={field}
          value={kind}
          onChange={(event) => setKind(event.target.value as JobScheduleKind)}
        >
          {jobScheduleOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <input
        name="notes"
        placeholder="Notat (valgfritt)"
        className={field}
      />

      {state?.message && !state.errors && (
        <p className="text-meta font-semibold text-ok">{state.message}</p>
      )}
      {state?.errors && (
        <p className="text-meta font-semibold text-danger">
          {Object.values(state.errors).flat()[0]}
        </p>
      )}

      <div className="flex gap-1">
        <button
          type="submit"
          disabled={pending}
          className={`min-h-10 flex-1 rounded-xl text-meta font-semibold ${solidActionClass}`}
        >
          {pending ? "…" : "Lagre"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 rounded-xl px-3 text-meta font-semibold text-ink-2"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
