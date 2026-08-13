"use client";

import { cardStaticClass, solidActionClass } from "@/lib/ui";

export {
  cardClass,
  cardStaticClass,
  solidActionClass,
  outlineActionClass,
  textareaClass,
  labelClass,
  backLinkClass,
  noticeClass,
} from "@/lib/ui";

const stepButtonClass =
  "flex size-14 shrink-0 items-center justify-center rounded-md border " +
  "border-line bg-white text-display text-navy-900 " +
  "active:bg-navy-50 disabled:opacity-40";

export function FieldError({ messages }: { messages?: string[] }) {
  return (
    <>
      {messages?.map((message) => (
        <p
          key={message}
          role="alert"
          className="text-body font-medium text-red-700"
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
    <div className="sticky bottom-20 -mx-4 border-t border-line bg-page/85 px-4 py-3 backdrop-blur-md sm:bottom-0">
      <button
        type="submit"
        disabled={pending}
        className={`min-h-14 w-full rounded-md text-body font-semibold ${solidActionClass}`}
      >
        {pending ? "Lagrer …" : children}
      </button>
    </div>
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
    <div className={`flex items-center justify-between gap-4 px-3 py-3 ${cardStaticClass}`}>
      <button
        type="button"
        aria-label="Færre timer"
        disabled={hours <= 0}
        onClick={() => onChange(Math.max(0, hours - step))}
        className={stepButtonClass}
      >
        −
      </button>

      <output className="font-mono text-display tabular-nums text-navy-900">
        {format(hours)}
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
