import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { UsersManager } from "./users-manager";

export default async function UsersPage() {
  const admin = await requireAdmin();

  const [users, customers] = await Promise.all([
    db.user.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        payType: true,
        active: true,
        customer: { select: { name: true } },
      },
    }),
    db.customer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight">Brukere</h1>
        <p className="text-body text-navy-700">
          Opprett ansatte og kundekontoer. Kundekontoer ser bare egen logg.
          Deaktiverte kan ikke logge inn.
        </p>
      </div>

      <UsersManager
        customers={customers}
        users={users.map((user) => ({
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          payType: user.payType,
          active: user.active,
          customerName: user.customer?.name ?? null,
          isSelf: user.id === admin.id,
        }))}
      />
    </div>
  );
}
