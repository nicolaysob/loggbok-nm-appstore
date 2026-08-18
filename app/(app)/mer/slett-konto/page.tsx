import { requireUser } from "@/lib/dal";
import { cardStaticClass } from "@/lib/ui";
import { BackLink } from "@/components/back-link";
import { DeleteAccountForm } from "./delete-account-form";

export default async function DeleteAccountPage() {
  await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback="/mer" />
        <div className="flex flex-col gap-1">
          <h1 className="text-display">Slett konto</h1>
          <p className="text-body text-ink-2">
            Kontoen deaktiveres med en gang. Historikk på kunder beholdes for
            firmaet. Kontakt support hvis du trenger hjelp.
          </p>
        </div>
      </div>

      <div className={`flex flex-col gap-4 px-4 py-5 ${cardStaticClass}`}>
        <DeleteAccountForm />
      </div>
    </div>
  );
}
