"use client";

import { useActionState, useState } from "react";
import { createTimeEntry } from "@/app/actions/time-entries";
import {
  FieldError,
  HoursStepper,
  StickySubmit,
} from "@/components/mobile-form";
import { formatHours } from "@/lib/format";
import type { FormState } from "@/lib/validation";
import { inputClass, labelClass, textareaClass } from "@/lib/ui";

export function TimeEntryForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createTimeEntry,
    undefined,
  );
  const [hours, setHours] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <label htmlFor="workedOn" className={labelClass}>
          Dato
        </label>
        <input
          id="workedOn"
          name="workedOn"
          type="date"
          required
          defaultValue={defaultDate}
          className={`${inputClass} min-h-14`}
        />
        <FieldError messages={state?.errors?.workedOn} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading">Timer</h2>
        <HoursStepper hours={hours} onChange={setHours} format={formatHours} />
        <input type="hidden" name="hours" value={hours} />
        <FieldError messages={state?.errors?.hours} />
      </section>

      <section className="flex flex-col gap-3">
        <label htmlFor="comment" className={labelClass}>
          Kommentar
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          className={textareaClass}
          placeholder="Hva jobbet du med?"
        />
        <FieldError messages={state?.errors?.comment} />
      </section>

      {state?.message && (
        <p
          role="status"
          className="text-body font-semibold text-green-700"
        >
          {state.message}
        </p>
      )}

      <StickySubmit pending={pending}>Lagre timer</StickySubmit>
    </form>
  );
}
