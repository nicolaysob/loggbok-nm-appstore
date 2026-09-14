"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { replyCustomerMessage } from "@/app/actions/customer-messages";
import type { FormState } from "@/lib/validation";
import { textareaClass } from "@/lib/ui";

export function ReplyMessageForm({ messageId }: { messageId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    replyCustomerMessage.bind(null, messageId),
    undefined,
  );
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message?.includes("sendt")) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 text-body font-bold text-on-brand shadow-brand transition-colors active:bg-brand-strong"
      >
        Svar til kunden
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-3 flex flex-col gap-2"
    >
      <p className="flex items-center gap-1.5 text-micro font-semibold text-warn">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 12S6.5 5 12 5s9.5 7 9.5 7-4 7-9.5 7-9.5-7-9.5-7Z" />
          <circle cx="12" cy="12" r="2.75" />
        </svg>
        Kunden ser denne teksten i portalen
      </p>
      <textarea
        name="body"
        rows={3}
        autoFocus
        placeholder="Skriv svaret her"
        aria-label="Svar til kunden"
        className={textareaClass}
      />
      {state?.errors?.body?.map((error) => (
        <p
          key={error}
          role="alert"
          className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-micro font-bold text-danger"
        >
          {error}
        </p>
      ))}
      {state?.message && !state.message.includes("sendt") ? (
        <p
          role="alert"
          className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-micro font-bold text-danger"
        >
          {state.message}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-brand text-meta font-bold text-on-brand shadow-brand transition-colors active:bg-brand-strong disabled:opacity-50"
        >
          {pending ? "Sender …" : "Send svar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="flex min-h-12 items-center justify-center rounded-xl border-[1.5px] border-edge px-4 text-meta font-bold text-ink transition-colors active:bg-sunken"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
