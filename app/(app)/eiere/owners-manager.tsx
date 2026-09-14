"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createOwner, deleteOwner, updateOwner } from "@/app/actions/owners";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import { cardStaticClass, sectionHeadClass } from "@/lib/ui";
import type { FormState } from "@/lib/validation";

export type OwnerRow = {
  id: string;
  name: string;
  shortName: string | null;
  contactPerson: string | null;
  customerCount: number;
  hasPortalUser: boolean;
};

export function OwnersManager({ owners }: { owners: OwnerRow[] }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className={sectionHeadClass}>
          <span>Ny eier</span>
        </h2>
        <NewOwnerForm />
      </section>

      <section>
        <h2 className={sectionHeadClass}>
          <span>Eiere</span>
          {owners.length > 0 ? <span>{owners.length}</span> : null}
        </h2>

        {owners.length === 0 ? (
          <p className="rounded-2xl border border-hair bg-surface px-4 py-6 text-center text-body text-ink-3 shadow-card">
            Ingen eiere ennå. En eier binder flere kundekort til samme
            kontaktperson og gir én felles portalinnlogging.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {owners.map((owner) => (
              <OwnerCard key={owner.id} owner={owner} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function NewOwnerForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createOwner,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message?.includes("lagret")) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Field label="Navn" htmlFor="new-name" errors={state?.errors?.name}>
        <input
          id="new-name"
          name="name"
          required
          placeholder="AS Sande Meieri Handelslag"
          className={inputClass}
        />
      </Field>
      <Field label="Kortnavn — vises i felt" htmlFor="new-short">
        <input
          id="new-short"
          name="shortName"
          placeholder="Sande Meieri"
          className={inputClass}
        />
      </Field>
      <Field label="Kontaktperson" htmlFor="new-contact">
        <input id="new-contact" name="contactPerson" className={inputClass} />
      </Field>
      <Feedback message={state?.message} />
      <SubmitButton>Opprett eier</SubmitButton>
    </form>
  );
}

function OwnerCard({ owner }: { owner: OwnerRow }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(
    updateOwner.bind(null, owner.id),
    undefined,
  );
  const [removeState, removeAction] = useActionState<FormState, FormData>(
    async () => deleteOwner(owner.id),
    undefined,
  );

  return (
    <li className={`px-4 py-4 ${cardStaticClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-heading text-ink">{owner.name}</p>
          <p className="mt-1 text-meta text-ink-2">
            {owner.customerCount === 1
              ? "1 kundekort"
              : `${owner.customerCount} kundekort`}
            {owner.shortName ? ` · vises som «${owner.shortName}»` : ""}
            {owner.contactPerson ? ` · ${owner.contactPerson}` : ""}
          </p>
          {owner.hasPortalUser ? (
            <p className="mt-1.5 inline-flex min-h-7 items-center rounded-full bg-brand-soft px-2.5 text-micro font-bold text-brand">
              Har portalinnlogging
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="min-h-11 shrink-0 text-micro font-bold uppercase tracking-wide text-ink-3 transition-colors active:text-ink"
        >
          {open ? "Lukk" : "Endre"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 flex flex-col gap-4 border-t border-hair pt-4">
          <form action={formAction} className="flex flex-col gap-4">
            <Field
              label="Navn"
              htmlFor={`name-${owner.id}`}
              errors={state?.errors?.name}
            >
              <input
                id={`name-${owner.id}`}
                name="name"
                defaultValue={owner.name}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Kortnavn — vises i felt" htmlFor={`short-${owner.id}`}>
              <input
                id={`short-${owner.id}`}
                name="shortName"
                defaultValue={owner.shortName ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Kontaktperson" htmlFor={`contact-${owner.id}`}>
              <input
                id={`contact-${owner.id}`}
                name="contactPerson"
                defaultValue={owner.contactPerson ?? ""}
                className={inputClass}
              />
            </Field>
            <Feedback message={state?.message} />
            <SubmitButton>Lagre</SubmitButton>
          </form>

          <form action={removeAction}>
            <Feedback message={removeState?.message} />
            <button
              type="submit"
              className="min-h-12 w-full rounded-xl border-[1.5px] border-danger/35 bg-danger-soft text-meta font-bold text-danger transition-colors disabled:opacity-50"
            >
              Slett eier
            </button>
            <p className="mt-2 text-micro text-ink-3">
              Kundekortene blir stående — de mister bare koblingen.
            </p>
          </form>
        </div>
      ) : null}
    </li>
  );
}
