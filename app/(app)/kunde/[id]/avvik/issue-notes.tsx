"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addIssueNote } from "@/app/actions/issues";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import type { FormState } from "@/lib/validation";
import { textareaClass } from "@/lib/ui";

export type IssueNoteItem = {
  id: string;
  body: string;
  /** Ferdig formatert «14. aug. 2026 · 14:20» */
  at: string;
  author: string;
};

export function IssueNotes({
  issueId,
  notes,
  isAdmin,
}: {
  issueId: string;
  notes: IssueNoteItem[];
  isAdmin: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addIssueNote.bind(null, issueId),
    undefined,
  );
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Tøm feltet når oppdateringen er lagret, så neste ikke starter halvskrevet.
  // Følger hele state-objektet, ikke teksten: to like meldinger på rad ville
  // ellers sett uendret ut, og skjemaet ble stående åpent.
  useEffect(() => {
    if (state?.message?.includes("lagret")) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-3 border-t border-hair pt-3">
      {notes.length > 0 ? (
        <ol className="flex flex-col gap-2.5">
          {notes.map((note) => (
            <li key={note.id} className="flex gap-2.5">
              <span
                aria-hidden
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-edge"
              />
              <div className="min-w-0 flex-1">
                <p className="text-micro tabular-nums text-ink-3">
                  {note.at} · {note.author}
                </p>
                <p className="mt-0.5 text-meta whitespace-pre-wrap text-ink">
                  {note.body}
                </p>
              </div>
              {isAdmin ? (
                <AdminDeleteButton
                  target="issueNote"
                  id={note.id}
                  confirmText="Slette denne?"
                  className="min-h-9 shrink-0 rounded-lg px-2 text-micro font-semibold text-ink-3 transition-colors active:bg-danger-soft active:text-danger disabled:opacity-50"
                />
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}

      {open ? (
        <form ref={formRef} action={formAction} className="flex flex-col gap-2">
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
            placeholder="Hva er gjort siden sist?"
            aria-label="Oppdatering på avviket"
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
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-brand text-meta font-bold text-on-brand shadow-brand transition-colors active:bg-brand-strong disabled:opacity-50"
            >
              {pending ? "Lagrer …" : "Lagre oppdatering"}
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
      ) : (
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
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Legg til oppdatering
        </button>
      )}
    </div>
  );
}
