"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { actionSize, inputClass, labelClass, solidActionClass } from "@/lib/ui";

const fieldClass = `${inputClass} min-h-14`;

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className={labelClass}>
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
          className={`${fieldClass} min-h-14`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`${fieldClass} min-h-14`}
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl bg-danger-soft px-3.5 py-3 text-meta font-bold text-danger"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`mt-1 min-h-16 ${actionSize} ${solidActionClass}`}
      >
        {pending ? "Logger inn …" : "Logg inn"}
      </button>
    </form>
  );
}
