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
    <div className="flex max-w-xl flex-col gap-6">
      <ul className="flex flex-col">
        {types.length === 0 ? (
          <p className="text-meta text-navy-700">
            Ingen oppdragstyper ennå. Legg til f.eks. Plenklipp eller Maling.
          </p>
        ) : (
          types.map((type) => (
            <li
              key={type.id}
              className="flex items-center justify-between gap-3 border-b border-line py-3"
            >
              <div>
                <p className="text-body font-semibold text-navy-900">
                  {type.name}
                </p>
                <p className="text-meta text-navy-700">
                  {type.jobCount === 0
                    ? "Ikke i bruk"
                    : `${type.jobCount} oppdrag`}
                </p>
              </div>
              {type.jobCount === 0 && (
                <form action={deleteJobType.bind(null, type.id)}>
                  <button
                    type="submit"
                    className="text-meta font-semibold text-red-700 hover:underline"
                  >
                    Slett
                  </button>
                </form>
              )}
            </li>
          ))
        )}
      </ul>

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
    <form ref={formRef} action={formAction} className="flex items-end gap-2">
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
