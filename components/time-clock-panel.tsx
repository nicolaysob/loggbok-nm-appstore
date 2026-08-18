"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cancelTimeClock,
  pauseTimeClock,
  resumeTimeClock,
  startExtraWorkClock,
  startPayrollClock,
  stopTimeClock,
} from "@/app/actions/time-clock";
import { CommentField } from "@/components/comment-field";
import { FieldError } from "@/components/mobile-form";
import { formatHours } from "@/lib/format";
import { hoursFromClock, workedMs } from "@/lib/time-clock";
import type { FormState } from "@/lib/validation";

export type OpenClockProp = {
  kind: "PAYROLL" | "EXTRA_WORK";
  customerId: string | null;
  customerName: string | null;
  startedAt: string;
  /** ISO-tid mens en pause løper, ellers null */
  pausedAt: string | null;
  /** Sum av avsluttede pauser i millisekunder */
  pausedMs: number;
} | null;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function isActiveHere(
  openClock: OpenClockProp,
  mode: "PAYROLL" | "EXTRA_WORK",
  customerId?: string,
): boolean {
  if (!openClock) return false;
  if (mode === "PAYROLL") return openClock.kind === "PAYROLL";
  return (
    openClock.kind === "EXTRA_WORK" && openClock.customerId === customerId
  );
}

const clockFaceClass =
  "font-mono text-[3.5rem] leading-none tracking-tight tabular-nums sm:text-6xl";

const fullActionClass =
  "flex min-h-16 w-full items-center justify-center gap-2.5 rounded-2xl " +
  "text-body font-bold transition-colors";

const startActionClass =
  "bg-brand text-on-brand active:bg-brand-strong disabled:opacity-50";

/** Hvit knapp på mørk flate — teksten må være mørk i begge moduser. */
const stopActionClass = "bg-white text-hero active:bg-white/85";

export function TimeClockPanel({
  mode,
  customerId,
  openClock,
}: {
  mode: "PAYROLL" | "EXTRA_WORK";
  customerId?: string;
  openClock: OpenClockProp;
}) {
  const active = isActiveHere(openClock, mode, customerId);
  const foreign = openClock && !active;

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-hero px-5 py-7 text-white">
      {foreign && openClock ? (
        <ForeignClockNotice openClock={openClock} />
      ) : active && openClock ? (
        <ActiveClock
          startedAtIso={openClock.startedAt}
          pausedAtIso={openClock.pausedAt}
          pausedMs={openClock.pausedMs}
          title={
            mode === "PAYROLL"
              ? "Lønnstimer"
              : (openClock.customerName ?? "Ekstraarbeid")
          }
          commentPlaceholder={
            mode === "PAYROLL" ? "Hva jobbet du med?" : "Hva ble gjort?"
          }
        />
      ) : (
        <IdleClock mode={mode} customerId={customerId} />
      )}
    </section>
  );
}

function ForeignClockNotice({
  openClock,
}: {
  openClock: NonNullable<OpenClockProp>;
}) {
  if (openClock.kind === "PAYROLL") {
    return (
      <p className="text-body text-white/80">
        Du har en lønnsstempling i gang.{" "}
        <Link href="/timeliste" className="font-semibold underline">
          Gå til timelisten
        </Link>
        .
      </p>
    );
  }

  const href = openClock.customerId
    ? `/kunde/${openClock.customerId}/timer`
    : "/";
  const name = openClock.customerName ?? "en annen kunde";

  return (
    <p className="text-body text-white/80">
      Du har stempling på {name}.{" "}
      <Link href={href} className="font-semibold underline">
        Avslutt der først
      </Link>
      .
    </p>
  );
}

function IdleClock({
  mode,
  customerId,
}: {
  mode: "PAYROLL" | "EXTRA_WORK";
  customerId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow uppercase text-white/50">
          {mode === "PAYROLL" ? "Lønnstimer" : "Ekstraarbeid"}
        </p>
        <p className={`${clockFaceClass} text-white/35`} aria-hidden>
          00:00:00
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        aria-label={pending ? "Starter stempling" : "Start stempling"}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result =
              mode === "PAYROLL"
                ? await startPayrollClock()
                : await startExtraWorkClock(customerId!);
            if (result?.message && !result.message.includes("startet")) {
              setMessage(result.message);
            }
            router.refresh();
          });
        }}
        className={`${fullActionClass} ${startActionClass}`}
      >
        {pending ? (
          "Starter …"
        ) : (
          <>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5"
              fill="currentColor"
            >
              <path d="M8 5.6a1 1 0 0 1 1.52-.85l9 6.4a1 1 0 0 1 0 1.7l-9 6.4A1 1 0 0 1 8 18.4Z" />
            </svg>
            Start stempling
          </>
        )}
      </button>
      {message && (
        <p role="status" className="text-body font-medium text-white/80">
          {message}
        </p>
      )}
    </div>
  );
}

function ActiveClock({
  startedAtIso,
  pausedAtIso,
  pausedMs,
  title,
  commentPlaceholder,
}: {
  startedAtIso: string;
  pausedAtIso: string | null;
  pausedMs: number;
  title: string;
  commentPlaceholder: string;
}) {
  const startedAt = new Date(startedAtIso);
  const pausedAt = pausedAtIso ? new Date(pausedAtIso) : null;
  const isPaused = pausedAt !== null;

  const [now, setNow] = useState(() => new Date());
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);
  const [hours, setHours] = useState(0.5);
  const [comment, setComment] = useState("");
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    stopTimeClock,
    undefined,
  );
  const [pausePending, startPause] = useTransition();
  const [cancelPending, startCancel] = useTransition();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const router = useRouter();
  const saving = stoppedAt !== null;

  useEffect(() => {
    if (state?.message?.includes("lagret")) {
      router.refresh();
    }
  }, [state?.message, router]);

  useEffect(() => {
    if (stoppedAt) return;
    // Går også under pause, så pauseklokka teller
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, [stoppedAt]);

  const displayAt = stoppedAt ?? now;
  const pause = { pausedAt, pausedMs };
  const digital = formatDuration(workedMs(startedAt, pause, displayAt));
  const pauseDigital = pausedAt
    ? formatDuration(displayAt.getTime() - pausedAt.getTime())
    : null;
  const totalPauseDigital =
    pausedMs > 0 || pausedAt
      ? formatDuration(
          pausedMs +
            (pausedAt ? displayAt.getTime() - pausedAt.getTime() : 0),
        )
      : null;

  function captureStopTime() {
    const end = new Date();
    setStoppedAt(end);
    setNow(end);
    setHours(Math.max(0.5, hoursFromClock(startedAt, end, pause)));
  }

  function togglePause() {
    startPause(async () => {
      await (isPaused ? resumeTimeClock() : pauseTimeClock());
      router.refresh();
    });
  }

  const statusLabel = saving
    ? `Stoppet · ${title}`
    : isPaused
      ? `På pause · ${title}`
      : `Pågår · ${title}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p
          className={`flex items-center gap-2 text-eyebrow uppercase ${
            saving ? "text-white/50" : isPaused ? "text-warn" : "text-brand"
          }`}
        >
          {!saving && !isPaused ? (
            <span
              aria-hidden
              className="live-dot size-2 shrink-0 rounded-full bg-brand"
            />
          ) : null}
          {isPaused && !saving ? (
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-warn" />
          ) : null}
          {statusLabel}
        </p>
        <p
          className={`${clockFaceClass} ${isPaused && !saving ? "text-white/45" : "text-white"}`}
          aria-live="off"
          aria-label={
            saving
              ? `Stoppet på ${digital}`
              : isPaused
                ? `På pause, ${digital} arbeidet`
                : `Pågår, ${digital}`
          }
        >
          {digital}
        </p>
        {totalPauseDigital ? (
          <p className="text-meta text-white/50">
            {isPaused && !saving
              ? `Pause nå: ${pauseDigital} · totalt ${totalPauseDigital}`
              : `Pause trukket fra: ${totalPauseDigital}`}
          </p>
        ) : null}
      </div>

      {saving ? (
        <button
          type="button"
          disabled={pending}
          aria-label="Tilbake til stemplingen"
          onClick={() => {
            setStoppedAt(null);
            setNow(new Date());
          }}
          className={`${fullActionClass} border-[1.5px] border-white/30 text-white active:bg-white/10`}
        >
          Tilbake
        </button>
      ) : (
        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={pausePending}
            aria-label={isPaused ? "Fortsett stempling" : "Pause stempling"}
            onClick={togglePause}
            className={`${fullActionClass} flex-1 ${
              isPaused
                ? startActionClass
                : "border-[1.5px] border-white/30 text-white active:bg-white/10"
            }`}
          >
            {pausePending ? (
              "…"
            ) : isPaused ? (
              <>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-4.5"
                  fill="currentColor"
                >
                  <path d="M8 5.6a1 1 0 0 1 1.52-.85l9 6.4a1 1 0 0 1 0 1.7l-9 6.4A1 1 0 0 1 8 18.4Z" />
                </svg>
                Fortsett
              </>
            ) : (
              <>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-4.5"
                  fill="currentColor"
                >
                  <rect x="6.5" y="5.5" width="3.6" height="13" rx="1.3" />
                  <rect x="13.9" y="5.5" width="3.6" height="13" rx="1.3" />
                </svg>
                Pause
              </>
            )}
          </button>
          <button
            type="button"
            aria-label="Stopp stempling"
            onClick={captureStopTime}
            className={`${fullActionClass} flex-1 ${stopActionClass}`}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-4.5"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" rx="2.5" />
            </svg>
            Stopp
          </button>
        </div>
      )}

      {saving && (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="hours" value={hours} />
          <CommentField
            id="clock-comment"
            name="comment"
            value={comment}
            onChange={setComment}
            rows={3}
            placeholder={commentPlaceholder}
            ariaLabel="Kommentar"
          />
          <FieldError messages={state?.errors?.comment} />
          <FieldError messages={state?.errors?.hours} />

          {state?.message && (
            <p role="status" className="text-body font-semibold text-white">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`${fullActionClass} ${startActionClass}`}
          >
            {pending ? "Lagrer …" : `Lagre ${formatHours(hours)} t`}
          </button>
        </form>
      )}

      {/* Bekreftelse inne i appen. window.confirm er upålitelig i WebView-en
          appen kjører i, og gir små trykkflater med hansker. */}
      {confirmingCancel ? (
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5">
          <p className="text-body text-white">
            Slette stemplingen uten å lagre timer?
          </p>
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              disabled={cancelPending}
              onClick={() => {
                setCancelMessage(null);
                startCancel(async () => {
                  const result = await cancelTimeClock();
                  if (result?.message && !result.message.includes("avbrutt")) {
                    setCancelMessage(result.message);
                  }
                  setConfirmingCancel(false);
                  router.refresh();
                });
              }}
              className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-danger text-body font-bold text-white transition-colors active:opacity-85 disabled:opacity-50"
            >
              {cancelPending ? "Avbryter …" : "Ja, slett"}
            </button>
            <button
              type="button"
              disabled={cancelPending}
              onClick={() => setConfirmingCancel(false)}
              className="flex min-h-12 flex-1 items-center justify-center rounded-xl border-[1.5px] border-white/30 text-body font-bold text-white transition-colors active:bg-white/10"
            >
              Behold
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={cancelPending || pending}
          onClick={() => setConfirmingCancel(true)}
          className="min-h-11 self-start text-meta font-semibold text-white/45 underline-offset-4 hover:underline"
        >
          Avbryt stempling
        </button>
      )}
      {cancelMessage && (
        <p role="status" className="text-body font-medium text-white/80">
          {cancelMessage}
        </p>
      )}
    </div>
  );
}
