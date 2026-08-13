"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppNavGroup } from "@/components/mobile-nav";

function linkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Kun desktop (sm+) — mobil bruker egen meny. */
export function DesktopNav({ groups }: { groups: AppNavGroup[] }) {
  const pathname = usePathname();
  const links = groups.flatMap((group) => group.links);

  return (
    <nav
      aria-label="Hovedmeny"
      className="hidden border-t border-line sm:block"
    >
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5">
        {links.map((link) => {
          const active = linkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-meta font-medium transition-colors ${
                active
                  ? "bg-navy-50 text-navy-900"
                  : "text-navy-700 hover:bg-navy-50/80 hover:text-navy-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
