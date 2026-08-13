import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { backLinkClass, cardStaticClass } from "@/lib/ui";
import { DeleteAccountForm } from "./delete-account-form";

export default async function DeleteAccountPage() {
  await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/mer" className={backLinkClass}>
          ← Mer
        </Link>
        <h1 className="text-display tracking-tight">Slett konto</h1>
        <p className="text-body text-navy-700">
          Kontoen deaktiveres med en gang. Historikk på kunder beholdes for
          firmaet. Kontakt support hvis du trenger hjelp.
        </p>
      </div>

      <div className={`flex flex-col gap-4 px-4 py-4 ${cardStaticClass}`}>
        <DeleteAccountForm />
      </div>
    </div>
  );
}
