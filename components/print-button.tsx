"use client";

import { outlineActionClass } from "@/lib/ui";

/** Nettleseren tilbyr «Lagre som PDF» i utskriftsdialogen, også på iPhone. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`flex min-h-12 items-center gap-2 px-4 text-meta ${outlineActionClass}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 9V4h10v5M7 18H5.5A1.5 1.5 0 0 1 4 16.5v-5A1.5 1.5 0 0 1 5.5 10h13a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H17" />
        <path d="M7 15h10v5H7z" />
      </svg>
      Skriv ut / PDF
    </button>
  );
}
