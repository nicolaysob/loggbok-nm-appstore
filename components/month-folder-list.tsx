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
    return <p className="rounded-md bg-white px-5 py-5 text-body text-navy-700 shadow-card">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {folders.map((folder) => (
        <li key={folder.param}>
          <Link
            href={hrefFor(folder.param)}
            className={`flex min-h-[4.5rem] items-center justify-between gap-3 rounded-md px-4 py-3.5 ${outlineActionClass}`}
          >
            <span className="flex min-w-0 flex-col gap-0.5 text-left">
              <span className="text-heading font-semibold text-navy-900">
                {folder.label}
              </span>
              <span className="text-meta font-medium text-navy-700">
                {folder.isCurrent
                  ? folder.count === 0
                    ? "Denne måneden — tom så langt"
                    : `Denne måneden · ${countLabel(folder.count)}`
                  : countLabel(folder.count)}
              </span>
            </span>
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-50"
            >
              ›
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
