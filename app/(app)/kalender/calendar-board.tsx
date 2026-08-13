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
import { solidActionClass } from "@/lib/ui";

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
}) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="border-b border-line px-4 py-3">
        <p className="text-meta font-medium text-navy-700">Uke</p>
        <p className="text-heading text-navy-900">{weekLabel}</p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[56rem] grid-cols-7 divide-x divide-line">
          {days.map((day) => (
            <DayCell
              key={day.key}
              day={day}
              customers={customers}
              jobTypes={jobTypes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayCell({
  day,
  customers,
  jobTypes,
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
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="flex min-h-[28rem] flex-col bg-white">
      <header
        className={`border-b border-line px-2 py-3 text-center ${
          day.isToday ? "bg-brand/10" : "bg-navy-50/40"
        }`}
      >
        <p className="text-meta font-semibold tracking-wide text-navy-700 uppercase">
          {day.weekday.slice(0, 3)}
        </p>
        <p
          className={`mx-auto mt-1 flex size-9 items-center justify-center rounded-full font-mono text-heading ${
            day.isToday
              ? "bg-brand font-semibold text-white"
              : "text-navy-900"
          }`}
        >
          {day.dayNumber}
        </p>
        <p className="mt-0.5 text-meta text-navy-700">{day.monthShort}</p>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {day.pending.map((item) => (
          <article
            key={`${item.jobId}-${item.dayKey}`}
            className="rounded-lg border border-brand/20 bg-brand-50 px-2 py-2"
          >
            <Link
              href={`/kunde/${item.customerId}`}
              className="block truncate text-meta font-semibold text-navy-900"
            >
              {item.customerName}
            </Link>
            <p className="truncate text-meta text-navy-700">{item.typeName}</p>
            <form
              action={completeCalendarJob.bind(null, item.jobId, item.dayKey)}
              className="mt-2"
            >
              <button
                type="submit"
                className={`min-h-10 w-full rounded-lg text-meta font-semibold ${solidActionClass}`}
              >
                Ferdig
              </button>
            </form>
          </article>
        ))}

        {day.done.map((item) => (
          <article
            key={`done-${item.jobId}-${item.dayKey}`}
            className="rounded-lg border border-green-700/15 bg-green-50 px-2 py-2 opacity-90"
          >
            <p className="truncate text-meta font-semibold text-green-700 line-through">
              {item.customerName}
            </p>
            <p className="truncate text-meta text-navy-700">{item.typeName}</p>
            <form
              action={uncompleteCalendarJob.bind(null, item.jobId, item.dayKey)}
              className="mt-1"
            >
              <button
                type="submit"
                className="text-meta font-semibold text-navy-700 underline"
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
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-auto min-h-11 rounded-lg border border-dashed border-line text-meta font-semibold text-navy-700 active:bg-navy-50"
          >
            + Legg til
          </button>
        )}
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
    "w-full rounded-lg border border-line bg-white px-2 py-2 text-meta text-navy-900 outline-none focus:border-navy-700";

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-navy-50/60 px-2 py-2 text-meta text-navy-700">
        Mangler aktive kunder.
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 block font-semibold underline"
        >
          Lukk
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg border border-line bg-navy-50/50 p-2">
      <input type="hidden" name="dayKey" value={dayKey} />

      <label className="flex flex-col gap-1">
        <span className="text-meta font-semibold text-navy-700">Kunde</span>
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
        <span className="text-meta font-semibold text-navy-700">Gjøremål</span>
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
        <span className="text-meta font-semibold text-navy-700">Når</span>
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
        <p className="text-meta font-semibold text-green-700">{state.message}</p>
      )}
      {state?.errors && (
        <p className="text-meta font-semibold text-red-700">
          {Object.values(state.errors).flat()[0]}
        </p>
      )}

      <div className="flex gap-1">
        <button
          type="submit"
          disabled={pending}
          className={`min-h-10 flex-1 rounded-lg text-meta font-semibold ${solidActionClass}`}
        >
          {pending ? "…" : "Lagre"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 rounded-lg px-3 text-meta font-semibold text-navy-700"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
