"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { inputClass, solidActionClass } from "@/lib/ui";

const fieldClass = `${inputClass} min-h-14`;

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="text-meta font-semibold text-navy-900"
        >
          Brukernavn
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-meta font-semibold text-navy-900"
        >
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-body font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`mt-1 min-h-14 w-full rounded-md text-body font-semibold ${solidActionClass}`}
      >
        {pending ? "Logger inn …" : "Logg inn"}
      </button>
    </form>
  );
}
