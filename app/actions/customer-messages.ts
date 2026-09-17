"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { verifyPortalWrite } from "@/lib/portal-scope";
import {
  notifyCustomerMessageReply,
  notifyStaffCustomerReply,
  notifyStaffNewCustomerMessage,
} from "@/lib/onesignal-server";
import { customerMessageSchema, type FormState } from "@/lib/validation";

export async function createCustomerMessage(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = customerMessageSchema.safeParse({
    body: formData.get("body"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  // Stedet kommer fra skjemaet, ikke fra user.customerId — en eierbruker har
  // ingen, og skrev derfor ut i løse lufta før dette
  const access = await verifyPortalWrite(
    String(formData.get("customerId") ?? ""),
  );
  if (!access) {
    return { message: "Du har ikke tilgang til dette stedet." };
  }

  const customer = await db.customer.findUnique({
    where: { id: access.customerId },
    select: { id: true, name: true },
  });
  if (!customer) {
    return { message: "Kundekontoen er ikke koblet til en kunde." };
  }

  await db.customerMessage.create({
    data: {
      customerId: customer.id,
      userId: access.userId,
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
  // Bare ansatte kvitterer ut — kunden skal ikke kunne lukke sin egen melding
  const user = await requireStaff();

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

export async function replyCustomerMessage(
  messageId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaff();

  const result = customerMessageSchema.safeParse({
    body: formData.get("body"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const message = await db.customerMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      customerId: true,
      userId: true,
      readAt: true,
    },
  });
  if (!message) return { message: "Meldingen finnes ikke." };

  // Signert betyr «vi har tatt tak i det», ikke at tråden er stengt. Svaret
  // legger seg på meldingen der den står — vi åpner den ikke igjen selv.
  await db.customerMessageReply.create({
    data: {
      messageId: message.id,
      userId: user.id,
      body: result.data.body,
    },
  });

  await notifyCustomerMessageReply({
    customerId: message.customerId,
    preview: result.data.body,
  });

  revalidatePath("/portal");
  revalidatePath("/portal/meldinger");
  revalidatePath(`/kunde/${message.customerId}`);
  revalidatePath(`/kunde/${message.customerId}/meldingsarkiv`);
  revalidatePath("/");
  return { message: "Svaret er sendt." };
}

/**
 * Kundens svar i samme tråd. Var meldingen signert, åpnes den igjen — ellers
 * blir oppfølgingen liggende i arkivet, der ingen av oss ser etter. Det var
 * nettopp den fella som gjorde at en melding ble borte for kunden.
 */
export async function replyCustomerMessageFromPortal(
  messageId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = customerMessageSchema.safeParse({
    body: formData.get("body"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const message = await db.customerMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      customerId: true,
      readAt: true,
      customer: { select: { name: true } },
    },
  });
  if (!message) return { message: "Meldingen finnes ikke." };

  const access = await verifyPortalWrite(message.customerId);
  if (!access) return { message: "Meldingen finnes ikke." };

  await db.customerMessageReply.create({
    data: {
      messageId: message.id,
      userId: access.userId,
      body: result.data.body,
    },
  });

  const reopened = message.readAt !== null;
  if (reopened) {
    await db.customerMessage.update({
      where: { id: message.id },
      data: { readAt: null, signedByUserId: null },
    });
  }

  await notifyStaffCustomerReply({
    customerId: message.customerId,
    customerName: message.customer.name,
    preview: result.data.body,
    reopened,
  });

  revalidatePath("/portal");
  revalidatePath("/portal/meldinger");
  revalidatePath(`/kunde/${message.customerId}`);
  revalidatePath(`/kunde/${message.customerId}/meldingsarkiv`);
  revalidatePath("/");

  // Meldingen flyttet ut av arkivet og tilbake til forsiden. Da må kunden
  // flyttes med den — ellers står hun igjen i en tom måned og lurer på hvor
  // det ble av svaret sitt.
  if (reopened) {
    redirect(`/portal?sted=${message.customerId}&svar=sendt`);
  }

  return { message: "Svaret er sendt." };
}
