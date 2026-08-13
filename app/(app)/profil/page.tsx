import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { BackLink } from "@/components/back-link";
import { ProfileForms } from "./profile-forms";

export default async function ProfilePage() {
  const user = await requireStaff();
  const account = await db.user.findUnique({
    where: { id: user.id },
    select: { username: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback="/" />
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Profil</h1>
          <p className="text-body text-navy-700">
            Endre navn og passord på kontoen din.
          </p>
        </div>
      </div>

      <ProfileForms name={user.name} username={account?.username ?? ""} />
    </div>
  );
}
