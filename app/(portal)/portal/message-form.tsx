"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCustomerMessage } from "@/app/actions/customer-messages";
import type { FormState } from "@/lib/validation";
import { FieldError } from "@/components/mobile-form";
import {
  actionSize,
  cardStaticClass,
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
      className={`flex flex-col gap-3 p-4 ${cardStaticClass}`}
    >
      <textarea
        id="body"
        name="body"
        rows={3}
        placeholder="Er det noe vi bør se på?"
        aria-label="Melding"
        className={textareaClass}
      />
      <FieldError messages={state?.errors?.body} />
      {state?.message && (
        <p
          role="status"
          className="rounded-xl bg-brand-soft px-3.5 py-2.5 text-meta font-bold text-brand"
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`${actionSize} ${solidActionClass}`}
      >
        {pending ? "Sender …" : "Send melding"}
      </button>
    </form>
  );
}
