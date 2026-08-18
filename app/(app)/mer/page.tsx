import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireStaff } from "@/lib/dal";
import { payTypeLabels, roleLabels } from "@/lib/labels";
import {
  SettingsButton,
  SettingsGroup,
  SettingsLink,
} from "@/components/settings-list";

export default async function MorePage() {
  const user = await requireStaff();
  const isAdmin = user.role === "ADMIN";
  const role = roleLabels[user.role];
  const pay =
    user.role === "EMPLOYEE" ? payTypeLabels[user.payType] : null;

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-8">
      <div>
        <h1 className="text-display">{user.name}</h1>
        <p className="mt-1 text-meta text-ink-2">
          {pay ? `${role} · ${pay}` : role}
        </p>
      </div>

      <SettingsGroup>
        <SettingsLink href="/profil" label="Profil" />
      </SettingsGroup>

      {isAdmin ? (
        <>
          <SettingsGroup title="Økonomi">
            <SettingsLink href="/lonn" label="Lønn" />
            <SettingsLink href="/uke" label="Uken" />
            <SettingsLink href="/mnd" label="Fakturering" />
          </SettingsGroup>
          <SettingsGroup title="Oppsett">
            <SettingsLink href="/ukeplan" label="Ukeplan" />
            <SettingsLink href="/kunder" label="Kunder" />
            <SettingsLink href="/brukere" label="Brukere" />
            <SettingsLink href="/oppdragstyper" label="Typer" />
          </SettingsGroup>
        </>
      ) : null}

      <SettingsGroup>
        <SettingsLink href="/support" label="Support" />
        <SettingsLink href="/personvern" label="Personvern" />
      </SettingsGroup>

      <SettingsGroup>
        <form action={logout}>
          <SettingsButton label="Logg ut" />
        </form>
      </SettingsGroup>

      <div className="flex justify-center pb-2">
        <Link
          href="/mer/slett-konto"
          className="text-meta font-medium text-danger"
        >
          Slett konto
        </Link>
      </div>
    </div>
  );
}
