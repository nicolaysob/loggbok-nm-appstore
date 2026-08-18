"use client";

import { useEffect, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import { ONESIGNAL_APP_ID } from "@/lib/onesignal-config";
import { A2HS_PROMPT_KEY } from "@/components/add-to-home-screen";
import { outlineActionClass, solidActionClass } from "@/lib/ui";

// localStorage — sessionStorage nullstilles når PWA lukkes på iPhone
const PROMPT_KEY = "onesignal-push-prompt-done";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
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

function isLocalOrigin(origin: string): boolean {
  return (
    origin.startsWith("http://localhost") ||
    origin.startsWith("https://localhost") ||
    origin.startsWith("http://127.0.0.1") ||
    origin.startsWith("https://127.0.0.1")
  );
}

function shouldAskForPush(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(PROMPT_KEY)) return false;
  // På mobil: la «legg til hjemskjerm» komme først
  if (
    isMobileBrowser() &&
    !isStandalone() &&
    !localStorage.getItem(A2HS_PROMPT_KEY)
  ) {
    return false;
  }
  // Allerede valgt i nettleseren — ikke mas
  if (typeof Notification !== "undefined" && Notification.permission !== "default") {
    return false;
  }
  return true;
}

/**
 * Initialiserer OneSignal Web SDK én gang i nettleseren.
 * react-onesignal er den sentrale, typede inngangen — ingen ekstra wrapper.
 *
 * Merk: Denne OneSignal-appen er konfigurert med Site URL =
 * https://loggbok-nm-lyart.vercel.app — init på localhost blir avvist
 * av SDK-et. Push testes derfor på produksjon (eller egen localhost-app).
 */
export function OneSignalInit({
  externalUserId,
}: {
  externalUserId?: string | null;
}) {
  const started = useRef(false);
  const [ready, setReady] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function init() {
      if (typeof window === "undefined") return;

      // Produksjons-appen godtar ikke localhost — ikke init, så unngår Qe-feil
      if (isLocalOrigin(window.location.origin)) {
        console.info(
          "OneSignal: hoppes over på localhost (Site URL er produksjon).",
        );
        return;
      }

      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        });
      } catch (error) {
        console.error("OneSignal init feilet:", error);
        return;
      }

      if (cancelled) return;
      setReady(true);

      if (shouldAskForPush()) {
        setShowDialog(true);
      }

      const onChange = () => {
        const id = OneSignal.User.PushSubscription.id;
        if (id) {
          console.log("OneSignal push subscription registered:", id);
        }
      };
      OneSignal.User.PushSubscription.addEventListener("change", onChange);
      onChange();
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Koble innlogget ansatt først når SDK er klar.
  // Kunder skal ikke OneSignal.login — det ville stjele push-abonnementet
  // hvis samme telefon brukes til både portal og internapp.
  useEffect(() => {
    if (!ready || !externalUserId) return;
    void OneSignal.login(externalUserId).catch((error) => {
      console.error("OneSignal login feilet:", error);
    });
  }, [ready, externalUserId]);

  function dismissPrompt() {
    localStorage.setItem(PROMPT_KEY, "1");
    setShowDialog(false);
  }

  // Ingen prompt uten innlogget ansatt (kundeportalen skal ikke spørre)
  if (!showDialog || !externalUserId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onesignal-dialog-title"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-hero/40 p-4 sm:items-center"
    >
      <div className="w-full max-w-md rounded-lg border border-hair bg-surface p-5 shadow-lift">
        <h2
          id="onesignal-dialog-title"
          className="text-heading text-ink"
        >
          Få varsel på telefonen?
        </h2>
        <p className="mt-2 text-body text-ink-2">
          Vi kan si ifra når kunden sender melding eller det legges inn et
          gjøremål.
        </p>
        <button
          type="button"
          className={`mt-5 min-h-14 w-full rounded-xl px-4 text-body font-semibold ${solidActionClass}`}
          onClick={() => {
            dismissPrompt();
            void OneSignal.Notifications.requestPermission().then(() => {
              if (externalUserId) {
                return OneSignal.login(externalUserId);
              }
            });
          }}
        >
          Tillat varsler
        </button>
        <button
          type="button"
          className={`mt-2 min-h-12 w-full rounded-xl px-4 text-meta font-semibold ${outlineActionClass}`}
          onClick={dismissPrompt}
        >
          Ikke nå
        </button>
      </div>
    </div>
  );
}
