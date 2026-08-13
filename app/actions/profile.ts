"use server";

import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import {
  updateOwnNameSchema,
  updateOwnPasswordSchema,
  type FormState,
} from "@/lib/validation";

export async function updateOwnName(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaff();

  const result = updateOwnNameSchema.safeParse({
    name: formData.get("name"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: result.data.name },
  });

  revalidatePath("/");
  revalidatePath("/profil");
  revalidatePath("/mer");
  return { message: "Navnet er lagret." };
}

export async function updateOwnPassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaff();

  const result = updateOwnPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!row) {
    return { errors: { currentPassword: ["Fant ikke kontoen."] } };
  }

  const ok = await compare(result.data.currentPassword, row.passwordHash);
  if (!ok) {
    return { errors: { currentPassword: ["Nåværende passord stemmer ikke."] } };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hash(result.data.password, 10) },
  });

  return { message: "Passordet er byttet." };
}
