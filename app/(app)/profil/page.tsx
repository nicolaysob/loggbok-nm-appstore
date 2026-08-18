import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { payTypeLabels, roleLabels } from "@/lib/labels";
import { BackLink } from "@/components/back-link";
import { ProfileForms } from "./profile-forms";

export default async function ProfilePage() {
  const user = await requireStaff();
  const account = await db.user.findUnique({
    where: { id: user.id },
    select: { username: true },
  });
  const username = account?.username ?? "";
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const role = roleLabels[user.role];
  const pay =
    user.role === "EMPLOYEE" ? payTypeLabels[user.payType] : null;

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <BackLink fallback="/" />

      <section className="flex flex-col items-center gap-3 px-2 pt-1 pb-2 text-center">
        <span
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full bg-hero text-[1.75rem] font-bold text-white"
        >
          {initial}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-display text-ink">
            {user.name}
          </h1>
          <p className="text-body text-ink-2">
            {pay ? `${role} · ${pay}` : role}
          </p>
          {username ? (
            <p className="text-meta text-ink-2">@{username}</p>
          ) : null}
        </div>
      </section>

      <ProfileForms name={user.name} username={username} />
    </div>
  );
}
