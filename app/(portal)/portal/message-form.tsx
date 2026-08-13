"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCustomerMessage } from "@/app/actions/customer-messages";
import type { FormState } from "@/lib/validation";
import { FieldError } from "@/components/mobile-form";
import {
  cardStaticClass,
  labelClass,
  solidActionClass,
  textareaClass,
} from "@/lib/ui";

export function PortalMessageForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createCustomerMessage,
    undefined,
  );

  useEffect(() => {
    if (state?.message) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={`flex flex-col gap-3 p-4 sm:p-5 ${cardStaticClass}`}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-heading text-navy-900">Skriv til N&amp;M</h2>
        <p className="text-meta text-navy-700">
          Fortell hva som trengs — vi får varsel og følger opp.
        </p>
      </div>
      <label htmlFor="body" className={labelClass}>
        Melding
      </label>
      <textarea
        id="body"
        name="body"
        rows={3}
        placeholder="F.eks. lys ute, lekkasje, eller noe annet …"
        className={textareaClass}
      />
      <FieldError messages={state?.errors?.body} />
      {state?.message && (
        <p role="status" className="text-body font-semibold text-green-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`min-h-14 w-full rounded-md text-body font-semibold ${solidActionClass}`}
      >
        {pending ? "Sender …" : "Send melding"}
      </button>
    </form>
  );
}
