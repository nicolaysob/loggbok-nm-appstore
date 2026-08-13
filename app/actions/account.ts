"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { deleteSession } from "@/lib/session";

/**
 * Apple krever at brukeren kan slette kontoen sin.
 * Vi deaktiverer kontoen (active=false) og logger ut.
 * Admin kan ikke slette seg selv hvis de er siste aktive admin.
 */
export async function deleteOwnAccount(): Promise<{ error: string } | undefined> {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    const otherAdmins = await db.user.count({
      where: {
        role: "ADMIN",
        active: true,
        id: { not: user.id },
      },
    });
    if (otherAdmins === 0) {
      return {
        error:
          "Du er eneste admin. Opprett en annen admin før du sletter kontoen.",
      };
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { active: false },
  });

  await deleteSession();
  redirect("/login?slettet=1");
}
