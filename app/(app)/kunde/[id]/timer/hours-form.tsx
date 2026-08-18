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
import { CommentField } from "@/components/comment-field";
import { labelClass, outlineActionClass, inputClass } from "@/lib/ui";

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
  const [comment, setComment] = useState("");

  function submit(formData: FormData) {
    formData.set("comment", comment);
    formAction(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-7 pb-4">
      <section className="flex flex-col gap-2">
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
        <p className={labelClass}>Timer</p>
        <div className="flex flex-wrap gap-2">
          {quickHours.map((value) => {
            const active = hours === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setHours(value)}
                className={`min-h-12 min-w-16 rounded-full px-4 font-mono text-body font-bold transition-colors duration-150 ${
                  active
                    ? "bg-brand text-on-brand shadow-brand"
                    : `${outlineActionClass} rounded-full`
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

      <section className="flex flex-col gap-2">
        <label htmlFor="comment" className={labelClass}>
          Hva ble gjort?
        </label>
        <CommentField
          id="comment"
          value={comment}
          onChange={setComment}
          rows={5}
        />
        <FieldError messages={state?.errors?.comment} />
      </section>

      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>
        {hours > 0 ? `Lagre ${formatHours(hours)} t` : "Lagre"}
      </StickySubmit>
    </form>
  );
}
