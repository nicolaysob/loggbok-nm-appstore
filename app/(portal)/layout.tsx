import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { ProfileCorner } from "@/components/profile-menu";
import { OneSignalInit } from "@/components/onesignal-init";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Portalbrukeren henger enten på ett kundekort eller på en eier med flere.
  // Layouten trenger bare å vite at det ER en portalbruker — hvilket sted som
  // vises avgjøres per side med portalScope().
  const user = await requireUser();
  if (user.role !== "CUSTOMER") redirect("/");
  const initial = user.name.charAt(0).toUpperCase();
  const links = [
    { href: "/personvern", label: "Personvern" },
    { href: "/support", label: "Support" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="print:hidden">
          <ProfileCorner
            hideOn={["/portal"]}
            initial={initial}
            name={user.name}
            subtitle="Kundeportal"
            links={links}
          />
        </div>
        <PullToRefresh>{children}</PullToRefresh>
      </main>
      <OneSignalInit externalUserId={user.id} audience="customer" />
    </div>
  );
}
