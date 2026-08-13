"use client";

import { useState, useTransition } from "react";
import { improveNorwegianText } from "@/app/actions/improve-text";
import { outlineActionClass } from "@/lib/ui";

export function ImproveTextButton({
  text,
  onImproved,
}: {
  text: string;
  onImproved: (next: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const empty = text.trim().length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled={empty || pending}
        className={`min-h-14 rounded-md px-4 text-body font-semibold ${outlineActionClass} disabled:opacity-50`}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await improveNorwegianText(text);
            if (result.error) {
              setError(result.error);
              return;
            }
            if (result.text) onImproved(result.text);
          });
        }}
      >
        {pending ? "Forbedrer …" : "Forbedre tekst"}
      </button>
      {error && (
        <p role="alert" className="text-meta font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
