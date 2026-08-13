"use client";

import { useActionState, useState } from "react";
import { formatHours } from "@/lib/format";
import type { FormState } from "@/lib/validation";
import { createExtraWork } from "@/app/actions/log-entries";
import {
  FieldError,
  HoursStepper,
  StickySubmit,
} from "@/components/mobile-form";
import {
  labelClass,
  outlineActionClass,
  textareaClass,
  inputClass,
} from "@/lib/ui";

// De vanligste timetallene som ett trykk i stedet for mange på stepperen
const quickHours = [0.5, 1, 1.5, 2, 3, 4];

export function HoursForm({
  customerId,
  defaultDateTime,
}: {
  customerId: string;
  defaultDateTime: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createExtraWork.bind(null, customerId),
    undefined,
  );
  const [hours, setHours] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-8 pb-4">
      <section className="flex flex-col gap-1.5">
        <label htmlFor="occurredAt" className={labelClass}>
          Tidspunkt
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="datetime-local"
          required
          defaultValue={defaultDateTime}
          max={defaultDateTime}
          className={`${inputClass} min-h-14`}
        />
        <FieldError messages={state?.errors?.occurredAt} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading">Timer</h2>
        <div className="flex flex-wrap gap-2">
          {quickHours.map((value) => {
            const active = hours === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setHours(value)}
                className={`min-h-12 min-w-16 rounded-md px-3 font-mono text-body font-semibold transition-all duration-150 ${
                  active
                    ? "border border-brand bg-brand-50 text-green-700"
                    : outlineActionClass
                }`}
              >
                {formatHours(value)}
              </button>
            );
          })}
        </div>
        <HoursStepper hours={hours} onChange={setHours} format={formatHours} />
        <input type="hidden" name="hours" value={hours} />
        <FieldError messages={state?.errors?.hours} />
      </section>

      <section className="flex flex-col gap-3">
        <label htmlFor="comment" className={labelClass}>
          Hva ble gjort?
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={5}
          className={textareaClass}
        />
        <FieldError messages={state?.errors?.comment} />
      </section>

      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Lagre ekstraarbeid</StickySubmit>
    </form>
  );
}
