"use client";

import { useFormStatus } from "react-dom";

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
      <label htmlFor={htmlFor} className="text-meta font-semibold text-navy-900">
        {label}
      </label>
      {children}
      {errors?.map((error) => (
        <p key={error} role="alert" className="text-meta font-semibold text-red-700">
          {error}
        </p>
      ))}
    </div>
  );
}

// Fylt er reservert sidens ene primærhandling. Alt annet er outline.
const submitVariants = {
  solid: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-line bg-white text-navy-900 hover:bg-navy-50",
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
      className={`rounded-md px-4 py-2 text-meta font-semibold disabled:opacity-60 ${submitVariants[variant]}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Feedback({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="status" className="text-meta font-semibold text-green-700">
      {message}
    </p>
  );
}