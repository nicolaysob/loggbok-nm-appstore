"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";

export async function setExtraWorkHandled(id: string, handled: boolean) {
  await requireAdmin();

  const entry = await db.logEntry.findFirst({
    where: { id, type: "EXTRA_WORK" },
    select: { id: true },
  });
  if (!entry) return;

  await db.logEntry.update({
    where: { id },
    data: { handledAt: handled ? new Date() : null },
  });

  revalidatePath("/mnd");
  revalidatePath("/fakturering");
}
