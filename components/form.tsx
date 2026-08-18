"use client";

import { useFormStatus } from "react-dom";

import { outlineActionClass, solidActionClass } from "@/lib/ui";

export { inputClass, adminBackLinkClass as backLinkClass } from "@/lib/ui";

export function Field({
  label,
  htmlFor,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-meta font-semibold text-ink">
        {label}
      </label>
      {children}
      {errors?.map((error) => (
        <p key={error} role="alert" className="text-meta font-semibold text-danger">
          {error}
        </p>
      ))}
    </div>
  );
}

// Fylt er reservert sidens ene primærhandling. Alt annet er outline.
const submitVariants = {
  solid: solidActionClass,
  outline: outlineActionClass,
} as const;

export function SubmitButton({
  children,
  pendingLabel = "Lagrer …",
  variant = "solid",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof submitVariants;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-12 rounded-xl px-4 text-meta font-semibold disabled:opacity-60 ${submitVariants[variant]}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Feedback({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="status" className="text-meta font-semibold text-ok">
      {message}
    </p>
  );
}