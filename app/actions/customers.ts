"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { customerSchema, type FormState } from "@/lib/validation";

function readCustomerForm(formData: FormData) {
  return {
    name: formData.get("name"),
    contractType: formData.get("contractType"),
    active: formData.get("active") === "on",
  };
}

export async function createCustomer(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = customerSchema.safeParse(readCustomerForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  // Hver kunde får ett standardområde med samme navn. Da slipper man å tenke på
  // områder i det hele tatt før en kunde faktisk må deles opp i flere anlegg.
  const customer = await db.customer.create({
    data: {
      name: result.data.name,
      contractType: result.data.contractType,
      active: result.data.active,
      annualValue: 0,
      areas: { create: { name: result.data.name } },
    },
  });

  revalidatePath("/kunder");
  redirect(`/kunder/${customer.id}`);
}

export async function updateCustomer(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = customerSchema.safeParse(readCustomerForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await db.customer.update({
    where: { id },
    data: {
      name: result.data.name,
      contractType: result.data.contractType,
      active: result.data.active,
    },
  });

  revalidatePath("/kunder");
  revalidatePath(`/kunder/${id}`);
  return { message: "Kunden er lagret." };
}

export async function deleteCustomer(id: string) {
  await requireAdmin();

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!customer) return;

  // Områder, logger, avvik, oppgaver og bilder følger med via CASCADE
  await db.customer.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/kunder");
  revalidatePath("/uke");
  revalidatePath("/mnd");
  revalidatePath("/kalender");
}
