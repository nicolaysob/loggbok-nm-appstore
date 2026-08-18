"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import { createJobType, deleteJobType } from "@/app/actions/jobs";

export type JobTypeRow = {
  id: string;
  name: string;
  jobCount: number;
};

export function JobTypesManager({ types }: { types: JobTypeRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      {types.length === 0 ? (
        <p className="rounded-2xl bg-surface px-5 py-5 text-body text-ink-2 shadow-card">
          Ingen oppdragstyper ennå. Legg til f.eks. Plenklipp eller Maling.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {types.map((type) => (
            <li
              key={type.id}
              className="flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-card"
            >
              <div className="min-w-0">
                <p className="text-heading font-semibold text-ink">
                  {type.name}
                </p>
                <p className="text-meta font-medium text-ink-2">
                  {type.jobCount === 0
                    ? "Ikke i bruk"
                    : `${type.jobCount} oppdrag`}
                </p>
              </div>
              {type.jobCount === 0 && (
                <form action={deleteJobType.bind(null, type.id)}>
                  <button
                    type="submit"
                    className="min-h-12 px-3 text-meta font-semibold text-danger"
                  >
                    Slett
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      <NewJobTypeForm />
    </div>
  );
}

function NewJobTypeForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createJobType,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

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
        <Field label="Ny type" htmlFor="name" errors={state?.errors?.name}>
          <input
            id="name"
            name="name"
            required
            placeholder="F.eks. Plenklipp"
            className={inputClass}
          />
        </Field>
      </div>
      <SubmitButton pendingLabel="Legger til …">Legg til</SubmitButton>
      <Feedback message={state?.message} />
    </form>
  );
}
