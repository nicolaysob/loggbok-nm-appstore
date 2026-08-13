import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { BrandIcon } from "@/components/brand";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { OneSignalInit } from "@/components/onesignal-init";
import { ProfileCorner } from "@/components/profile-menu";
import type { AppNavGroup } from "@/components/mobile-nav";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { roleLabels } from "@/lib/labels";
import { outlineActionClass } from "@/lib/ui";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user?.role === "CUSTOMER") redirect("/portal");

  const isAdmin = user?.role === "ADMIN";
  const showTimelist = !isAdmin && user?.payType === "HOURLY";

  const groups: AppNavGroup[] = [
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
    <div className="flex min-h-full flex-1 flex-col">
      {/* Logo-bar kun på desktop — mobil bruker sidetittel som i en app */}
      <header className="sticky top-0 z-30 hidden border-b border-line bg-white/85 backdrop-blur-xl sm:block">
        <div className="relative mx-auto w-full max-w-5xl sm:max-w-6xl">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <Link
              href="/"
              className="flex min-h-10 min-w-0 items-center gap-2.5"
              aria-label="Loggbok hjem"
            >
              <BrandIcon size={28} className="size-7" />
              <span className="truncate text-meta font-semibold tracking-tight text-navy-900">
                Loggbok
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-3">
              <span className="max-w-48 truncate text-meta text-navy-700">
                {user?.name}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className={`min-h-9 rounded-md px-3 text-meta font-medium ${outlineActionClass}`}
                >
                  Logg ut
                </button>
              </form>
            </div>
          </div>

          <DesktopNav groups={groups} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-32 sm:max-w-6xl sm:px-4 sm:py-8 sm:pb-8">
        {user ? (
          <ProfileCorner
            className="sm:hidden"
            hideOn={["/"]}
            initial={user.name.charAt(0).toUpperCase()}
            name={user.name}
            subtitle={roleLabels[user.role]}
            links={[
              { href: "/profil", label: "Profil" },
              { href: "/support", label: "Support" },
              { href: "/personvern", label: "Personvern" },
            ]}
          />
        ) : null}
        <PullToRefresh>{children}</PullToRefresh>
      </main>

      <footer className="hidden border-t border-line px-4 py-3 text-center sm:block">
        <Link
          href="/personvern"
          className="text-meta font-medium text-navy-700 hover:text-navy-900"
        >
          Personvern
        </Link>
      </footer>

      <MobileBottomNav showTimelist={showTimelist} />
      <OneSignalInit
        externalUserId={
          user && (user.role === "ADMIN" || user.role === "EMPLOYEE")
            ? user.id
            : null
        }
      />
    </div>
  );
}
