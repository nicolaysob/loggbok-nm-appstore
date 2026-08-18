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
};

export const emptyCustomer: CustomerFormValues = {
  name: "",
  contractType: "",
  active: true,
};

export function CustomerForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: CustomerFormValues;
  submitLabel: string;
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
