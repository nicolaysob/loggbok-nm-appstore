"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { PayType, Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import {
  createUserSchema,
  resetPasswordSchema,
  type FormState,
} from "@/lib/validation";

function revalidateUsers() {
  revalidatePath("/brukere");
}

async function adminCountExcluding(userId: string) {
  return db.user.count({
    where: {
      role: "ADMIN",
      active: true,
      id: { not: userId },
    },
  });
}

export async function createUser(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = createUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    payType: formData.get("payType") || undefined,
    customerId: formData.get("customerId") || undefined,
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const existing = await db.user.findUnique({
    where: { username: result.data.username },
    select: { id: true },
  });
  if (existing) {
    return { errors: { username: ["Brukernavnet er opptatt."] } };
  }

  if (result.data.role === "CUSTOMER" && result.data.customerId) {
    const customer = await db.customer.findUnique({
      where: { id: result.data.customerId },
      select: { id: true },
    });
    if (!customer) {
      return { errors: { customerId: ["Ugyldig kunde."] } };
    }
  }

  const passwordHash = await hash(result.data.password, 10);

  await db.user.create({
    data: {
      name: result.data.name,
      username: result.data.username,
      passwordHash,
      role: result.data.role,
      payType:
        result.data.role === "CUSTOMER"
          ? "FIXED"
          : (result.data.payType as PayType),
      customerId:
        result.data.role === "CUSTOMER" ? result.data.customerId! : null,
      active: true,
    },
  });

  revalidateUsers();
  return { message: "Bruker opprettet." };
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (role === "CUSTOMER") return;

  if (admin.id === userId && role !== "ADMIN") {
    const others = await adminCountExcluding(userId);
    if (others === 0) {
      return;
    }
  }

  await db.user.update({
    where: { id: userId },
    data: { role, customerId: null },
  });
  revalidateUsers();
}

export async function setUserPayType(userId: string, payType: PayType) {
  await requireAdmin();

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target || target.role === "CUSTOMER") return;

  await db.user.update({
    where: { id: userId },
    data: { payType },
  });
  revalidateUsers();
}

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireAdmin();
  if (admin.id === userId && !active) {
    return;
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return;

  if (!active && target.role === "ADMIN") {
    const others = await adminCountExcluding(userId);
    if (others === 0) return;
  }

  await db.user.update({
    where: { id: userId },
    data: { active },
  });
  revalidateUsers();
}

export async function deleteUser(userId: string): Promise<FormState> {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    return { message: "Du kan ikke slette deg selv." };
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      _count: {
        select: {
          logEntries: true,
          issues: true,
          jobCompletions: true,
        },
      },
    },
  });
  if (!target) return { message: "Brukeren finnes ikke." };

  if (target.role === "ADMIN") {
    const others = await adminCountExcluding(userId);
    if (others === 0) {
      return { message: "Kan ikke slette siste admin." };
    }
  }

  if (
    target._count.logEntries > 0 ||
    target._count.issues > 0 ||
    target._count.jobCompletions > 0
  ) {
    return {
      message:
        "Kan ikke slette — brukeren har loggføringer. Deaktiver i stedet.",
    };
  }

  await db.user.delete({ where: { id: userId } });
  revalidateUsers();
  return { message: "Bruker slettet." };
}

export async function resetUserPassword(
  userId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const passwordHash = await hash(result.data.password, 10);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidateUsers();
  return { message: "Passord oppdatert." };
}
