"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { PayType, Role } from "@/generated/prisma/enums";
import {
  createUser,
  deleteUser,
  resetUserPassword,
  setUserAccess,
  setUserActive,
  setUserPayType,
  setUserPortalTarget,
  setUserRole,
} from "@/app/actions/users";
import {
  capabilityLabels,
  STAFF_CAPABILITIES,
  type AccessFlags,
  type StaffCapability,
} from "@/lib/access";
import {
  payTypeLabels,
  payTypeOptions,
  roleLabels,
  staffRoleOptions,
} from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import { outlineActionClass, solidActionClass } from "@/lib/ui";

export type CustomerOption = { id: string; name: string };
export type OwnerOption = { id: string; name: string };

export type UserRow = {
  id: string;
  name: string;
  username: string;
  role: Role;
  payType: PayType;
  active: boolean;
  customerId: string | null;
  ownerId: string | null;
  customerName: string | null;
  ownerName: string | null;
  isSelf: boolean;
} & AccessFlags;

/**
 * Ett felt, to slags mål. Verdien bærer med seg hva den peker på, slik at
 * skjemaet slipper to lister som utelukker hverandre.
 */
function PortalTargetSelect({
  id,
  customers,
  owners,
  defaultValue = "",
}: {
  id: string;
  customers: CustomerOption[];
  owners: OwnerOption[];
  defaultValue?: string;
}) {
  return (
    <select
      id={id}
      name="portalTarget"
      required
      defaultValue={defaultValue}
      className={inputClass}
    >
      <option value="" disabled>
        Velg sted eller eier
      </option>
      {owners.length > 0 ? (
        <optgroup label="Eiere — ser alle sine steder">
          {owners.map((owner) => (
            <option key={owner.id} value={`owner:${owner.id}`}>
              {owner.name}
            </option>
          ))}
        </optgroup>
      ) : null}
      <optgroup label="Enkeltsteder">
        {customers.map((customer) => (
          <option key={customer.id} value={`customer:${customer.id}`}>
            {customer.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

export function UsersManager({
  users,
  customers,
  owners,
}: {
  users: UserRow[];
  customers: CustomerOption[];
  owners: OwnerOption[];
}) {
  const staff = users.filter((user) => user.role !== "CUSTOMER");
  const customerUsers = users.filter((user) => user.role === "CUSTOMER");

  return (
    <div className="flex flex-col gap-8">
      <CreateUserForm customers={customers} owners={owners} />

      <section className="flex flex-col gap-3">
        <h2 className="text-heading text-ink">Ansatte</h2>
        {staff.length === 0 ? (
          <p className="rounded-2xl border border-hair bg-surface px-5 py-5 text-body text-ink-2">
            Ingen ansatte.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {staff.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                customers={customers}
                owners={owners}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading text-ink">Kunder</h2>
        {customerUsers.length === 0 ? (
          <p className="rounded-2xl border border-hair bg-surface px-5 py-5 text-body text-ink-2">
            Ingen kundekontoer.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {customerUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                customers={customers}
                owners={owners}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PortalTargetForm({
  user,
  customers,
  owners,
}: {
  user: UserRow;
  customers: CustomerOption[];
  owners: OwnerOption[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    setUserPortalTarget.bind(null, user.id),
    undefined,
  );

  const current = user.ownerId
    ? `owner:${user.ownerId}`
    : user.customerId
      ? `customer:${user.customerId}`
      : "";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field
        label="Gir tilgang til"
        htmlFor={`portalTarget-${user.id}`}
        errors={state?.errors?.portalTarget}
      >
        <PortalTargetSelect
          id={`portalTarget-${user.id}`}
          customers={customers}
          owners={owners}
          defaultValue={current}
        />
      </Field>
      <p className="text-micro text-ink-3">
        {user.ownerName
          ? `Ser nå alle stedene under ${user.ownerName}.`
          : "Velger du en eier, ser kontoen alle stedene under eieren. Brukernavn og passord er de samme som før."}
      </p>
      <div className="flex items-center gap-3">
        <SubmitButton variant="outline">Flytt tilgangen</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}

function UserCard({
  user,
  customers,
  owners,
}: {
  user: UserRow;
  customers: CustomerOption[];
  owners: OwnerOption[];
}) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteState, deleteAction] = useActionState<FormState, FormData>(
    async (_prev) => deleteUser(user.id),
    undefined,
  );

  return (
    <li
      className={`rounded-2xl border border-hair bg-surface ${
        user.active ? "" : "opacity-70"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left active:bg-sunken"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-heading text-ink">
            {user.name}
            {user.isSelf && (
              <span className="ml-2 text-meta font-medium text-ink-2">
                (deg)
              </span>
            )}
          </span>
          <span className="block text-meta tabular-nums text-ink-2">
            {user.username}
            {user.role === "CUSTOMER"
              ? user.ownerName
                ? ` · ${user.ownerName} — alle steder`
                : user.customerName
                  ? ` · ${user.customerName}`
                  : ""
              : ` · ${payTypeLabels[user.payType]}`}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-meta font-semibold ${
            user.role === "ADMIN"
              ? "bg-brand/10 text-brand-strong"
              : user.role === "CUSTOMER"
                ? "bg-sunken text-ink"
                : "bg-sunken text-ink-2"
          }`}
        >
          {roleLabels[user.role]}
          {!user.active && " · av"}
        </span>
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sunken"
        >
          {open ? "▾" : "›"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 px-4 py-4">
          {user.role !== "CUSTOMER" && (
            <>
              <p className="text-meta font-semibold text-ink-2">Rolle</p>
              <div className="flex flex-wrap gap-2">
                {staffRoleOptions.map(([role, label]) => (
                  <form
                    key={role}
                    action={setUserRole.bind(null, user.id, role)}
                  >
                    <button
                      type="submit"
                      disabled={user.role === role}
                      className={`min-h-12 rounded-xl px-4 text-meta font-semibold disabled:opacity-40 ${
                        user.role === role
                          ? solidActionClass
                          : outlineActionClass
                      }`}
                    >
                      {label}
                    </button>
                  </form>
                ))}
              </div>

              <p className="text-meta font-semibold text-ink-2">Lønn</p>
              <div className="flex flex-wrap gap-2">
                {payTypeOptions.map(([payType, label]) => (
                  <form
                    key={payType}
                    action={setUserPayType.bind(null, user.id, payType)}
                  >
                    <button
                      type="submit"
                      disabled={user.payType === payType}
                      className={`min-h-12 rounded-xl px-4 text-meta font-semibold disabled:opacity-40 ${
                        user.payType === payType
                          ? solidActionClass
                          : outlineActionClass
                      }`}
                    >
                      {label}
                    </button>
                  </form>
                ))}
              </div>

              {user.role === "EMPLOYEE" ? (
                <AccessToggles user={user} />
              ) : null}
            </>
          )}

          {user.role === "CUSTOMER" && (
            <PortalTargetForm
              user={user}
              customers={customers}
              owners={owners}
            />
          )}

          {!user.isSelf && (
            <form action={setUserActive.bind(null, user.id, !user.active)}>
              <button
                type="submit"
                className={`min-h-12 w-full rounded-xl px-4 text-meta font-semibold ${outlineActionClass}`}
              >
                {user.active ? "Deaktiver" : "Aktiver"}
              </button>
            </form>
          )}

          <ResetPasswordForm userId={user.id} />

          {/*
            Bekreftelsen ligger inne i appen. window.confirm er upålitelig i
            WebView-en appen kjører i — der gjorde knappen ingenting.
          */}
          {!user.isSelf && (
            <form action={deleteAction} className="flex flex-col gap-2">
              {confirmingDelete ? (
                <>
                  <p className="text-meta text-ink-2">
                    Slette «{user.name}» for godt? Dette kan ikke angres.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="min-h-12 flex-1 rounded-xl bg-danger px-4 text-meta font-bold text-white active:opacity-85"
                    >
                      Ja, slett
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="min-h-12 flex-1 rounded-xl border-[1.5px] border-edge px-4 text-meta font-semibold text-ink active:bg-sunken"
                    >
                      Behold
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="min-h-12 w-full rounded-2xl bg-surface px-4 text-meta font-semibold text-danger active:bg-danger-soft"
                >
                  Slett bruker
                </button>
              )}
              <Feedback message={deleteState?.message} />
            </form>
          )}
        </div>
      )}
    </li>
  );
}

function CreateUserForm({
  customers,
  owners,
}: {
  customers: CustomerOption[];
  owners: OwnerOption[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createUser,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<Role>("EMPLOYEE");

  useEffect(() => {
    if (state?.message) {
      formRef.current?.reset();
      setRole("EMPLOYEE");
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex max-w-lg flex-col gap-3 rounded-2xl border border-hair bg-surface p-5"
    >
      <p className="text-heading">Ny bruker</p>

      <Field label="Navn" htmlFor="name" errors={state?.errors?.name}>
        <input id="name" name="name" required className={inputClass} />
      </Field>

      <Field
        label="Brukernavn"
        htmlFor="username"
        errors={state?.errors?.username}
      >
        <input
          id="username"
          name="username"
          required
          autoCapitalize="none"
          autoCorrect="off"
          className={inputClass}
        />
      </Field>

      <Field
        label="Passord"
        htmlFor="password"
        errors={state?.errors?.password}
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={4}
          className={inputClass}
        />
      </Field>

      <Field label="Rolle" htmlFor="role" errors={state?.errors?.role}>
        <select
          id="role"
          name="role"
          required
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          className={inputClass}
        >
          {staffRoleOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          <option value="CUSTOMER">Kunde</option>
        </select>
      </Field>

      {role === "CUSTOMER" ? (
        <Field
          label="Gir tilgang til"
          htmlFor="portalTarget"
          errors={state?.errors?.portalTarget}
        >
          <PortalTargetSelect
            id="portalTarget"
            customers={customers}
            owners={owners}
          />
        </Field>
      ) : (
        <Field label="Lønn" htmlFor="payType" errors={state?.errors?.payType}>
          <select
            id="payType"
            name="payType"
            required
            defaultValue="FIXED"
            className={inputClass}
          >
            {payTypeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Oppretter …">Opprett</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}

function AccessToggles({ user }: { user: UserRow }) {
  const flags: Record<StaffCapability, boolean> = {
    log: user.canLog,
    issues: user.canIssues,
    hours: user.canHours,
    todos: user.canTodos,
    calendar: user.canCalendar,
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-meta font-semibold text-ink-2">Tilgang</p>
      <div className="flex flex-wrap gap-2">
        {STAFF_CAPABILITIES.map((capability) => {
          const on = flags[capability];
          return (
            <form
              key={capability}
              action={setUserAccess.bind(null, user.id, capability, !on)}
            >
              <button
                type="submit"
                aria-pressed={on}
                className={`min-h-12 rounded-xl px-4 text-meta font-semibold ${
                  on ? solidActionClass : outlineActionClass
                }`}
              >
                {capabilityLabels[capability]}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    resetUserPassword.bind(null, userId),
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <Field
        label="Nytt passord"
        htmlFor={`password-${userId}`}
        errors={state?.errors?.password}
      >
        <input
          id={`password-${userId}`}
          name="password"
          type="password"
          required
          minLength={4}
          className={inputClass}
        />
      </Field>
      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Lagrer …">Sett passord</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}
