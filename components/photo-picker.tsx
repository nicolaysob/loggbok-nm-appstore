"use client";

import { outlineActionClass } from "@/lib/ui";

// Kamera er midlertidig skrudd av — base64 i databasen fyller opp Supabase.
// Knappen vises fortsatt, men kan ikke trykkes.
export function PhotoPicker({
  files: _files,
  onChange: _onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-disabled="true"
          className={`inline-flex min-h-16 cursor-not-allowed items-center justify-center rounded-md px-5 text-heading font-semibold opacity-50 ${outlineActionClass}`}
        >
          Ta bilde
        </span>
        <span className="text-meta text-navy-700">Ikke tilgjengelig nå</span>
      </div>
    </div>
  );
}
