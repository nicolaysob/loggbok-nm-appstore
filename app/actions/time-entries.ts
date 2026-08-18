"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireHourlyUser } from "@/lib/dal";
import { osloMidnight, parseYmdKey } from "@/lib/period";
import { timeEntrySchema, type FormState } from "@/lib/validation";

export async function createTimeEntry(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireHourlyUser();

  const result = timeEntrySchema.safeParse({
    workedOn: formData.get("workedOn"),
    hours: formData.get("hours"),
    comment: formData.get("comment"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const ymd = parseYmdKey(result.data.workedOn);
  if (!ymd) {
    return { errors: { workedOn: ["Velg dato"] } };
  }

  await db.timeEntry.create({
    data: {
      userId: user.id,
      workedOn: osloMidnight(ymd.year, ymd.month, ymd.day),
      hours: result.data.hours,
      comment: result.data.comment,
    },
  });

  revalidatePath("/timeliste");
  revalidatePath("/lonn");
  return { message: "Timer lagret." };
}
