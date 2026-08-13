"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCustomer, requireUser } from "@/lib/dal";
import { notifyStaffNewCustomerMessage } from "@/lib/onesignal-server";
import { customerMessageSchema, type FormState } from "@/lib/validation";

export async function createCustomerMessage(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCustomer();

  const result = customerMessageSchema.safeParse({
    body: formData.get("body"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const customer = await db.customer.findUnique({
    where: { id: user.customerId },
    select: { id: true, name: true },
  });
  if (!customer) {
    return { message: "Kundekontoen er ikke koblet til en kunde." };
  }

  await db.customerMessage.create({
    data: {
      customerId: customer.id,
      userId: user.id,
      body: result.data.body,
    },
  });

  // Må await-es — void på Vercel dreper kallet før push rekker å gå ut
  await notifyStaffNewCustomerMessage({
    customerId: customer.id,
    customerName: customer.name,
    preview: result.data.body,
  });

  revalidatePath("/portal");
  revalidatePath("/portal/meldinger");
  revalidatePath(`/kunde/${customer.id}`);
  revalidatePath("/");
  return { message: "Meldingen er sendt." };
}

export async function signCustomerMessage(messageId: string): Promise<void> {
  const user = await requireUser();

  const message = await db.customerMessage.findUnique({
    where: { id: messageId },
    select: { id: true, customerId: true, readAt: true },
  });
  if (!message || message.readAt) return;

  await db.customerMessage.update({
    where: { id: message.id },
    data: {
      readAt: new Date(),
      signedByUserId: user.id,
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/meldinger");
  revalidatePath(`/kunde/${message.customerId}`);
  revalidatePath(`/kunde/${message.customerId}/meldingsarkiv`);
  revalidatePath("/");
}
