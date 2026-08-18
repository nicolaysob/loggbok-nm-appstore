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

export type UserRow = {
  id: string;
  name: string;
  username: string;
  role: Role;
  payType: PayType;
  active: boolean;
  customerName: string | null;
  isSelf: boolean;
} & AccessFlags;

export function UsersManager({
  users,
  customers,
}: {
  users: UserRow[];
  customers: CustomerOption[];
}) {
  const staff = users.filter((user) => user.role !== "CUSTOMER");
  const customerUsers = users.filter((user) => user.role === "CUSTOMER");

  return (
    <div className="flex flex-col gap-8">
      <CreateUserForm customers={customers} />

      <section className="flex flex-col gap-3">
        <h2 className="text-heading text-ink">Ansatte</h2>
        {staff.length === 0 ? (
          <p className="rounded-2xl border border-hair bg-surface px-5 py-5 text-body text-ink-2">
            Ingen ansatte.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {staff.map((user) => (
              <UserCard key={user.id} user={user} />
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
              <UserCard key={user.id} user={user} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function UserCard({ user }: { user: UserRow }) {
  const [open, setOpen] = useState(false);
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
            {user.role === "CUSTOMER" && user.customerName
              ? ` · ${user.customerName}`
              : user.role !== "CUSTOMER"
                ? ` · ${payTypeLabels[user.payType]}`
                : ""}
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

          {user.role === "CUSTOMER" && user.customerName && (
            <p className="text-body text-ink-2">
              Kundekonto for{" "}
              <span className="font-semibold">{user.customerName}</span>
            </p>
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

          {!user.isSelf && (
            <form
              action={deleteAction}
              onSubmit={(event) => {
                if (
                  !confirm(
                    `Slette brukeren «${user.name}» for godt?\n\nDette kan ikke angres.`,
                  )
                ) {
                  event.preventDefault();
                }
              }}
            >
              <button
                type="submit"
                className="min-h-12 w-full rounded-2xl bg-surface px-4 text-meta font-semibold text-danger active:bg-danger-soft"
              >
                Slett bruker
              </button>
              <Feedback message={deleteState?.message} />
            </form>
          )}
        </div>
      )}
    </li>
  );
}

function CreateUserForm({ customers }: { customers: CustomerOption[] }) {
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
          label="Kunde"
          htmlFor="customerId"
          errors={state?.errors?.customerId}
        >
          <select
            id="customerId"
            name="customerId"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Velg kunde
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
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
