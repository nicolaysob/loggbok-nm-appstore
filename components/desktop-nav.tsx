"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppNavGroup } from "@/components/mobile-nav";

function linkActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/kunde/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Kun desktop (sm+) — mobil bruker egen meny. */
export function DesktopNav({ groups }: { groups: AppNavGroup[] }) {
  const pathname = usePathname();
  const links = groups.flatMap((group) => group.links);

  return (
    <nav
      aria-label="Hovedmeny"
      className="hidden border-t border-white/10 sm:block"
    >
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5">
        {links.map((link) => {
          const active = linkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-meta font-semibold transition-colors ${
                active
                  ? "bg-brand text-on-brand"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
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
