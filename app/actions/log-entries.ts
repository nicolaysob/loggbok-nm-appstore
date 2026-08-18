"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin, requireStaff, requireStaffAccess } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { occurredAtFromDateTimeLocal } from "@/lib/period";
import { photosFromFormData } from "@/lib/photos";
import {
  extraWorkSchema,
  visitNoteSchema,
  type FormState,
} from "@/lib/validation";

const MISSING_AREA = "Kunden mangler område og kan ikke registreres på.";

function done(customerId: string): never {
  revalidatePath("/");
  revalidatePath(`/kunde/${customerId}`);
  revalidatePath("/uke");
  revalidatePath("/mnd");
  redirect(`/kunde/${customerId}?lagret=1`);
}

// Kun admin — fjerner feilregistreringer så loggen holder seg ryddig.
// Avkryssede oppgaver og bilder slettes automatisk (cascade).
// NB: sletting av EXTRA_WORK fjerner også timene fra fakturagrunnlaget.
export async function deleteLogEntry(logEntryId: string) {
  await requireAdmin();

  const entry = await db.logEntry.delete({
    where: { id: logEntryId },
    select: { area: { select: { customerId: true } } },
  });

  revalidatePath("/");
  revalidatePath(`/kunde/${entry.area.customerId}`);
  revalidatePath(`/kunde/${entry.area.customerId}/aktivitet`);
  revalidatePath("/uke");
  revalidatePath("/mnd");
}

// Eier eller admin kan rette feilskrevet kommentar
export async function updateLogEntryComment(
  logEntryId: string,
  comment: string,
): Promise<{ error?: string }> {
  const user = await requireStaff();

  const entry = await db.logEntry.findUnique({
    where: { id: logEntryId },
    select: {
      type: true,
      userId: true,
      area: { select: { customerId: true } },
    },
  });
  if (!entry) return { error: "Registreringen finnes ikke" };
  if (user.role !== "ADMIN" && entry.userId !== user.id) {
    return { error: "Du kan bare redigere egne registreringer" };
  }

  // Besøk og ekstraarbeid krever tekst; oppgaveavkryssinger kan stå uten
  if (entry.type === "VISIT_NOTE") {
    const result = visitNoteSchema.safeParse({ comment });
    if (!result.success) {
      return {
        error: z.flattenError(result.error).fieldErrors.comment?.[0],
      };
    }
    await db.logEntry.update({
      where: { id: logEntryId },
      data: { comment: result.data.comment },
    });
  } else if (entry.type === "EXTRA_WORK") {
    const trimmed = comment.trim();
    if (!trimmed) {
      return { error: "Beskriv hva som ble gjort" };
    }
    await db.logEntry.update({
      where: { id: logEntryId },
      data: { comment: trimmed },
    });
  } else {
    const trimmed = comment.trim();
    await db.logEntry.update({
      where: { id: logEntryId },
      data: { comment: trimmed === "" ? null : trimmed },
    });
  }

  revalidatePath("/");
  revalidatePath(`/kunde/${entry.area.customerId}`);
  revalidatePath(`/kunde/${entry.area.customerId}/aktivitet`);
  revalidatePath("/uke");
  return {};
}

// Én registrering for hele besøket: avkryssede oppgaver, fritekst,
// eller begge. Med oppgaver blir typen TASK_COMPLETION (nå med valgfri
// kommentar), uten blir den VISIT_NOTE — da må teksten bære registreringen.
export async function createVisitNote(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaffAccess("log");

  const areaId = await primaryAreaId(customerId);
  if (!areaId) return { message: MISSING_AREA };

  // Godta bare oppgaver som faktisk hører til denne kunden — id-ene kommer
  // fra skjemaet og kan ikke stoles på
  const checkedIds = formData.getAll("tasks").map(String).filter(Boolean);
  const ownTasks =
    checkedIds.length > 0
      ? await db.taskTemplate.findMany({
          where: { id: { in: checkedIds }, areaId },
          select: { id: true },
        })
      : [];

  const comment = String(formData.get("comment") ?? "").trim();
  if (ownTasks.length === 0 && comment === "") {
    return {
      errors: {
        comment: ["Huk av minst én oppgave, eller skriv hva som ble gjort."],
      },
    };
  }

  const when = occurredAtFromDateTimeLocal(
    String(formData.get("occurredAt") ?? "").trim(),
  );
  if ("error" in when) {
    return { errors: { occurredAt: [when.error] } };
  }

  const photoResult = await photosFromFormData(formData);
  if ("error" in photoResult) {
    return { errors: { photos: [photoResult.error] } };
  }

  await db.logEntry.create({
    data: {
      areaId,
      userId: user.id,
      occurredAt: when.at,
      type: ownTasks.length > 0 ? "TASK_COMPLETION" : "VISIT_NOTE",
      comment: comment === "" ? null : comment,
      completedTasks:
        ownTasks.length > 0
          ? { create: ownTasks.map((task) => ({ taskTemplateId: task.id })) }
          : undefined,
      photos: {
        create: photoResult.photos,
      },
    },
  });

  done(customerId);
}


export async function createExtraWork(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaffAccess("hours");

  const result = extraWorkSchema.safeParse({
    hours: formData.get("hours"),
    comment: formData.get("comment"),
    occurredAt: formData.get("occurredAt"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const when = occurredAtFromDateTimeLocal(result.data.occurredAt);
  if ("error" in when) {
    return { errors: { occurredAt: [when.error] } };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) return { message: MISSING_AREA };

  await db.logEntry.create({
    data: {
      areaId,
      userId: user.id,
      occurredAt: when.at,
      type: "EXTRA_WORK",
      hours: result.data.hours,
      comment: result.data.comment,
    },
  });

  done(customerId);
}
