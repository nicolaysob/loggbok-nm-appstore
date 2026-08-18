"use client";

import { useState } from "react";
import { formatHours } from "@/lib/format";
import { cardStaticClass } from "@/lib/ui";

export type PayrollFolder = {
  userId: string;
  name: string;
  hours: number;
  rows: {
    id: string;
    dateLabel: string;
    hours: number;
    comment: string;
  }[];
};

export function PayrollFolders({ folders }: { folders: PayrollFolder[] }) {
  if (folders.length === 0) {
    return (
      <p className={`px-4 py-5 text-body text-ink-2 ${cardStaticClass}`}>
        Ingen timer ført denne måneden.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {folders.map((folder) => (
        <FolderCard key={folder.userId} folder={folder} />
      ))}
    </ul>
  );
}

function FolderCard({ folder }: { folder: PayrollFolder }) {
  const [open, setOpen] = useState(false);

  return (
    <li className={`overflow-hidden ${cardStaticClass}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left active:bg-sunken"
      >
        <span className="min-w-0 flex-1 text-heading text-ink">
          {folder.name}
        </span>
        <span className="shrink-0 font-mono text-body tabular-nums text-ink-2">
          {formatHours(folder.hours)} t
        </span>
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sunken"
        >
          {open ? "▾" : "›"}
        </span>
      </button>

      {open && (
        <ul className="flex flex-col gap-2 px-4 py-3">
          {folder.rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-1 rounded-xl bg-sunken/60 px-3 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-body font-semibold text-ink">
                  {row.dateLabel}
                </p>
                <p className="font-mono text-body tabular-nums text-ink">
                  {formatHours(row.hours)} t
                </p>
              </div>
              <p className="text-body text-ink-2">{row.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
