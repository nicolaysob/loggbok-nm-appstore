"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { taskTemplateSchema, type FormState } from "@/lib/validation";

function readTaskTemplateForm(formData: FormData) {
  return {
    title: formData.get("title"),
    frequency: formData.get("frequency"),
  };
}

// Oppgavemalene ligger på kundens standardområde, men administreres under kunden
async function customerIdForTemplate(id: string): Promise<string> {
  const template = await db.taskTemplate.findUniqueOrThrow({
    where: { id },
    select: { area: { select: { customerId: true } } },
  });

  return template.area.customerId;
}

export async function createTaskTemplate(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = taskTemplateSchema.safeParse(readTaskTemplateForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) {
    return { message: "Kunden mangler område. Opprett kunden på nytt." };
  }

  // Legg nye oppgaver nederst i lista
  const last = await db.taskTemplate.findFirst({
    where: { areaId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await db.taskTemplate.create({
    data: { ...result.data, areaId, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });

  revalidatePath(`/kunder/${customerId}`);
  return { message: "Oppgaven er lagt til." };
}

export async function updateTaskTemplate(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = taskTemplateSchema.safeParse(readTaskTemplateForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await db.taskTemplate.update({ where: { id }, data: result.data });

  revalidatePath(`/kunder/${await customerIdForTemplate(id)}`);
  return { message: "Lagret." };
}

export async function deleteTaskTemplate(id: string) {
  await requireAdmin();

  // Hent kunden før slettingen — etterpå finnes ikke raden å slå opp fra
  const customerId = await customerIdForTemplate(id);
  await db.taskTemplate.delete({ where: { id } });

  revalidatePath(`/kunder/${customerId}`);
}

export async function moveTaskTemplate(id: string, direction: "up" | "down") {
  await requireAdmin();

  const current = await db.taskTemplate.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      areaId: true,
      sortOrder: true,
      area: { select: { customerId: true } },
    },
  });

  // Naboen i valgt retning — den vi skal bytte plass med
  const neighbour = await db.taskTemplate.findFirst({
    where: {
      areaId: current.areaId,
      sortOrder:
        direction === "up"
          ? { lt: current.sortOrder }
          : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });

  // Allerede øverst eller nederst
  if (!neighbour) return;

  await db.$transaction([
    db.taskTemplate.update({
      where: { id: current.id },
      data: { sortOrder: neighbour.sortOrder },
    }),
    db.taskTemplate.update({
      where: { id: neighbour.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidatePath(`/kunder/${current.area.customerId}`);
}
