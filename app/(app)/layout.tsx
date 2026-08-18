import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { staffAccess } from "@/lib/access";
import { BrandIcon } from "@/components/brand";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { OneSignalInit } from "@/components/onesignal-init";
import type { AppNavGroup } from "@/components/mobile-nav";
import { PullToRefresh } from "@/components/pull-to-refresh";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (user?.role === "CUSTOMER") redirect("/portal");

  const isAdmin = user?.role === "ADMIN";
  const access = user ? staffAccess(user) : staffAccess({ role: "EMPLOYEE" });
  const showTimelist = Boolean(
    !isAdmin && user?.payType === "HOURLY" && access.hours,
  );
  const showCalendar = Boolean(isAdmin || access.calendar);

  const groups: AppNavGroup[] = [
    {
      links: [
        { href: "/", label: "Hjem" },
        ...(showCalendar ? [{ href: "/kalender", label: "Kalender" }] : []),
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
      <header className="sticky top-0 z-30 hidden bg-hero sm:block">
        <div className="relative mx-auto w-full max-w-5xl sm:max-w-6xl">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <Link
              href="/"
              className="flex min-h-10 min-w-0 items-center gap-2.5"
              aria-label="Loggbok hjem"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white">
                <BrandIcon size={22} className="size-5.5" />
              </span>
              <span className="truncate text-meta font-bold text-white">
                Loggbok
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-3">
              <span className="max-w-48 truncate text-meta text-white/70">
                {user?.name}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="min-h-9 rounded-full border border-white/20 px-3.5 text-meta font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Logg ut
                </button>
              </form>
            </div>
          </div>

          <DesktopNav groups={groups} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-36 sm:max-w-6xl sm:px-4 sm:py-8 sm:pb-8">
        <PullToRefresh>{children}</PullToRefresh>
      </main>

      <footer className="hidden border-t border-hair px-4 py-3 text-center sm:block">
        <Link
          href="/personvern"
          className="text-meta font-medium text-ink-2 hover:text-ink"
        >
          Personvern
        </Link>
      </footer>

      <MobileBottomNav showTimelist={showTimelist} showCalendar={showCalendar} />
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
