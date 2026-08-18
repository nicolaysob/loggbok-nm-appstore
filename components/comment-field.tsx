"use client";

import { useState, useTransition } from "react";
import { improveNorwegianText } from "@/app/actions/improve-text";
import { textareaClass } from "@/lib/ui";

/**
 * Tekstfelt med AI-forbedring innebygd — stjernen ligger i selve feltet,
 * så det finnes ingen egen «Forbedre tekst»-knapp å lete etter.
 */
export function CommentField({
  id,
  name,
  value,
  onChange,
  rows = 4,
  placeholder,
  ariaLabel,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const empty = value.trim().length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
          className={`${textareaClass} pr-14`}
        />
        <button
          type="button"
          disabled={empty || pending}
          aria-label={pending ? "Forbedrer tekst" : "Forbedre tekst"}
          title="Forbedre tekst"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await improveNorwegianText(value);
              if (result.error) {
                setError(result.error);
                return;
              }
              if (result.text) onChange(result.text);
            });
          }}
          className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-lg text-ink-2 transition-colors active:bg-sunken disabled:opacity-30"
        >
          <svg
            viewBox="0 0 24 24"
            className={`size-5 ${pending ? "animate-pulse" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3.5 13.2 8.8 18.5 10 13.2 11.2 12 16.5 10.8 11.2 5.5 10 10.8 8.8 12 3.5Z"
            />
            <path
              strokeLinecap="round"
              d="M18 15.5 18.6 17.4 20.5 18 18.6 18.6 18 20.5 17.4 18.6 15.5 18 17.4 17.4 18 15.5Z"
            />
          </svg>
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-meta font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
