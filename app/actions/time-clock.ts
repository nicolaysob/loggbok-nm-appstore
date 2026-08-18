"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff, requireStaffAccess } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { osloMidnight, osloYmd } from "@/lib/period";
import { hoursFromClock } from "@/lib/time-clock";
import { stopTimeClockSchema, type FormState } from "@/lib/validation";

const MISSING_AREA = "Kunden mangler område og kan ikke registreres på.";

function revalidateClock(customerId?: string | null) {
  revalidatePath("/timeliste");
  revalidatePath("/lonn");
  if (customerId) {
    revalidatePath(`/kunde/${customerId}`);
    revalidatePath(`/kunde/${customerId}/timer`);
    revalidatePath(`/kunde/${customerId}/aktivitet`);
    revalidatePath("/");
    revalidatePath("/uke");
    revalidatePath("/mnd");
  }
}

export async function startPayrollClock(): Promise<FormState> {
  const user = await requireStaffAccess("hours");
  if (user.payType !== "HOURLY") {
    return { message: "Bare timesbetalte kan stemple lønnstimer." };
  }

  const existing = await db.timeClock.findUnique({
    where: { userId: user.id },
    select: { id: true, kind: true },
  });
  if (existing) {
    return {
      message:
        existing.kind === "EXTRA_WORK"
          ? "Du har allerede en stempling på ekstraarbeid. Avslutt den først."
          : "Du har allerede en stempling i gang.",
    };
  }

  await db.timeClock.create({
    data: {
      userId: user.id,
      kind: "PAYROLL",
    },
  });

  revalidateClock();
  return { message: "Stempling startet." };
}

export async function startExtraWorkClock(
  customerId: string,
): Promise<FormState> {
  const user = await requireStaffAccess("hours");

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { id: true, active: true },
  });
  if (!customer?.active) {
    return { message: "Kunden finnes ikke eller er inaktiv." };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) return { message: MISSING_AREA };

  const existing = await db.timeClock.findUnique({
    where: { userId: user.id },
    select: { id: true, kind: true, customerId: true },
  });
  if (existing) {
    if (existing.kind === "EXTRA_WORK" && existing.customerId === customerId) {
      return { message: "Du har allerede en stempling i gang her." };
    }
    return {
      message:
        existing.kind === "PAYROLL"
          ? "Du har allerede en lønnsstempling i gang. Avslutt den først."
          : "Du har allerede en stempling på en annen kunde. Avslutt den først.",
    };
  }

  await db.timeClock.create({
    data: {
      userId: user.id,
      kind: "EXTRA_WORK",
      customerId,
    },
  });

  revalidateClock(customerId);
  return { message: "Stempling startet." };
}

/** Pause — stopper klokka uten å avslutte stemplingen. */
export async function pauseTimeClock(): Promise<FormState> {
  const user = await requireStaff();

  const open = await db.timeClock.findUnique({
    where: { userId: user.id },
    select: { customerId: true, pausedAt: true },
  });
  if (!open) {
    return { message: "Ingen stempling å pause." };
  }
  if (open.pausedAt) {
    return { message: "Pausen er allerede i gang." };
  }

  await db.timeClock.update({
    where: { userId: user.id },
    data: { pausedAt: new Date() },
  });

  revalidateClock(open.customerId);
  return { message: "Pause startet." };
}

/** Fortsett — legger pausen til i summen og starter klokka igjen. */
export async function resumeTimeClock(): Promise<FormState> {
  const user = await requireStaff();

  const open = await db.timeClock.findUnique({
    where: { userId: user.id },
    select: { customerId: true, pausedAt: true, pausedMs: true },
  });
  if (!open) {
    return { message: "Ingen stempling å fortsette." };
  }
  if (!open.pausedAt) {
    return { message: "Stemplingen er ikke pauset." };
  }

  const elapsed = Math.max(0, Date.now() - open.pausedAt.getTime());
  await db.timeClock.update({
    where: { userId: user.id },
    data: { pausedAt: null, pausedMs: open.pausedMs + elapsed },
  });

  revalidateClock(open.customerId);
  return { message: "Stempling fortsetter." };
}

export async function cancelTimeClock(): Promise<FormState> {
  const user = await requireStaff();

  const open = await db.timeClock.findUnique({
    where: { userId: user.id },
    select: { customerId: true },
  });
  if (!open) {
    return { message: "Ingen stempling å avbryte." };
  }

  await db.timeClock.delete({ where: { userId: user.id } });
  revalidateClock(open.customerId);
  return { message: "Stempling avbrutt." };
}

export async function stopTimeClock(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaff();

  const open = await db.timeClock.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      kind: true,
      customerId: true,
      startedAt: true,
      pausedAt: true,
      pausedMs: true,
    },
  });
  if (!open) {
    return { message: "Ingen stempling å avslutte." };
  }

  const result = stopTimeClockSchema.safeParse({
    hours: formData.get("hours"),
    comment: formData.get("comment"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const endedAt = new Date();
  // Stopper man midt i en pause, teller ikke pausen med i timene
  const computed = hoursFromClock(open.startedAt, endedAt, {
    pausedAt: open.pausedAt,
    pausedMs: open.pausedMs,
  });
  const hours = result.data.hours ?? computed;

  if (hours < 0.5) {
    return {
      errors: {
        hours: [
          "Under 0,5 time etter runding. Juster timene manuelt, eller avbryt.",
        ],
      },
    };
  }
  if (hours > 24) {
    return {
      errors: { hours: ["Maks 24 timer per registrering"] },
    };
  }

  if (open.kind === "PAYROLL") {
    if (user.payType !== "HOURLY") {
      return { message: "Bare timesbetalte kan stemple lønnstimer." };
    }

    const day = osloYmd(open.startedAt);
    await db.$transaction([
      db.timeEntry.create({
        data: {
          userId: user.id,
          workedOn: osloMidnight(day.year, day.month, day.day),
          hours,
          comment: result.data.comment,
        },
      }),
      db.timeClock.delete({ where: { id: open.id } }),
    ]);

    revalidateClock();
    return { message: "Stempling lagret." };
  }

  if (!open.customerId) {
    return { message: "Stemplingen mangler kunde." };
  }

  const areaId = await primaryAreaId(open.customerId);
  if (!areaId) return { message: MISSING_AREA };

  const customerId = open.customerId;
  await db.$transaction([
    db.logEntry.create({
      data: {
        areaId,
        userId: user.id,
        occurredAt: open.startedAt,
        type: "EXTRA_WORK",
        hours,
        comment: result.data.comment,
      },
    }),
    db.timeClock.delete({ where: { id: open.id } }),
  ]);

  revalidateClock(customerId);
  return { message: "Stempling lagret." };
}
