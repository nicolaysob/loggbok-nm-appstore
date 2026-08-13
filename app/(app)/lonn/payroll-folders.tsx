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
      <p className={`px-4 py-5 text-body text-navy-700 ${cardStaticClass}`}>
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
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left active:bg-navy-50"
      >
        <span className="min-w-0 flex-1 text-heading text-navy-900">
          {folder.name}
        </span>
        <span className="shrink-0 font-mono text-body tabular-nums text-navy-700">
          {formatHours(folder.hours)} t
        </span>
        <span aria-hidden className="text-heading text-navy-100">
          {open ? "▾" : "›"}
        </span>
      </button>

      {open && (
        <ul className="flex flex-col gap-2 border-t border-line px-4 py-3">
          {folder.rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-1 rounded-md bg-navy-50/60 px-3 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-body font-semibold text-navy-900">
                  {row.dateLabel}
                </p>
                <p className="font-mono text-body tabular-nums text-navy-900">
                  {formatHours(row.hours)} t
                </p>
              </div>
              <p className="text-body text-navy-700">{row.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
