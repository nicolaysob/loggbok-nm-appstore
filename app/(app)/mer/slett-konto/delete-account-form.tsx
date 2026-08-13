"use client";

import { useState, useTransition } from "react";
import { deleteOwnAccount } from "@/app/actions/account";
import { outlineActionClass, solidActionClass } from "@/lib/ui";

export function DeleteAccountForm() {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-start gap-3 text-body text-navy-800">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-1 size-5 rounded border-line"
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
        className={`min-h-14 w-full rounded-md text-body font-semibold ${solidActionClass} bg-red-700 hover:bg-red-700 active:bg-red-700`}
      >
        {pending ? "Sletter …" : "Slett kontoen min"}
      </button>

      <a
        href="/mer"
        className={`flex min-h-12 items-center justify-center rounded-md text-body font-medium ${outlineActionClass}`}
      >
        Avbryt
      </a>
    </div>
  );
}
