"use client";

import { useState, useTransition } from "react";
import { outlineActionClass, solidActionClass, textareaClass } from "@/lib/ui";

type SaveResult = { error?: string };

// Inline redigering for egne tekster — store trykkflater, Lagre/Avbryt.
export function EditableText({
  initialText,
  canEdit,
  onSave,
  rows = 4,
}: {
  initialText: string;
  canEdit: boolean;
  onSave: (text: string) => Promise<SaveResult>;
  rows?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canEdit && !initialText) return null;

  if (!editing) {
    return (
      <div className="flex flex-col gap-2">
        {initialText ? (
          <p className="text-body whitespace-pre-wrap text-navy-900">
            {initialText}
          </p>
        ) : null}
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setDraft(initialText);
              setError(null);
              setEditing(true);
            }}
            className="self-start text-meta font-semibold text-navy-700 underline-offset-2 transition-colors active:text-navy-900"
          >
            Rediger
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={draft}
        rows={rows}
        autoFocus
        onChange={(event) => setDraft(event.target.value)}
        className={textareaClass}
      />
      {error && (
        <p role="alert" className="text-meta font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await onSave(draft);
              if (result.error) {
                setError(result.error);
                return;
              }
              setEditing(false);
              setError(null);
            })
          }
          className={`min-h-12 rounded-md px-4 text-meta font-semibold ${solidActionClass}`}
        >
          {pending ? "Lagrer …" : "Lagre"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setDraft(initialText);
            setError(null);
            setEditing(false);
          }}
          className={`min-h-12 rounded-md px-4 text-meta font-semibold ${outlineActionClass}`}
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
