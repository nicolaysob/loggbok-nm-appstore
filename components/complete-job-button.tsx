"use client";

import { useState, useTransition } from "react";

/**
 * «Ferdig»-knappen på hjem. Haken tegnes og knappen fylles grønn FØR
 * serveren svarer — trykket skal føles umiddelbart, også på dårlig nett.
 * Selve flyttingen til utført-lista skjer når siden revaliderer.
 */
export function CompleteJobButton({
  action,
  label,
}: {
  action: () => Promise<unknown>;
  label: string;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={confirmed || pending}
      aria-label={label}
      onClick={() => {
        setConfirmed(true);
        // Lite dytt i hånden der telefonen støtter det (Android)
        try {
          navigator.vibrate?.(15);
        } catch {
          // iOS Safari har ikke vibrate — helt greit
        }
        // La haken rekke å tegnes før raden flytter seg
        window.setTimeout(() => {
          startTransition(async () => {
            await action();
          });
        }, 320);
      }}
      className={`flex min-h-12 items-center gap-2 rounded-xl px-3.5 text-meta font-bold transition-colors duration-200 ${
        confirmed
          ? "bg-brand text-on-brand shadow-brand"
          : "bg-brand-soft text-brand active:bg-brand active:text-on-brand"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`size-5 ${confirmed ? "check-anim" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12.5 9.5 17 19 7" />
      </svg>
      Ferdig
    </button>
  );
}
