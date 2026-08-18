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
        canLog: true,
        canIssues: true,
        canHours: true,
        canTodos: true,
        canCalendar: true,
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
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <h1 className="text-display">Brukere</h1>

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
          canLog: user.canLog,
          canIssues: user.canIssues,
          canHours: user.canHours,
          canTodos: user.canTodos,
          canCalendar: user.canCalendar,
        }))}
      />
    </div>
  );
}
