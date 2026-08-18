"use client";

// Kamera er midlertidig skrudd av — base64 i databasen fyller opp Supabase.
// Vises som en diskret linje til funksjonen er tilbake.
export function PhotoPicker({
  files: _files,
  onChange: _onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  return (
    <p className="inline-flex items-center gap-2 self-start text-meta text-ink-2 opacity-70">
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.4-2h6.2L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
        />
        <circle cx="12" cy="13" r="3.25" />
      </svg>
      Bilder er ikke tilgjengelig nå
    </p>
  );
}
