"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import {
  SettingsButton,
  SettingsGroup,
  SettingsLink,
} from "@/components/settings-list";

export type ProfileLink = { href: string; label: string };

export function ProfileMenu({
  initial,
  name,
  subtitle,
  links,
  inverted = false,
}: {
  initial: string;
  name: string;
  subtitle?: string;
  links: ProfileLink[];
  inverted?: boolean;
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
              className="profile-drawer-dim absolute inset-0 bg-hero/40"
              onClick={() => setOpen(false)}
            />
            <aside
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label={subtitle ? `${name}, ${subtitle}` : name}
              className="profile-drawer absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-hair bg-canvas pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center px-5 pb-2 pt-1">
                <button
                  type="button"
                  aria-label="Lukk meny"
                  onClick={() => setOpen(false)}
                  className="flex size-12 items-center justify-center text-ink"
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

              <Link
                href="/profil"
                onClick={() => setOpen(false)}
                className="mx-4 mb-5 flex items-center gap-3 rounded-2xl border border-hair bg-surface px-3 py-3 shadow-card active:bg-sunken"
              >
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-hero text-heading font-semibold text-white"
                >
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-heading font-semibold text-ink">
                    {name}
                  </p>
                  {subtitle ? (
                    <p className="truncate text-meta text-ink-2">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                <span aria-hidden className="text-heading text-ink-2">
                  ›
                </span>
              </Link>

              <nav className="flex flex-1 flex-col gap-4 px-4">
                <SettingsGroup>
                  {links.map((link) => (
                    <SettingsLink
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </SettingsGroup>
              </nav>

              <form action={logout} className="px-4 pt-2">
                <SettingsGroup>
                  <SettingsButton label="Logg ut" />
                </SettingsGroup>
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
        className={`flex size-12 shrink-0 items-center justify-center rounded-full text-heading ${
          inverted
            ? "border border-white/20 bg-white/15 text-white"
            : "bg-hero text-white"
        }`}
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
