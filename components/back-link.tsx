"use client";

import { useRouter } from "next/navigation";

export function BackLink({
  fallback = "/",
  className = "",
}: {
  fallback?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Tilbake"
      className={`flex size-12 items-center justify-center rounded-full text-ink-2 transition-colors active:bg-sunken active:text-ink ${className}`}
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallback);
      }}
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
  );
}
