"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isLinkActive(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/kunde/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 8v4.5l3 1.5" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </svg>
  );
}

type Tab = {
  href: string;
  label: string;
  icon: "home" | "calendar" | "clock" | "more";
};

function TabIcon({
  name,
  className,
}: {
  name: Tab["icon"];
  className?: string;
}) {
  if (name === "home") return <HomeIcon className={className} />;
  if (name === "calendar") return <CalendarIcon className={className} />;
  if (name === "clock") return <ClockIcon className={className} />;
  return <MoreIcon className={className} />;
}

export function MobileBottomNav({
  showTimelist,
  showCalendar,
}: {
  showTimelist: boolean;
  showCalendar: boolean;
}) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { href: "/", label: "Hjem", icon: "home" },
    ...(showCalendar
      ? [{ href: "/kalender", label: "Kalender", icon: "calendar" as const }]
      : []),
    ...(showTimelist
      ? [{ href: "/timeliste", label: "Timer", icon: "clock" as const }]
      : []),
    { href: "/mer", label: "Mer", icon: "more" },
  ];

  return (
    <nav
      aria-label="Hovedmeny"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden"
    >
      {/* Bakgrunnen tones ut mot sidebakgrunnen så innhold som scroller
          forbi ikke krasjer med menyen. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t from-canvas from-30% to-transparent"
      />
      <div className="pointer-events-auto mx-auto flex max-w-lg items-stretch gap-1.5 rounded-[1.375rem] bg-hero p-1.5 shadow-lift">
        {tabs.map((tab) => {
          const active = isLinkActive(tab.href, pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl transition-colors ${
                active
                  ? "bg-brand text-on-brand"
                  : "text-white/55 active:bg-white/10 active:text-white"
              }`}
            >
              <TabIcon name={tab.icon} className="size-6" />
              <span className="text-micro font-bold leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
