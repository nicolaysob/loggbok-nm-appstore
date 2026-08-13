import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

// Slår opp brukeren bak sesjons-cookien. Memoisert med cache() så flere
// komponenter i samme render deler ett databasekall.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  // findUnique tar bare unike felt — aktiv sjekkes etterpå
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
  };
});

// Den faktiske sikkerhetsgrensen. Kall denne i hver beskyttet side og
// server action — proxy.ts er bare en rask forhåndssjekk.
export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    const cookieStore = await cookies();
    // Gyldig JWT uten bruker i DB → slett cookie (unngår login↔hjem-loop)
    if (cookieStore.get(SESSION_COOKIE)) {
      redirect("/api/session/clear");
    }
    redirect("/login");
  }
  return user;
});

// Interne brukere (admin/ansatt). Kundekontoer sendes til portalen.
export const requireStaff = cache(async () => {
  const user = await requireUser();
  if (user.role === "CUSTOMER") redirect("/portal");
  return user;
});

// Kundekonto med koblet kunde.
export const requireCustomer = cache(async () => {
  const user = await requireUser();
  if (user.role !== "CUSTOMER" || !user.customerId) redirect("/");
  return { ...user, customerId: user.customerId };
});

// Timesbetalte ansatte — fastlønn sendes til forsiden.
export const requireHourlyUser = cache(async () => {
  const user = await requireStaff();
  if (user.role === "ADMIN") redirect("/lonn");
  if (user.payType !== "HOURLY") redirect("/");
  return user;
});

// Administrasjonssidene. Ansatte sendes stille til forsiden — proxy.ts sjekker
// bare om man er innlogget, ikke hvilken rolle man har.
export const requireAdmin = cache(async () => {
  const user = await requireStaff();
  if (user.role !== "ADMIN") redirect("/");
  return user;
});
