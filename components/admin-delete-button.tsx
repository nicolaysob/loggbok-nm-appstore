"use client";

import { useState, useTransition } from "react";
import { deleteIssue, deleteIssueNote } from "@/app/actions/issues";
import { deleteLogEntry } from "@/app/actions/log-entries";

// Slettehandling forbeholdt admin. Bekreftelsen ligger inne i appen, ikke i
// window.confirm — den dialogen er upålitelig i WebView-en appen kjører i,
// og gir små trykkflater med hansker.
export function AdminDeleteButton({
  target,
  id,
  confirmText,
  className,
}: {
  target: "log" | "issue" | "issueNote";
  id: string;
  confirmText: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function remove() {
    startTransition(async () => {
      if (target === "issue") await deleteIssue(id);
      else if (target === "issueNote") await deleteIssueNote(id);
      else await deleteLogEntry(id);
    });
  }

  if (confirming) {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-micro text-ink-2">{confirmText}</span>
        <button
          type="button"
          disabled={pending}
          onClick={remove}
          className="min-h-11 rounded-xl bg-danger px-3.5 text-micro font-bold text-white transition-colors active:opacity-85 disabled:opacity-50"
        >
          {pending ? "Sletter …" : "Ja, slett"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="min-h-11 rounded-xl border-[1.5px] border-edge px-3.5 text-micro font-bold text-ink transition-colors active:bg-sunken"
        >
          Behold
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => setConfirming(true)}
      className={
        className ??
        "min-h-12 rounded-xl px-3 text-meta font-semibold text-danger transition-colors active:bg-danger-soft disabled:opacity-50"
      }
    >
      Slett
    </button>
  );
}
