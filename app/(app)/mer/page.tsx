import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireStaff } from "@/lib/dal";
import { outlineActionClass, cardStaticClass } from "@/lib/ui";

export default async function MorePage() {
  const user = await requireStaff();
  const isAdmin = user.role === "ADMIN";
  const showTimelist = !isAdmin && user.payType === "HOURLY";

  const sections: { title?: string; links: { href: string; label: string }[] }[] =
    [
      {
        links: [
          { href: "/", label: "Hjem" },
          { href: "/kalender", label: "Kalender" },
          ...(isAdmin ? [{ href: "/ukeplan", label: "Ukeplan" }] : []),
          ...(showTimelist ? [{ href: "/timeliste", label: "Timeliste" }] : []),
        ],
      },
      ...(isAdmin
        ? [
            {
              title: "Økonomi",
              links: [
                { href: "/lonn", label: "Lønn" },
                { href: "/uke", label: "Uken" },
                { href: "/mnd", label: "Fakturering" },
              ],
            },
            {
              title: "Oppsett",
              links: [
                { href: "/kunder", label: "Kunder" },
                { href: "/brukere", label: "Brukere" },
                { href: "/oppdragstyper", label: "Typer" },
              ],
            },
          ]
        : []),
    ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display tracking-tight">Mer</h1>

      {sections.map((section) => (
        <section
          key={section.title ?? "main"}
          className={`flex flex-col overflow-hidden ${cardStaticClass}`}
        >
          {section.title && (
            <p className="border-b border-line px-4 py-2.5 text-meta font-medium text-navy-700">
              {section.title}
            </p>
          )}
          <ul className="flex flex-col divide-y divide-line">
            {section.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-14 items-center px-4 text-body font-medium text-navy-900 active:bg-navy-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <form action={logout}>
        <button
          type="submit"
          className={`flex min-h-14 w-full items-center justify-center rounded-md px-4 text-body font-medium ${outlineActionClass}`}
        >
          Logg ut
        </button>
      </form>

      <Link
        href="/personvern"
        className="text-center text-meta font-medium text-navy-700"
      >
        Personvern
      </Link>
    </div>
  );
}
