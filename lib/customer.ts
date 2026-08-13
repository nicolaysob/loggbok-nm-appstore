import "server-only";
import { db } from "@/lib/db";

// Området er skjult for brukerne — kunden er stedet. Hver kunde har ett
// standardområde som all logging og alle oppgavemaler henger på.
// Eldste område vinner om en kunde mot formodning skulle ha flere fra før.
export async function primaryAreaId(customerId: string): Promise<string | null> {
  const area = await db.area.findFirst({
    where: { customerId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return area?.id ?? null;
}
