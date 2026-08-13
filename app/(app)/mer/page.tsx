import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireStaff } from "@/lib/dal";
import { outlineActionClass, cardClass } from "@/lib/ui";

export default async function MorePage() {
  const user = await requireStaff();
  const isAdmin = user.role === "ADMIN";
  const showTimelist = !isAdmin && user.payType === "HOURLY";

  const sections: { title?: string; links: { href: string; label: string }[] }[] =
    [
      {
        links: [
          { href: "/profil", label: "Profil" },
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
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <h1 className="text-display tracking-tight">Mer</h1>

      {sections.map((section) => (
        <section
          key={section.title ?? "main"}
          className="flex flex-col gap-3"
        >
          {section.title && (
            <p className="px-0.5 text-meta font-medium text-navy-700">
              {section.title}
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {section.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex min-h-[4.5rem] items-center justify-between gap-3 px-4 ${cardClass}`}
                >
                  <span className="text-heading font-semibold text-navy-900">
                    {link.label}
                  </span>
                  <span
                    aria-hidden
                    className="flex size-11 items-center justify-center rounded-full bg-navy-50"
                  >
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <form action={logout}>
        <button
          type="submit"
          className={`flex min-h-16 w-full items-center justify-center rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
        >
          Logg ut
        </button>
      </form>

      <div className="flex flex-col items-center gap-3 pb-2">
        <Link
          href="/mer/slett-konto"
          className="text-meta font-medium text-red-700"
        >
          Slett konto
        </Link>
        <Link
          href="/support"
          className="text-meta font-medium text-navy-700"
        >
          Support
        </Link>
        <Link
          href="/personvern"
          className="text-meta font-medium text-navy-700"
        >
          Personvern
        </Link>
      </div>
    </div>
  );
}
