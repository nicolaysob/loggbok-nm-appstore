"use client";

import { useActionState } from "react";
import type { ContractType } from "@/generated/prisma/enums";
import { contractTypeOptions } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";

export type CustomerFormValues = {
  name: string;
  contractType: ContractType | "";
  active: boolean;
  ownerId: string;
};

export type OwnerOption = { id: string; name: string };

export const emptyCustomer: CustomerFormValues = {
  name: "",
  contractType: "",
  active: true,
  ownerId: "",
};

export function CustomerForm({
  action,
  values,
  submitLabel,
  owners,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: CustomerFormValues;
  submitLabel: string;
  /** Eiere å velge blant — tom liste skjuler feltet helt */
  owners: OwnerOption[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field label="Navn" htmlFor="name" errors={state?.errors?.name}>
        <input
          id="name"
          name="name"
          defaultValue={values.name}
          required
          className={inputClass}
        />
      </Field>

      {owners.length > 0 ? (
        <Field label="Eier" htmlFor="ownerId" errors={state?.errors?.ownerId}>
          <select
            id="ownerId"
            name="ownerId"
            defaultValue={values.ownerId}
            className={inputClass}
          >
            <option value="">Ingen — frittstående kunde</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field
        label="Kontraktstype"
        htmlFor="contractType"
        errors={state?.errors?.contractType}
      >
        <select
          id="contractType"
          name="contractType"
          defaultValue={values.contractType}
          required
          className={inputClass}
        >
          <option value="">Velg …</option>
          {contractTypeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <label className="flex min-h-12 items-center gap-3 text-body font-medium text-ink">
        <input
          type="checkbox"
          name="active"
          defaultChecked={values.active}
          className="size-7 shrink-0 accent-ok"
        />
        Aktiv
      </label>

      <div className="flex items-center gap-4">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}
