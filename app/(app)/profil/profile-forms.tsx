"use client";

import { useActionState } from "react";
import Link from "next/link";
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
    <div className="flex flex-col gap-5">
      <section className={`flex flex-col gap-5 p-5 ${cardStaticClass}`}>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-heading text-ink">Konto</h2>
          <p className="text-meta text-ink-2">
            Dette navnet vises til kolleger i loggen.
          </p>
        </div>

        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-hair pb-3">
          <span className="text-meta font-medium text-ink-2">
            Brukernavn
          </span>
          <span className="truncate text-body font-medium text-ink">
            {username || "—"}
          </span>
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
            <p role="status" className="text-body font-semibold text-ok">
              {nameState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={namePending}
            className={`min-h-14 w-full rounded-xl text-body font-semibold ${solidActionClass}`}
          >
            {namePending ? "Lagrer …" : "Lagre navn"}
          </button>
        </form>
      </section>

      <section className={`flex flex-col gap-5 p-5 ${cardStaticClass}`}>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-heading text-ink">Sikkerhet</h2>
          <p className="text-meta text-ink-2">
            Bytt passord hvis noen andre kan ha sett det.
          </p>
        </div>
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
            <p role="status" className="text-body font-semibold text-ok">
              {passwordState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={passwordPending}
            className={`min-h-14 w-full rounded-xl text-body font-semibold ${solidActionClass}`}
          >
            {passwordPending ? "Lagrer …" : "Bytt passord"}
          </button>
        </form>
      </section>

      <div className="flex flex-col items-center gap-3 pb-2 pt-1">
        <Link href="/support" className="text-meta font-medium text-ink-2">
          Support
        </Link>
        <Link href="/personvern" className="text-meta font-medium text-ink-2">
          Personvern
        </Link>
      </div>
    </div>
  );
}
