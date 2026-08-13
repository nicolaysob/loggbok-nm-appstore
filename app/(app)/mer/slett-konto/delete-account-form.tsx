"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteOwnAccount } from "@/app/actions/account";
import { outlineActionClass } from "@/lib/ui";

export function DeleteAccountForm() {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      <label className="flex items-start gap-4 text-body text-navy-800">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 size-7 shrink-0 accent-red-700"
        />
        <span>
          Jeg forstår at kontoen deaktiveres og at jeg mister tilgang til
          Loggbok.
        </span>
      </label>

      {error && (
        <p role="alert" className="text-body font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!confirmed || pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await deleteOwnAccount();
            if (result?.error) setError(result.error);
          });
        }}
        className="min-h-16 w-full rounded-md bg-red-700 text-body font-semibold text-white shadow-card active:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Sletter …" : "Slett kontoen min"}
      </button>

      <Link
        href="/mer"
        className={`flex min-h-16 items-center justify-center rounded-md text-body font-semibold ${outlineActionClass}`}
      >
        Avbryt
      </Link>
    </div>
  );
}
