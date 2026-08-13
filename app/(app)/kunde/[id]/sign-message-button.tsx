"use client";

import { useTransition } from "react";
import { signCustomerMessage } from "@/app/actions/customer-messages";
import { outlineActionClass } from "@/lib/ui";

export function SignMessageButton({ messageId }: { messageId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signCustomerMessage(messageId))}
      className={`mt-2 min-h-12 w-full rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
    >
      {pending ? "Signerer …" : "Signer"}
    </button>
  );
}
