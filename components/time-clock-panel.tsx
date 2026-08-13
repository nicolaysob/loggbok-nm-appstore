"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cancelTimeClock,
  startExtraWorkClock,
  startPayrollClock,
  stopTimeClock,
} from "@/app/actions/time-clock";
import { FieldError } from "@/components/mobile-form";
import { formatHours } from "@/lib/format";
import { hoursFromClock } from "@/lib/time-clock";
import type { FormState } from "@/lib/validation";
import {
  cardStaticClass,
  noticeClass,
  outlineActionClass,
  solidActionClass,
  textareaClass,
} from "@/lib/ui";

export type OpenClockProp = {
  kind: "PAYROLL" | "EXTRA_WORK";
  customerId: string | null;
  customerName: string | null;
  startedAt: string;
} | null;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatDigitalElapsed(startedAt: Date, now: Date): string {
  const totalSeconds = Math.max(
    0,
    Math.floor((now.getTime() - startedAt.getTime()) / 1000),
  );
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
  "font-mono text-[3.25rem] leading-none tracking-tight tabular-nums sm:text-[3.5rem]";

const fullActionClass =
  "flex min-h-16 w-full items-center justify-center rounded-md " +
  "text-body font-semibold";

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
    <section className={`flex flex-col gap-5 px-5 py-6 ${cardStaticClass}`}>
      {foreign && openClock ? (
        <ForeignClockNotice openClock={openClock} />
      ) : active && openClock ? (
        <ActiveClock
          startedAtIso={openClock.startedAt}
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
      <p className={noticeClass}>
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
    <p className={noticeClass}>
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
        <p className="text-meta font-medium text-navy-700">
          {mode === "PAYROLL" ? "Lønnstimer" : "Ekstraarbeid"}
        </p>
        <p className={`${clockFaceClass} text-navy-700`} aria-hidden>
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
        className={`${fullActionClass} ${solidActionClass}`}
      >
        {pending ? "Starter …" : "Start"}
      </button>
      {message && (
        <p role="status" className="text-body font-medium text-navy-800">
          {message}
        </p>
      )}
    </div>
  );
}

function ActiveClock({
  startedAtIso,
  title,
  commentPlaceholder,
}: {
  startedAtIso: string;
  title: string;
  commentPlaceholder: string;
}) {
  const startedAt = new Date(startedAtIso);
  const [now, setNow] = useState(() => new Date());
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);
  const [hours, setHours] = useState(0.5);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    stopTimeClock,
    undefined,
  );
  const [cancelPending, startCancel] = useTransition();
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const router = useRouter();
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const saving = stoppedAt !== null;

  useEffect(() => {
    if (state?.message?.includes("lagret")) {
      router.refresh();
    }
  }, [state?.message, router]);

  useEffect(() => {
    if (stoppedAt) return;
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, [stoppedAt]);

  useEffect(() => {
    if (saving) commentRef.current?.focus();
  }, [saving]);

  const displayAt = stoppedAt ?? now;
  const digital = formatDigitalElapsed(startedAt, displayAt);

  function captureStopTime() {
    const end = new Date();
    setStoppedAt(end);
    setNow(end);
    setHours(Math.max(0.5, hoursFromClock(startedAt, end)));
  }

  function resumeClock() {
    setStoppedAt(null);
    setNow(new Date());
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p
          className={`text-meta font-medium ${
            saving ? "text-navy-700" : "text-brand"
          }`}
        >
          {saving ? `Stoppet · ${title}` : `Pågår · ${title}`}
        </p>
        <p
          className={`${clockFaceClass} text-navy-900`}
          aria-live="off"
          aria-label={saving ? `Stoppet på ${digital}` : `Pågår, ${digital}`}
        >
          {digital}
        </p>
      </div>

      {saving ? (
        <button
          type="button"
          disabled={pending}
          aria-label="Fortsett stempling"
          onClick={resumeClock}
          className={`${fullActionClass} ${outlineActionClass}`}
        >
          Fortsett
        </button>
      ) : (
        <button
          type="button"
          aria-label="Stopp stempling"
          onClick={captureStopTime}
          className={`${fullActionClass} bg-navy-900 text-white shadow-lift active:bg-navy-800`}
        >
          Stopp
        </button>
      )}

      {saving && (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="hours" value={hours} />
          <textarea
            ref={commentRef}
            id="clock-comment"
            name="comment"
            rows={2}
            className={textareaClass}
            placeholder={commentPlaceholder}
            aria-label="Kommentar"
          />
          <FieldError messages={state?.errors?.comment} />
          <FieldError messages={state?.errors?.hours} />

          {state?.message && (
            <p role="status" className="text-body font-semibold text-green-700">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`min-h-14 w-full rounded-md text-body font-semibold ${solidActionClass}`}
          >
            {pending ? "Lagrer …" : `Lagre ${formatHours(hours)} t`}
          </button>
        </form>
      )}

      <button
        type="button"
        disabled={cancelPending || pending}
        onClick={() => {
          if (!window.confirm("Avbryte stempling uten å lagre timer?")) {
            return;
          }
          setCancelMessage(null);
          startCancel(async () => {
            const result = await cancelTimeClock();
            if (result?.message && !result.message.includes("avbrutt")) {
              setCancelMessage(result.message);
            }
            router.refresh();
          });
        }}
        className="self-start text-meta font-medium text-navy-700 underline-offset-2 hover:underline"
      >
        {cancelPending ? "Avbryter …" : "Avbryt"}
      </button>
      {cancelMessage && (
        <p role="status" className="text-body font-medium text-navy-800">
          {cancelMessage}
        </p>
      )}
    </div>
  );
}
