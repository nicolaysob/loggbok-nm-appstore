"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IssueStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireAdmin, requireStaff, requireStaffAccess } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { photosFromFormData } from "@/lib/photos";
import { issueSchema, type FormState } from "@/lib/validation";
import { issueStatusLabels } from "@/lib/labels";

function revalidateIssue(customerId: string) {
  revalidatePath(`/kunde/${customerId}`);
  revalidatePath(`/kunde/${customerId}/avvik`);
  revalidatePath(`/kunde/${customerId}/aktivitet`);
  revalidatePath("/portal");
  revalidatePath("/portal/avvik");
  revalidatePath("/");
  revalidatePath("/uke");
}

export async function createIssue(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaffAccess("issues");

  const result = issueSchema.safeParse({
    description: formData.get("description"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const photoResult = await photosFromFormData(formData);
  if ("error" in photoResult) {
    return { errors: { photos: [photoResult.error] } };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) {
    return { message: "Kunden mangler område og kan ikke registreres på." };
  }

  await db.issue.create({
    data: {
      areaId,
      userId: user.id,
      description: result.data.description,
      status: "OPEN",
      photos: {
        create: photoResult.photos,
      },
    },
  });

  revalidatePath(`/kunde/${customerId}`);
  revalidatePath(`/kunde/${customerId}/avvik`);
  revalidatePath("/");
  revalidatePath("/uke");
  redirect(`/kunde/${customerId}?lagret=1`);
}

/** Skriv en oppdatering på avviket — hva som er gjort siden sist. */
export async function addIssueNote(
  issueId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaffAccess("issues");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { errors: { body: ["Skriv hva som er gjort"] } };
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    select: { area: { select: { customerId: true } } },
  });
  if (!issue) return { message: "Avviket finnes ikke." };

  await db.issueNote.create({
    data: { issueId, userId: user.id, body },
  });

  revalidateIssue(issue.area.customerId);
  return { message: "Oppdatering lagret." };
}

// Kun admin — rydder feilskrevne oppdateringer
export async function deleteIssueNote(noteId: string) {
  await requireAdmin();

  const note = await db.issueNote.delete({
    where: { id: noteId },
    select: { issue: { select: { area: { select: { customerId: true } } } } },
  });

  revalidateIssue(note.issue.area.customerId);
}

export async function setIssueStatus(issueId: string, status: IssueStatus) {
  const user = await requireStaffAccess("issues");

  const issue = await db.issue.update({
    where: { id: issueId },
    data: {
      status,
      // closedAt følger statusen, så et gjenåpnet avvik ikke ser lukket ut
      closedAt: status === "CLOSED" ? new Date() : null,
    },
    select: { area: { select: { customerId: true } } },
  });

  // Statusbytter skal stå i historikken, ellers blir den full av hull
  await db.issueNote.create({
    data: {
      issueId,
      userId: user.id,
      body: `Satte status til «${issueStatusLabels[status]}»`,
    },
  });

  revalidatePath(`/kunde/${issue.area.customerId}`);
  revalidatePath(`/kunde/${issue.area.customerId}/avvik`);
  revalidatePath("/portal");
  revalidatePath("/portal/avvik");
  revalidatePath("/");
  revalidatePath("/uke");
}

// Kun admin — fjerner feilregistreringer så loggen holder seg ryddig.
// Bilder slettes automatisk (cascade).
export async function deleteIssue(issueId: string) {
  await requireAdmin();

  const issue = await db.issue.delete({
    where: { id: issueId },
    select: { area: { select: { customerId: true } } },
  });

  revalidatePath(`/kunde/${issue.area.customerId}`);
  revalidatePath(`/kunde/${issue.area.customerId}/avvik`);
  revalidatePath(`/kunde/${issue.area.customerId}/aktivitet`);
  revalidatePath("/");
  revalidatePath("/uke");
}

// Eier eller admin kan rette feilskrevet tekst
export async function updateIssueDescription(
  issueId: string,
  description: string,
): Promise<{ error?: string }> {
  const user = await requireStaff();

  const result = issueSchema.safeParse({ description });
  if (!result.success) {
    return {
      error: z.flattenError(result.error).fieldErrors.description?.[0],
    };
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    select: {
      userId: true,
      area: { select: { customerId: true } },
    },
  });
  if (!issue) return { error: "Avviket finnes ikke" };
  if (user.role !== "ADMIN" && issue.userId !== user.id) {
    return { error: "Du kan bare redigere egne avvik" };
  }

  await db.issue.update({
    where: { id: issueId },
    data: { description: result.data.description },
  });

  revalidatePath(`/kunde/${issue.area.customerId}`);
  revalidatePath(`/kunde/${issue.area.customerId}/avvik`);
  revalidatePath(`/kunde/${issue.area.customerId}/aktivitet`);
  revalidatePath("/");
  return {};
}
