import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireCustomer } from "@/lib/dal";
import { BrandIcon } from "@/components/brand";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { outlineActionClass } from "@/lib/ui";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCustomer();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4">
          <Link
            href="/portal"
            className="flex min-w-0 items-center gap-2.5"
            aria-label="Kundeportal hjem"
          >
            <BrandIcon size={28} className="size-7" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[1.05rem] font-semibold tracking-tight text-navy-900">
                N&amp;M
              </span>
              <span className="truncate text-[0.7rem] font-medium text-navy-700">
                Kundeportal
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden max-w-36 truncate text-meta text-navy-700 sm:inline">
              {user.name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className={`min-h-10 rounded-md px-3 text-meta font-medium ${outlineActionClass}`}
              >
                Logg ut
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        <PullToRefresh>{children}</PullToRefresh>
      </main>

      <footer className="border-t border-line px-4 py-3 text-center">
        <Link
          href="/personvern"
          className="text-meta font-medium text-navy-700 hover:text-navy-900"
        >
          Personvern
        </Link>
      </footer>
    </div>
  );
}
