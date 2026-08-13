"use client";

import { useActionState } from "react";
import { updateOwnName, updateOwnPassword } from "@/app/actions/profile";
import type { FormState } from "@/lib/validation";
import { FieldError } from "@/components/mobile-form";
import {
  cardStaticClass,
  inputClass,
  labelClass,
  solidActionClass,
} from "@/lib/ui";

const fieldClass = `${inputClass} min-h-14`;

export function ProfileForms({
  name,
  username,
}: {
  name: string;
  username: string;
}) {
  const [nameState, nameAction, namePending] = useActionState<
    FormState,
    FormData
  >(updateOwnName, undefined);
  const [passwordState, passwordAction, passwordPending] = useActionState<
    FormState,
    FormData
  >(updateOwnPassword, undefined);

  return (
    <div className="flex flex-col gap-6">
      <section className={`flex flex-col gap-5 p-5 ${cardStaticClass}`}>
        <div className="flex flex-col gap-1">
          <h2 className="text-heading text-navy-900">Konto</h2>
          <p className="text-meta text-navy-700">Brukernavn: {username}</p>
        </div>
        <form action={nameAction} className="flex flex-col gap-3">
          <label htmlFor="name" className={labelClass}>
            Navn
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={name}
            autoComplete="name"
            className={fieldClass}
          />
          <FieldError messages={nameState?.errors?.name} />
          {nameState?.message ? (
            <p role="status" className="text-body font-semibold text-green-700">
              {nameState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={namePending}
            className={`min-h-16 w-full rounded-md text-body font-semibold ${solidActionClass}`}
          >
            {namePending ? "Lagrer …" : "Lagre navn"}
          </button>
        </form>
      </section>

      <section className={`flex flex-col gap-5 p-5 ${cardStaticClass}`}>
        <h2 className="text-heading text-navy-900">Bytt passord</h2>
        <form action={passwordAction} className="flex flex-col gap-3">
          <label htmlFor="currentPassword" className={labelClass}>
            Nåværende passord
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={fieldClass}
          />
          <FieldError messages={passwordState?.errors?.currentPassword} />

          <label htmlFor="password" className={labelClass}>
            Nytt passord
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className={fieldClass}
          />
          <FieldError messages={passwordState?.errors?.password} />

          <label htmlFor="confirmPassword" className={labelClass}>
            Gjenta nytt passord
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={fieldClass}
          />
          <FieldError messages={passwordState?.errors?.confirmPassword} />

          {passwordState?.message ? (
            <p role="status" className="text-body font-semibold text-green-700">
              {passwordState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={passwordPending}
            className={`min-h-16 w-full rounded-md text-body font-semibold ${solidActionClass}`}
          >
            {passwordPending ? "Lagrer …" : "Bytt passord"}
          </button>
        </form>
      </section>
    </div>
  );
}
