import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { staffAccess, type StaffCapability } from "@/lib/access";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

// Slår opp brukeren bak sesjons-cookien. Memoisert med cache() så flere
// komponenter i samme render deler ett databasekall.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      payType: true,
      active: true,
      customerId: true,
      canLog: true,
      canIssues: true,
      canHours: true,
      canTodos: true,
      canCalendar: true,
    },
  });
  if (!user?.active) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    payType: user.payType,
    customerId: user.customerId,
    canLog: user.canLog,
    canIssues: user.canIssues,
    canHours: user.canHours,
    canTodos: user.canTodos,
    canCalendar: user.canCalendar,
  };
});

// Den faktiske sikkerhetsgrensen. Kall denne i hver beskyttet side og
// server action — proxy.ts er bare en rask forhåndssjekk.
export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    const cookieStore = await cookies();
    if (cookieStore.get(SESSION_COOKIE)) {
      redirect("/api/session/clear");
    }
    redirect("/login");
  }
  return user;
});

export const requireStaff = cache(async () => {
  const user = await requireUser();
  if (user.role === "CUSTOMER") redirect("/portal");
  return { ...user, access: staffAccess(user) };
});

export const requireCustomer = cache(async () => {
  const user = await requireUser();
  if (user.role !== "CUSTOMER" || !user.customerId) redirect("/");
  return { ...user, customerId: user.customerId };
});

export const requireHourlyUser = cache(async () => {
  const user = await requireStaff();
  if (user.role === "ADMIN") redirect("/lonn");
  if (user.payType !== "HOURLY" || !user.access.hours) redirect("/");
  return user;
});

export const requireAdmin = cache(async () => {
  const user = await requireStaff();
  if (user.role !== "ADMIN") redirect("/");
  return user;
});

export async function requireStaffAccess(capability: StaffCapability) {
  const user = await requireStaff();
  if (!user.access[capability]) redirect("/");
  return user;
}
