"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireStaffAccess } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { occursOn, scheduledInstant } from "@/lib/calendar";
import {
  osloMidnight,
  parseYmdKey,
  weekdayIndex,
} from "@/lib/period";
import {
  customerJobSchema,
  jobTypeSchema,
  type FormState,
} from "@/lib/validation";

function parseDateInput(value: string): Date {
  const ymd = parseYmdKey(value);
  if (!ymd) throw new Error("Ugyldig dato");
  return osloMidnight(ymd.year, ymd.month, ymd.day);
}

export async function createJobType(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = jobTypeSchema.safeParse({ name: formData.get("name") });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const max = await db.jobType.aggregate({ _max: { sortOrder: true } });

  try {
    await db.jobType.create({
      data: {
        name: result.data.name,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
  } catch {
    return { errors: { name: ["Denne oppdragstypen finnes allerede."] } };
  }

  revalidatePath("/oppdragstyper");
  revalidatePath("/kalender");
  return { message: "Oppdragstype lagt til." };
}

export async function deleteJobType(id: string) {
  await requireAdmin();

  const inUse = await db.customerJob.count({ where: { jobTypeId: id } });
  if (inUse > 0) {
    // Behold typen hvis den er i bruk — ellers mister historikk mening
    return;
  }

  await db.jobType.delete({ where: { id } });
  revalidatePath("/oppdragstyper");
}

export async function createJobFromCalendar(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const dayKey = String(formData.get("dayKey") ?? "");
  const day = parseYmdKey(dayKey);
  if (!day) {
    return { message: "Ugyldig dato." };
  }

  const result = customerJobSchema.safeParse({
    title: formData.get("title"),
    jobTypeId: formData.get("jobTypeId") || undefined,
    kind: formData.get("kind"),
    dueOn: dayKey,
    weekday: String(weekdayIndex(day)),
    startsOn: dayKey,
    notes: formData.get("notes"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) {
    return { message: "Velg en kunde." };
  }
  const areaId = await primaryAreaId(customerId);
  if (!areaId) {
    return { message: "Kunden mangler område." };
  }

  const jobTypeId: string | null = result.data.jobTypeId;
  if (jobTypeId) {
    const type = await db.jobType.findUnique({
      where: { id: jobTypeId },
      select: { id: true },
    });
    if (!type) {
      return { errors: { jobTypeId: ["Ugyldig oppdragstype"] } };
    }
  }

  const when = parseDateInput(dayKey);
  const weekday =
    result.data.kind === "WEEKLY" || result.data.kind === "BIWEEKLY"
      ? Number(result.data.weekday)
      : null;

  await db.customerJob.create({
    data: {
      areaId,
      title: result.data.title,
      jobTypeId,
      kind: result.data.kind,
      dueOn: result.data.kind === "ONCE" ? when : null,
      weekday,
      startsOn: when,
      notes: result.data.notes,
    },
  });

  revalidatePath("/kalender");
  return { message: "Oppdrag lagt til." };
}

export async function createCustomerJob(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = customerJobSchema.safeParse({
    title: formData.get("title"),
    jobTypeId: formData.get("jobTypeId") || undefined,
    kind: formData.get("kind"),
    dueOn: formData.get("dueOn") || undefined,
    weekday: formData.get("weekday") || undefined,
    startsOn: formData.get("startsOn"),
    notes: formData.get("notes"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) {
    return { message: "Kunden mangler område." };
  }

  const jobTypeId: string | null = result.data.jobTypeId;
  if (jobTypeId) {
    const type = await db.jobType.findUnique({
      where: { id: jobTypeId },
      select: { id: true },
    });
    if (!type) {
      return { errors: { jobTypeId: ["Ugyldig oppdragstype"] } };
    }
  }

  const startsOn = parseDateInput(
    result.data.kind === "ONCE"
      ? (result.data.dueOn as string)
      : (result.data.startsOn as string),
  );
  const dueOn =
    result.data.kind === "ONCE" && result.data.dueOn
      ? parseDateInput(result.data.dueOn)
      : null;
  const weekday =
    result.data.kind === "WEEKLY" || result.data.kind === "BIWEEKLY"
      ? Number(result.data.weekday)
      : null;

  await db.customerJob.create({
    data: {
      areaId,
      title: result.data.title,
      jobTypeId,
      kind: result.data.kind,
      dueOn,
      weekday,
      startsOn,
      notes: result.data.notes,
    },
  });

  revalidatePath(`/kunder/${customerId}`);
  revalidatePath("/kalender");
  return { message: "Oppdrag lagt til i kalenderen." };
}

export async function deleteCustomerJob(jobId: string) {
  await requireAdmin();

  const job = await db.customerJob.delete({
    where: { id: jobId },
    select: { area: { select: { customerId: true } } },
  });

  revalidatePath(`/kunder/${job.area.customerId}`);
  revalidatePath("/kalender");
}

export async function completeCalendarJob(
  customerJobId: string,
  dayKey: string,
) {
  const user = await requireStaffAccess("calendar");
  const day = parseYmdKey(dayKey);
  if (!day) return;

  const job = await db.customerJob.findUnique({
    where: { id: customerJobId },
    select: {
      id: true,
      kind: true,
      dueOn: true,
      weekday: true,
      startsOn: true,
      active: true,
    },
  });
  if (!job || !occursOn(job, day)) return;

  const scheduledFor = scheduledInstant(day);

  await db.jobCompletion.upsert({
    where: {
      customerJobId_scheduledFor: {
        customerJobId,
        scheduledFor,
      },
    },
    create: {
      customerJobId,
      userId: user.id,
      scheduledFor,
    },
    update: {},
  });

  // Engangsoppdrag er ferdige når de er krysset av
  if (job.kind === "ONCE") {
    await db.customerJob.update({
      where: { id: customerJobId },
      data: { active: false },
    });
  }

  revalidatePath("/kalender");
  revalidatePath("/");
}

export async function uncompleteCalendarJob(
  customerJobId: string,
  dayKey: string,
) {
  await requireStaffAccess("calendar");
  const day = parseYmdKey(dayKey);
  if (!day) return;

  const scheduledFor = scheduledInstant(day);

  await db.jobCompletion.deleteMany({
    where: { customerJobId, scheduledFor },
  });

  await db.customerJob.updateMany({
    where: { id: customerJobId, kind: "ONCE" },
    data: { active: true },
  });

  revalidatePath("/kalender");
  revalidatePath("/");
}