"use client";

import { useEffect, useState } from "react";
import { outlineActionClass, solidActionClass } from "@/lib/ui";

/** Delt nøkkel — OneSignal venter til denne er satt på mobil. */
export const A2HS_PROMPT_KEY = "a2hs-prompt-done";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

function isMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 900px)").matches;
  const ua = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return ua || (coarse && narrow);
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return true;
  // iPadOS kan rapportere seg som Mac
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Viser hvordan man legger appen på hjemskjermen — kun mobil nettleser,
 * ikke når den allerede er åpnet som PWA.
 */
export function AddToHomeScreenPrompt() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(true);

  useEffect(() => {
    if (isStandalone()) return;
    if (!isMobileBrowser()) return;
    if (localStorage.getItem(A2HS_PROMPT_KEY)) return;

    setIos(isIos());
    // Kort pause så siden rekker å tegne før dialogen
    const timer = window.setTimeout(() => setShow(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(A2HS_PROMPT_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a2hs-dialog-title"
      className="fixed inset-0 z-[110] flex items-end justify-center bg-navy-900/40 p-4 sm:items-center"
    >
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-lift">
        <h2 id="a2hs-dialog-title" className="text-heading text-navy-900">
          Legg til på hjemskjermen
        </h2>
        <p className="mt-2 text-body text-navy-700">
          Da åpner dere appen som et ikon — raskere, og varsler fungerer bedre.
        </p>

        {ios ? (
          <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-body text-navy-900">
            <li>
              Trykk på <span className="font-semibold">prikkene</span>{" "}
              <span className="font-semibold">⋯</span>
            </li>
            <li>
              Trykk på <span className="font-semibold">Del</span>
            </li>
            <li>
              Trykk på <span className="font-semibold">Vis mer</span>
            </li>
            <li>
              Velg{" "}
              <span className="font-semibold">Legg til på Hjem-skjerm</span>
            </li>
          </ol>
        ) : (
          <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-body text-navy-900">
            <li>
              Trykk på menyen <span className="font-semibold">⋮</span> i
              nettleseren
            </li>
            <li>
              Velg <span className="font-semibold">Installer app</span> eller{" "}
              <span className="font-semibold">Legg til på startskjermen</span>
            </li>
            <li>
              Bekreft med <span className="font-semibold">Installer</span> /
              Legg til
            </li>
          </ol>
        )}

        <button
          type="button"
          className={`mt-5 min-h-14 w-full rounded-md px-4 text-body font-semibold ${solidActionClass}`}
          onClick={dismiss}
        >
          Skjønner
        </button>
        <button
          type="button"
          className={`mt-2 min-h-12 w-full rounded-md px-4 text-meta font-semibold ${outlineActionClass}`}
          onClick={dismiss}
        >
          Ikke nå
        </button>
      </div>
    </div>
  );
}
