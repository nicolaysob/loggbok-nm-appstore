import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";

/**
 * Hvilket kundekort portalen skal vise.
 *
 * En portalbruker henger enten på ett kundekort (de aller fleste) eller på en
 * eier med flere kundekort. Eier-brukeren velger sted via ?sted=<id>; uten
 * valg får hun stedslista. En vanlig kundebruker merker ingenting av dette.
 */
export type PortalScope =
  | {
      kind: "customer";
      customerId: string;
      /** Eier, når kundekortet hører til en — brukes til «Alle steder» */
      owner: { id: string; name: string } | null;
      userName: string;
    }
  | {
      kind: "owner";
      owner: { id: string; name: string };
      userName: string;
    };

/** Kortnavn der det finnes — fullt firmanavn tar for mye plass på telefon. */
export function ownerLabel(owner: {
  name: string;
  shortName?: string | null;
}): string {
  return owner.shortName?.trim() || owner.name;
}

export async function portalScope(
  stedParam?: string | string[],
): Promise<PortalScope> {
  const user = await requireUser();
  if (user.role !== "CUSTOMER") redirect("/");

  // Innlogging på ett kundekort — som før eier-funksjonen fantes
  if (user.customerId) {
    const customer = await db.customer.findUnique({
      where: { id: user.customerId },
      select: { owner: { select: { id: true, name: true } } },
    });
    return {
      kind: "customer",
      customerId: user.customerId,
      owner: customer?.owner ?? null,
      userName: user.name,
    };
  }

  if (!user.ownerId) redirect("/");

  const owner = await db.owner.findUnique({
    where: { id: user.ownerId },
    select: { id: true, name: true },
  });
  if (!owner) redirect("/");

  const sted = typeof stedParam === "string" ? stedParam : undefined;
  if (sted) {
    // Bekreft at stedet faktisk hører til eieren — id-en kommer fra URL-en
    const owned = await db.customer.findFirst({
      where: { id: sted, ownerId: owner.id },
      select: { id: true },
    });
    if (owned) {
      return {
        kind: "customer",
        customerId: owned.id,
        owner,
        userName: user.name,
      };
    }
  }

  return { kind: "owner", owner, userName: user.name };
}

/**
 * Har den innloggede portalbrukeren lov til å skrive på dette kundekortet?
 *
 * Kundebrukeren har sitt ene kort; eierbrukeren har alle kortene under eieren.
 * Brukes av skrivehandlingene — de kan ikke lene seg på user.customerId, for
 * eieren har ingen. Returnerer null i stedet for å redirecte, så handlingen
 * kan svare med en feilmelding i skjemaet.
 */
export async function verifyPortalWrite(
  customerId: string,
): Promise<{ userId: string; customerId: string } | null> {
  const user = await requireUser();
  if (user.role !== "CUSTOMER") redirect("/");

  if (user.customerId) {
    return user.customerId === customerId
      ? { userId: user.id, customerId }
      : null;
  }

  if (!user.ownerId) return null;

  const owned = await db.customer.findFirst({
    where: { id: customerId, ownerId: user.ownerId },
    select: { id: true },
  });
  return owned ? { userId: user.id, customerId: owned.id } : null;
}

export type OwnerPlace = {
  id: string;
  name: string;
  lastVisit: Date | null;
  openIssues: number;
  /** Meldinger stedet har sendt som vi ennå ikke har kvittert ut */
  openMessages: number;
};

/** Stedene under en eier, med nok status til å se hvor det brenner. */
export async function ownerPlaces(ownerId: string): Promise<OwnerPlace[]> {
  const customers = await db.customer.findMany({
    where: { ownerId, active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { messages: { where: { readAt: null } } } },
      areas: {
        select: {
          logEntries: {
            orderBy: { occurredAt: "desc" },
            take: 1,
            select: { occurredAt: true },
          },
          _count: {
            select: { issues: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } } } },
          },
        },
      },
    },
  });

  return customers.map((customer) => {
    const visits = customer.areas
      .flatMap((area) => area.logEntries.map((entry) => entry.occurredAt))
      .sort((a, b) => b.getTime() - a.getTime());
    return {
      id: customer.id,
      name: customer.name,
      lastVisit: visits[0] ?? null,
      openIssues: customer.areas.reduce(
        (sum, area) => sum + area._count.issues,
        0,
      ),
      openMessages: customer._count.messages,
    };
  });
}
