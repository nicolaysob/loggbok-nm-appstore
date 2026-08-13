import { requireCustomer } from "@/lib/dal";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { ProfileCorner } from "@/components/profile-menu";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCustomer();
  const initial = user.name.charAt(0).toUpperCase();
  const links = [
    { href: "/personvern", label: "Personvern" },
    { href: "/support", label: "Support" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <ProfileCorner
          hideOn={["/portal"]}
          initial={initial}
          name={user.name}
          subtitle="Kundeportal"
          links={links}
        />
        <PullToRefresh>{children}</PullToRefresh>
      </main>
    </div>
  );
}
