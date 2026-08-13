"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { JobScheduleKind } from "@/generated/prisma/enums";
import {
  jobScheduleLabels,
  jobScheduleOptions,
  weekdayLabels,
  weekdayOptions,
} from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import {
  createCustomerJob,
  deleteCustomerJob,
} from "@/app/actions/jobs";

export type JobTypeOption = { id: string; name: string };

export type CustomerJobRow = {
  id: string;
  typeName: string;
  kind: JobScheduleKind;
  dueOn: string | null;
  weekday: number | null;
  startsOn: string;
  notes: string | null;
  active: boolean;
};

export function CustomerJobs({
  customerId,
  jobTypes,
  jobs,
}: {
  customerId: string;
  jobTypes: JobTypeOption[];
  jobs: CustomerJobRow[];
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {jobs.length === 0 ? (
        <p className="text-meta text-navy-700">
          Ingen kalenderoppdrag på denne kunden ennå.
        </p>
      ) : (
        <ul className="flex flex-col">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-start justify-between gap-3 border-b border-line py-3"
            >
              <div className="min-w-0">
                <p className="text-body font-semibold text-navy-900">
                  {job.typeName}
                  {!job.active && (
                    <span className="ml-2 font-medium text-navy-700">
                      (ferdig)
                    </span>
                  )}
                </p>
                <p className="text-meta text-navy-700">
                  {jobScheduleLabels[job.kind]}
                  {job.kind === "ONCE" && job.dueOn && <> · {job.dueOn}</>}
                  {(job.kind === "WEEKLY" || job.kind === "BIWEEKLY") &&
                    job.weekday !== null && (
                      <> · {weekdayLabels[job.weekday]}</>
                    )}
                  {job.kind === "MONTHLY" && <> · fra {job.startsOn}</>}
                  {job.notes && <> · {job.notes}</>}
                </p>
              </div>
              <form action={deleteCustomerJob.bind(null, job.id)}>
                <button
                  type="submit"
                  className="text-meta font-semibold text-red-700 hover:underline"
                >
                  Slett
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <NewCustomerJobForm customerId={customerId} jobTypes={jobTypes} />
    </div>
  );
}

function NewCustomerJobForm({
  customerId,
  jobTypes,
}: {
  customerId: string;
  jobTypes: JobTypeOption[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createCustomerJob.bind(null, customerId),
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<JobScheduleKind>("WEEKLY");
  const [title, setTitle] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.message) {
      formRef.current?.reset();
      setKind("WEEKLY");
      setTitle("");
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-line bg-white p-4"
    >
      <p className="text-heading">Nytt oppdrag</p>

      <Field label="Gjøremål" htmlFor="title" errors={state?.errors?.title}>
        <input
          id="title"
          name="title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="F.eks. bytte pakninger på kran"
          className={inputClass}
          list={jobTypes.length > 0 ? "admin-job-suggestions" : undefined}
        />
        {jobTypes.length > 0 && (
          <datalist id="admin-job-suggestions">
            {jobTypes.map((type) => (
              <option key={type.id} value={type.name} />
            ))}
          </datalist>
        )}
      </Field>

      {jobTypes.length > 0 && (
        <Field
          label="Hurtigvalg (valgfritt)"
          htmlFor="jobTypeId"
          errors={state?.errors?.jobTypeId}
        >
          <select
            id="jobTypeId"
            name="jobTypeId"
            className={inputClass}
            defaultValue=""
            onChange={(event) => {
              const selected = jobTypes.find(
                (type) => type.id === event.target.value,
              );
              if (selected) setTitle(selected.name);
            }}
          >
            <option value="">—</option>
            {jobTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Frekvens" htmlFor="kind" errors={state?.errors?.kind}>
        <select
          id="kind"
          name="kind"
          required
          className={inputClass}
          value={kind}
          onChange={(event) => setKind(event.target.value as JobScheduleKind)}
        >
          {jobScheduleOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      {kind === "ONCE" ? (
        <Field label="Dato" htmlFor="dueOn" errors={state?.errors?.dueOn}>
          <input
            id="dueOn"
            name="dueOn"
            type="date"
            required
            defaultValue={today}
            className={inputClass}
          />
        </Field>
      ) : (
        <>
          {(kind === "WEEKLY" || kind === "BIWEEKLY") && (
            <Field
              label="Ukedag"
              htmlFor="weekday"
              errors={state?.errors?.weekday}
            >
              <select
                id="weekday"
                name="weekday"
                required
                className={inputClass}
                defaultValue="0"
              >
                {weekdayOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field
            label="Startdato"
            htmlFor="startsOn"
            errors={state?.errors?.startsOn}
          >
            <input
              id="startsOn"
              name="startsOn"
              type="date"
              required
              defaultValue={today}
              className={inputClass}
            />
          </Field>
        </>
      )}

      <Field label="Notat" htmlFor="notes" errors={state?.errors?.notes}>
        <input id="notes" name="notes" className={inputClass} />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Legger til …">Legg i kalender</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}
