"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const THRESHOLD = 70;
const MAX_PULL = 96;

/**
 * Lett pull-to-refresh: bare router.refresh() (ingen full reload).
 * Fungerer når man er øverst på siden — typisk PWA på telefon.
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [pending, startTransition] = useTransition();
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    function atTop() {
      return window.scrollY <= 1;
    }

    function onStart(event: TouchEvent) {
      if (pending) return;
      if (!atTop()) {
        startY.current = null;
        return;
      }
      startY.current = event.touches[0]?.clientY ?? null;
    }

    function onMove(event: TouchEvent) {
      if (startY.current === null || pending) return;
      if (!atTop()) {
        startY.current = null;
        pullRef.current = 0;
        setPull(0);
        return;
      }

      const y = event.touches[0]?.clientY ?? startY.current;
      const delta = Math.max(0, y - startY.current);
      const next = Math.min(delta * 0.4, MAX_PULL);
      pullRef.current = next;
      setPull(next);
    }

    function onEnd() {
      if (startY.current === null) return;
      const distance = pullRef.current;
      startY.current = null;
      pullRef.current = 0;
      setPull(0);

      if (distance < THRESHOLD || pending) return;

      startTransition(() => {
        router.refresh();
      });
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);

    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [pending, router]);

  const showHint = pull > 12 || pending;
  const ready = pull >= THRESHOLD;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        aria-live="polite"
        className={`pointer-events-none sticky top-0 z-20 flex justify-center transition-opacity ${
          showHint ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: showHint ? Math.max(pull, pending ? 36 : 0) : 0 }}
      >
        <p className="pt-2 text-meta font-semibold text-navy-700">
          {pending
            ? "Oppdaterer …"
            : ready
              ? "Slipp for å oppdatere"
              : "Dra for å oppdatere"}
        </p>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col will-change-transform"
        style={{
          transform: pull > 0 ? `translateY(${pull}px)` : undefined,
          transition: pull === 0 ? "transform 0.2s ease-out" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
