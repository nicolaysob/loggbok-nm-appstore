"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { workedMs } from "@/lib/time-clock";

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

export function HomeClockBanner({
  href,
  label,
  startedAt,
  pausedAt,
  pausedMs,
}: {
  href: string;
  label: string;
  startedAt: string;
  pausedAt: string | null;
  pausedMs: number;
}) {
  const started = new Date(startedAt);
  const paused = pausedAt ? new Date(pausedAt) : null;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <Link
      href={href}
      className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 text-white active:bg-white/15"
    >
      <span
        className={`size-2.5 shrink-0 rounded-full ${
          paused
            ? "bg-warn"
            : "live-dot bg-brand shadow-[0_0_0_4px] shadow-brand/25"
        }`}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-micro font-semibold text-white/55">
          {paused ? "På pause" : "Stemplet inn"}
        </span>
        <span className="mt-0.5 block truncate text-heading">{label}</span>
      </span>
      <span
        className={`shrink-0 font-mono text-heading tabular-nums ${
          paused ? "text-white/50" : ""
        }`}
      >
        {formatElapsed(workedMs(started, { pausedAt: paused, pausedMs }, now))}
      </span>
    </Link>
  );
}
