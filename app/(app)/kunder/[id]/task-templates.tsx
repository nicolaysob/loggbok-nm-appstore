"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Frequency } from "@/generated/prisma/enums";
import { frequencyOptions } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import {
  createTaskTemplate,
  deleteTaskTemplate,
  moveTaskTemplate,
  updateTaskTemplate,
} from "@/app/actions/task-templates";

export type TaskTemplateData = {
  id: string;
  title: string;
  frequency: Frequency;
};

const iconButtonClass =
  "rounded-lg border border-line bg-white px-2 py-2 text-meta hover:bg-navy-50 disabled:opacity-40";

function TaskTemplateRow({
  template,
  isFirst,
  isLast,
}: {
  template: TaskTemplateData;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateTaskTemplate.bind(null, template.id),
    undefined,
  );

  return (
    // Flytteknappene til venstre, Slett helt til høyre bak en skillelinje.
    // Skjemaene er søsken — nøstede form-elementer er ugyldig HTML.
    <li className="flex items-end gap-2 border-b border-line py-3">
      <div className="flex gap-1 pb-1">
        <form action={moveTaskTemplate.bind(null, template.id, "up")}>
          <button
            type="submit"
            disabled={isFirst}
            aria-label="Flytt opp"
            className={iconButtonClass}
          >
            ↑
          </button>
        </form>
        <form action={moveTaskTemplate.bind(null, template.id, "down")}>
          <button
            type="submit"
            disabled={isLast}
            aria-label="Flytt ned"
            className={iconButtonClass}
          >
            ↓
          </button>
        </form>
      </div>

      <form action={formAction} className="flex flex-1 items-end gap-2">
        <div className="flex-1">
          <Field
            label="Tittel"
            htmlFor={`title-${template.id}`}
            errors={state?.errors?.title}
          >
            <input
              id={`title-${template.id}`}
              name="title"
              defaultValue={template.title}
              required
              className={inputClass}
            />
          </Field>
        </div>

        <div className="w-44">
          <Field
            label="Frekvens"
            htmlFor={`frequency-${template.id}`}
            errors={state?.errors?.frequency}
          >
            <select
              id={`frequency-${template.id}`}
              name="frequency"
              defaultValue={template.frequency}
              className={inputClass}
            >
              {frequencyOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <SubmitButton pendingLabel="…" variant="outline">Lagre</SubmitButton>
      </form>

      <form
        action={deleteTaskTemplate.bind(null, template.id)}
        onSubmit={(event) => {
          if (!window.confirm(`Slette oppgaven «${template.title}»?`)) {
            event.preventDefault();
          }
        }}
        className="ml-8 border-l border-line pl-6"
      >
        <button
          type="submit"
          className="rounded-lg border border-red-700/30 px-3 py-2 text-meta text-red-700 hover:bg-red-50"
        >
          Slett
        </button>
      </form>
    </li>
  );
}

function NewTaskTemplateForm({ customerId }: { customerId: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createTaskTemplate.bind(null, customerId),
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Tøm feltene så neste oppgave kan skrives rett inn
  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-2">
      <div className="flex-1">
        <Field label="Tittel" htmlFor="new-title" errors={state?.errors?.title}>
          <input id="new-title" name="title" required className={inputClass} />
        </Field>
      </div>

      <div className="w-44">
        <Field
          label="Frekvens"
          htmlFor="new-frequency"
          errors={state?.errors?.frequency}
        >
          <select
            id="new-frequency"
            name="frequency"
            defaultValue="WEEKLY"
            className={inputClass}
          >
            {frequencyOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <SubmitButton pendingLabel="Legger til …" variant="outline">Legg til</SubmitButton>
      <Feedback message={state?.message} />
    </form>
  );
}

export function TaskTemplates({
  customerId,
  templates,
}: {
  customerId: string;
  templates: TaskTemplateData[];
}) {
  return (
    <div className="flex max-w-4xl flex-col gap-4">
      {templates.length === 0 ? (
        <p className="text-meta font-medium text-navy-700">
          Ingen oppgavemaler er lagt inn på denne kunden ennå.
        </p>
      ) : (
        <ul className="flex flex-col">
          {templates.map((template, index) => (
            <TaskTemplateRow
              key={template.id}
              template={template}
              isFirst={index === 0}
              isLast={index === templates.length - 1}
            />
          ))}
        </ul>
      )}

      <NewTaskTemplateForm customerId={customerId} />
    </div>
  );
}
