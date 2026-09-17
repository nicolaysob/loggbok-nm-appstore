"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { replyCustomerMessageFromPortal } from "@/app/actions/customer-messages";
import type { FormState } from "@/lib/validation";
import { textareaClass } from "@/lib/ui";

/** Kundens svar i en meldingstråd — også etter at vi har signert den ut. */
export function PortalMessageReply({ messageId }: { messageId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    replyCustomerMessageFromPortal.bind(null, messageId),
    undefined,
  );
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Følger hele state-objektet, ikke teksten: to like kvitteringer på rad
  // ville sett uendret ut, og skjemaet blitt stående åpent.
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
        className="flex min-h-11 items-center gap-1.5 self-start text-micro font-bold uppercase tracking-wide text-ink-3 transition-colors active:text-ink"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.5 11.5a7.9 7.9 0 0 1-8.5 7.9 8.6 8.6 0 0 1-3.1-.6L4 20.5l1.7-4.7a7.7 7.7 0 0 1-.7-3.4 7.9 7.9 0 0 1 8.5-7.9 7.9 7.9 0 0 1 7 7Z" />
        </svg>
        Svar
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <textarea
        name="body"
        rows={3}
        autoFocus
        placeholder="Skriv svaret her"
        aria-label="Svar i meldingen"
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
