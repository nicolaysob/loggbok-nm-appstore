"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

export type ProfileLink = { href: string; label: string };

export function ProfileMenu({
  initial,
  name,
  subtitle,
  links,
}: {
  initial: string;
  name: string;
  subtitle?: string;
  links: ProfileLink[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sheet =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[200]">
            <button
              type="button"
              aria-label="Lukk meny"
              className="profile-drawer-dim absolute inset-0 bg-navy-900/40"
              onClick={() => setOpen(false)}
            />
            <aside
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label={subtitle ? `${name}, ${subtitle}` : name}
              className="profile-drawer absolute inset-y-0 left-0 flex w-[min(19rem,85vw)] flex-col rounded-r-[2rem] bg-page pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lift"
            >
              <div className="flex items-center justify-between px-5 pb-2 pt-1">
                <button
                  type="button"
                  aria-label="Lukk meny"
                  onClick={() => setOpen(false)}
                  className="flex size-12 items-center justify-center rounded-full bg-white text-navy-900 shadow-card"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M15 5 8 12l7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3 px-5 pb-8 pt-4">
                <span
                  aria-hidden
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-navy-900 text-heading font-bold text-white"
                >
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-display text-[1.35rem] font-bold text-navy-900">
                    {name.split(/\s+/)[0]}
                  </p>
                  {subtitle ? (
                    <p className="text-meta text-navy-700">{subtitle}</p>
                  ) : null}
                </div>
              </div>

              <nav className="flex flex-1 flex-col gap-1 px-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center rounded-md px-3 text-body font-medium text-navy-900 active:bg-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <form action={logout} className="px-7 pt-4">
                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center text-body font-semibold text-navy-800"
                >
                  Logg ut
                </button>
              </form>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Profil og innstillinger"
        onClick={() => setOpen(true)}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-heading font-bold text-white shadow-brand"
      >
        {initial}
      </button>
      {sheet}
    </>
  );
}

/** Boble øverst til høyre på undersider — forsiden har den i hilsenen. */
export function ProfileCorner({
  hideOn,
  className = "",
  initial,
  name,
  subtitle,
  links,
}: {
  hideOn: string[];
  className?: string;
  initial: string;
  name: string;
  subtitle?: string;
  links: ProfileLink[];
}) {
  const pathname = usePathname();
  if (hideOn.includes(pathname)) return null;

  return (
    <div className={`mb-4 flex justify-end ${className}`}>
      <ProfileMenu
        initial={initial}
        name={name}
        subtitle={subtitle}
        links={links}
      />
    </div>
  );
}
