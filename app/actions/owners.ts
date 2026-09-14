"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import type { FormState } from "@/lib/validation";

function optional(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text === "" ? null : text;
}

function revalidateOwners() {
  revalidatePath("/eiere");
  revalidatePath("/kunder");
  revalidatePath("/");
  revalidatePath("/portal");
}

export async function createOwner(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { errors: { name: ["Skriv navnet på eieren"] } };
  }

  await db.owner.create({
    data: {
      name,
      shortName: optional(formData.get("shortName")),
      contactPerson: optional(formData.get("contactPerson")),
      email: optional(formData.get("email")),
      phone: optional(formData.get("phone")),
    },
  });

  revalidateOwners();
  return { message: "Eieren er lagret." };
}

export async function updateOwner(
  ownerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { errors: { name: ["Skriv navnet på eieren"] } };
  }

  await db.owner.update({
    where: { id: ownerId },
    data: {
      name,
      shortName: optional(formData.get("shortName")),
      contactPerson: optional(formData.get("contactPerson")),
      email: optional(formData.get("email")),
      phone: optional(formData.get("phone")),
    },
  });

  revalidateOwners();
  return { message: "Eieren er oppdatert." };
}

/**
 * Sletting løsner kundekortene i stedet for å ta dem med seg — de skal
 * overleve at en eier fjernes. Portalbrukere på eieren må ryddes først,
 * ellers står de igjen uten noe å se.
 */
export async function deleteOwner(ownerId: string): Promise<FormState> {
  await requireAdmin();

  const portalUsers = await db.user.count({ where: { ownerId } });
  if (portalUsers > 0) {
    return {
      message:
        "Eieren har en portalinnlogging. Slett eller flytt brukeren først.",
    };
  }

  await db.owner.delete({ where: { id: ownerId } });
  revalidateOwners();
  return { message: "Eieren er slettet. Kundekortene står som før." };
}
