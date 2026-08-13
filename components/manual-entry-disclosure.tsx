import { cardStaticClass } from "@/lib/ui";

/** Lukket som standard — manuell føring uten å fylle skjermen. */
export function ManualEntryDisclosure({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <details className={`group ${cardStaticClass}`}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-heading text-navy-900 marker:content-none [&::-webkit-details-marker]:hidden">
        Før manuelt
        <span
          aria-hidden
          className="text-navy-700 transition-transform duration-150 group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="border-t border-line px-4 pb-4 pt-4">{children}</div>
    </details>
  );
}
