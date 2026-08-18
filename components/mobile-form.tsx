"use client";

import { actionSize, cardStaticClass, solidActionClass } from "@/lib/ui";

export {
  actionSize,
  badgeClass,
  cardClass,
  cardStaticClass,
  eyebrowClass,
  sectionHeadClass,
  solidActionClass,
  inkActionClass,
  outlineActionClass,
  textareaClass,
  labelClass,
  backLinkClass,
  noticeClass,
} from "@/lib/ui";

const stepButtonClass =
  "flex size-16 shrink-0 items-center justify-center rounded-2xl " +
  "border-[1.5px] border-edge bg-surface text-display text-ink " +
  "transition-colors active:bg-sunken disabled:opacity-35";

export function FieldError({ messages }: { messages?: string[] }) {
  return (
    <>
      {messages?.map((message) => (
        <p
          key={message}
          role="alert"
          className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-meta font-bold text-danger"
        >
          {message}
        </p>
      ))}
    </>
  );
}

export function StickySubmit({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky bottom-24 -mx-5 bg-canvas/85 px-5 py-3 backdrop-blur-lg sm:bottom-0 sm:-mx-4 sm:px-4">
        <button
          type="submit"
          disabled={pending}
          className={`${actionSize} min-h-[3.625rem] ${solidActionClass}`}
        >
          {pending ? "Lagrer …" : children}
        </button>
      </div>
      {/* Knappen henger 6rem over bunnen for å klarere fanelinja. Uten denne
          avstandsholderen kan ikke feltet over scrolles fri av knappen. */}
      <div aria-hidden className="h-24 shrink-0 sm:hidden" />
    </>
  );
}

export function HoursStepper({
  hours,
  onChange,
  step = 0.5,
  max = 24,
  format,
}: {
  hours: number;
  onChange: (value: number) => void;
  step?: number;
  max?: number;
  format: (value: number) => string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-3 py-3 ${cardStaticClass}`}
    >
      <button
        type="button"
        aria-label="Færre timer"
        disabled={hours <= 0}
        onClick={() => onChange(Math.max(0, hours - step))}
        className={stepButtonClass}
      >
        −
      </button>

      <output className="font-mono text-display tabular-nums text-ink">
        {format(hours)}
        <span className="ml-1 text-title text-ink-3">t</span>
      </output>

      <button
        type="button"
        aria-label="Flere timer"
        disabled={hours >= max}
        onClick={() => onChange(Math.min(max, hours + step))}
        className={stepButtonClass}
      >
        +
      </button>
    </div>
  );
}
