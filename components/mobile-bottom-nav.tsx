"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isLinkActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
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

export function MobileBottomNav({ showTimelist }: { showTimelist: boolean }) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { href: "/", label: "Hjem", icon: "home" },
    { href: "/kalender", label: "Kalender", icon: "calendar" },
    ...(showTimelist
      ? [{ href: "/timeliste", label: "Timer", icon: "clock" as const }]
      : []),
    { href: "/mer", label: "Mer", icon: "more" },
  ];

  return (
    <nav
      aria-label="Hovedmeny"
      className="fixed inset-x-0 bottom-0 z-[110] px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] sm:hidden"
    >
      <div className="mx-auto flex max-w-md items-center rounded-[1.75rem] bg-white px-2 py-2 shadow-soft">
        {tabs.map((tab) => {
          const active = isLinkActive(tab.href, pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 touch-manipulation ${
                active ? "text-brand" : "text-navy-700 active:bg-navy-50"
              }`}
            >
              <TabIcon name={tab.icon} className="size-6" />
              <span className="text-[0.6875rem] font-semibold leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
