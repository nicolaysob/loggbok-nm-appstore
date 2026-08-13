"use client";

import { useActionState } from "react";
import type { Frequency } from "@/generated/prisma/enums";
import { frequencyLabels } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { completeTasks } from "@/app/actions/log-entries";
import { FieldError, StickySubmit } from "@/components/mobile-form";
import { cardClass, inputClass, labelClass } from "@/lib/ui";

export type TaskOption = {
  id: string;
  title: string;
  lastDone: string | null;
};

export type TaskGroup = {
  frequency: Frequency;
  tasks: TaskOption[];
};

export function TasksForm({
  customerId,
  groups,
  defaultDateTime,
}: {
  customerId: string;
  groups: TaskGroup[];
  defaultDateTime: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    completeTasks.bind(null, customerId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 pb-4">
      <div className="flex flex-col gap-1.5">
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
        <p className="text-meta text-navy-700">
          Nå som standard — endre hvis oppgavene ble gjort et annet tidspunkt.
        </p>
        <FieldError messages={state?.errors?.occurredAt} />
      </div>

      {groups.map((group) => (
        <section key={group.frequency} className="flex flex-col gap-3">
          <h2 className="text-heading">{frequencyLabels[group.frequency]}</h2>
          <ul className="flex flex-col gap-3">
            {group.tasks.map((task) => (
              <li key={task.id}>
                {/* Hele raden er trykkbar fordi avkryssingsboksen ligger inni label.
                    Avhuket rad blir grønn — grønt betyr utført. */}
                <label
                  className={`flex min-h-16 cursor-pointer items-center gap-4 px-4 py-3
                             text-navy-900 has-checked:border-green-700/40
                             has-checked:bg-green-50 has-checked:shadow-none ${cardClass}`}
                >
                  <input
                    type="checkbox"
                    name="tasks"
                    value={task.id}
                    className="size-7 shrink-0 accent-green-700"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-heading">{task.title}</span>
                    <span className="font-mono text-meta font-medium text-navy-700">
                      {task.lastDone ?? "Aldri utført"}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Lagre oppgaver</StickySubmit>
    </form>
  );
}
