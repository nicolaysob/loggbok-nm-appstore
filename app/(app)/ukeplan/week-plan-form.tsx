"use client";

import { useMemo, useState, useTransition } from "react";
import {
  confirmWeekPlan,
  parseWeekPlan,
  type WeekPlanProposal,
} from "@/app/actions/week-plan";
import {
  inputClass,
  labelClass,
  noticeClass,
  outlineActionClass,
  solidActionClass,
  textareaClass,
} from "@/lib/ui";

type CustomerOption = { id: string; name: string };

type DraftItem = WeekPlanProposal & {
  key: string;
  include: boolean;
};

export function WeekPlanForm({
  weekMondayKey,
  weekLabel,
  dayOptions,
  customers,
}: {
  weekMondayKey: string;
  weekLabel: string;
  dayOptions: { key: string; label: string }[];
  customers: CustomerOption[];
}) {
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const includedCount = useMemo(
    () =>
      drafts.filter(
        (item) => item.include && item.customerId && item.title.trim(),
      ).length,
    [drafts],
  );

  function onParse() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await parseWeekPlan(text, weekMondayKey);
      if (result.error) {
        setDrafts([]);
        setError(result.error);
        return;
      }
      setDrafts(
        (result.items ?? []).map((item, index) => ({
          ...item,
          key: `${item.dayKey}-${index}-${item.title}`,
          include: true,
        })),
      );
    });
  }

  function onConfirm() {
    setError(null);
    setMessage(null);
    const payload = drafts
      .filter((item) => item.include && item.customerId && item.title.trim())
      .map((item) => ({
        dayKey: item.dayKey,
        title: item.title.trim(),
        customerId: item.customerId as string,
      }));

    startTransition(async () => {
      const result = await confirmWeekPlan(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "Lagret.");
      setDrafts([]);
      setText("");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className={noticeClass}>
        Skriv fritt hva som skal gjøres i {weekLabel}. Du får forslag som du
        kan rette før de legges i kalenderen.
      </p>

      <section className="flex flex-col gap-3">
        <label htmlFor="week-plan-text" className={labelClass}>
          Ukeplan
        </label>
        <textarea
          id="week-plan-text"
          rows={10}
          value={text}
          onChange={(event) => setText(event.target.value)}
          className={textareaClass}
          placeholder={
            "Mandag plenklipp hos Hansen\nTirsdag maling på skolen\nOnsdag …"
          }
        />
        <button
          type="button"
          disabled={pending || text.trim().length === 0}
          onClick={onParse}
          className={`min-h-14 rounded-md px-4 text-body font-semibold ${solidActionClass}`}
        >
          {pending && drafts.length === 0 ? "Lager forslag …" : "Lag forslag"}
        </button>
      </section>

      {error && (
        <p role="alert" className="text-body font-semibold text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-body font-semibold text-green-700">
          {message}
        </p>
      )}

      {drafts.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-heading">Forslag</h2>
          <ul className="flex flex-col gap-3">
            {drafts.map((item) => (
              <li
                key={item.key}
                className="flex flex-col gap-3 rounded-md border border-line bg-white p-4"
              >
                <label className="flex min-h-12 items-center gap-3 text-body font-semibold text-navy-900">
                  <input
                    type="checkbox"
                    checked={item.include}
                    onChange={(event) =>
                      setDrafts((prev) =>
                        prev.map((row) =>
                          row.key === item.key
                            ? { ...row, include: event.target.checked }
                            : row,
                        ),
                      )
                    }
                    className="size-6"
                  />
                  Ta med
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-meta font-semibold text-navy-700">
                    Dag
                  </span>
                  <select
                    value={item.dayKey}
                    disabled={!item.include}
                    onChange={(event) =>
                      setDrafts((prev) =>
                        prev.map((row) =>
                          row.key === item.key
                            ? { ...row, dayKey: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className={`${inputClass} min-h-12`}
                  >
                    {dayOptions.map((day) => (
                      <option key={day.key} value={day.key}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-meta font-semibold text-navy-700">
                    Kunde
                  </span>
                  <select
                    value={item.customerId ?? ""}
                    disabled={!item.include}
                    onChange={(event) =>
                      setDrafts((prev) =>
                        prev.map((row) =>
                          row.key === item.key
                            ? {
                                ...row,
                                customerId: event.target.value || null,
                              }
                            : row,
                        ),
                      )
                    }
                    className={`${inputClass} min-h-12`}
                  >
                    <option value="">
                      {item.customerHint
                        ? `Velg kunde (forslag: ${item.customerHint})`
                        : "Velg kunde"}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-meta font-semibold text-navy-700">
                    Oppdrag
                  </span>
                  <input
                    value={item.title}
                    disabled={!item.include}
                    onChange={(event) =>
                      setDrafts((prev) =>
                        prev.map((row) =>
                          row.key === item.key
                            ? { ...row, title: event.target.value }
                            : row,
                        ),
                      )
                    }
                    className={`${inputClass} min-h-12`}
                  />
                </label>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={pending || includedCount === 0}
            onClick={onConfirm}
            className={`min-h-16 rounded-md px-4 text-heading font-semibold ${solidActionClass}`}
          >
            {pending ? "Lagrer …" : `Legg ${includedCount} i kalender`}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setDrafts([])}
            className={`min-h-12 rounded-md px-4 text-meta font-semibold ${outlineActionClass}`}
          >
            Forkast forslag
          </button>
        </section>
      )}
    </div>
  );
}
