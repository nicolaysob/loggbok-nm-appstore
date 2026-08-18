import Link from "next/link";
import { outlineActionClass } from "@/lib/ui";

export type MonthFolder = {
  param: string;
  label: string;
  count: number;
  isCurrent: boolean;
};

export function MonthFolderList({
  folders,
  hrefFor,
  emptyText,
  countLabel,
}: {
  folders: MonthFolder[];
  hrefFor: (param: string) => string;
  emptyText: string;
  countLabel: (count: number) => string;
}) {
  if (folders.length === 0) {
    return (
      <p className="rounded-2xl border border-hair bg-surface px-4 py-6 text-center text-body text-ink-3 shadow-card">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {folders.map((folder) => (
        <li key={folder.param}>
          <Link
            href={hrefFor(folder.param)}
            className={`flex min-h-[4.5rem] items-center justify-between gap-3 rounded-xl px-4 py-3.5 ${outlineActionClass}`}
          >
            <span className="flex min-w-0 flex-col gap-0.5 text-left">
              <span className="text-heading font-semibold text-ink">
                {folder.label}
              </span>
              <span className="text-meta font-medium text-ink-2">
                {folder.isCurrent
                  ? folder.count === 0
                    ? "Denne måneden — tom så langt"
                    : `Denne måneden · ${countLabel(folder.count)}`
                  : countLabel(folder.count)}
              </span>
            </span>
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-2"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
