"use client";

import { useState, useTransition } from "react";
import { signCustomerMessage } from "@/app/actions/customer-messages";
import { outlineActionClass } from "@/lib/ui";

export function SignMessageButton({ messageId }: { messageId: string }) {
  const [pending, startTransition] = useTransition();
  const [signed, setSigned] = useState(false);

  // Signering flytter meldingen til arkivet, så raden forsvinner når siden
  // revaliderer. Uten en kvittering først ser det ut som meldingen ble borte.
  return (
    <button
      type="button"
      disabled={pending || signed}
      onClick={() => {
        setSigned(true);
        window.setTimeout(() => {
          startTransition(() => signCustomerMessage(messageId));
        }, 450);
      }}
      className={
        signed
          ? "mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-body font-bold text-on-brand shadow-brand"
          : `mt-2 min-h-12 w-full rounded-xl px-4 text-body font-semibold ${outlineActionClass}`
      }
    >
      {signed ? (
        <>
          <svg
            viewBox="0 0 24 24"
            className="check-anim size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12.5 9.5 17 19 7" />
          </svg>
          Signert · lagt i arkivet
        </>
      ) : (
        "Signer"
      )}
    </button>
  );
}
