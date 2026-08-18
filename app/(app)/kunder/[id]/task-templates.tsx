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
  "flex size-11 items-center justify-center rounded-xl bg-surface text-meta shadow-card active:bg-sunken disabled:opacity-40";

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
    <li className="flex flex-col gap-3 rounded-2xl bg-surface px-4 py-4 shadow-card">
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
        className="self-end"
      >
        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-surface px-3 text-meta font-semibold text-danger shadow-card active:bg-danger-soft"
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
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-card"
    >
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
        <p className="rounded-2xl bg-surface px-5 py-5 text-body text-ink-2 shadow-card">
          Ingen oppgavemaler er lagt inn på denne kunden ennå.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
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
