"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { generateGeminiJson } from "@/lib/gemini";
import { weekdayLabels } from "@/lib/labels";
import {
  daysOfWeek,
  osloMidnight,
  parseWeekParam,
  parseYmdKey,
  weekFromMonday,
  ymdKey,
  type Ymd,
} from "@/lib/period";

export type WeekPlanProposal = {
  dayKey: string;
  title: string;
  customerId: string | null;
  customerHint: string | null;
};

export type ParseWeekPlanResult =
  | { items: WeekPlanProposal[]; error?: undefined }
  | { items?: undefined; error: string };

export type ConfirmWeekPlanResult =
  | { message: string; error?: undefined }
  | { message?: undefined; error: string };

const aiItemSchema = z.object({
  dayKey: z.string(),
  title: z.string().trim().min(1),
  customerName: z.string().trim().nullable().optional(),
});

const aiResponseSchema = z.object({
  items: z.array(aiItemSchema),
});

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9æøå]+/gi, " ")
    .trim();
}

function matchCustomerId(
  hint: string | null | undefined,
  customers: { id: string; name: string; norm: string }[],
): string | null {
  if (!hint) return null;
  const needle = normalizeName(hint);
  if (!needle) return null;

  const exact = customers.find((customer) => customer.norm === needle);
  if (exact) return exact.id;

  const partial = customers.find(
    (customer) =>
      customer.norm.includes(needle) || needle.includes(customer.norm),
  );
  return partial?.id ?? null;
}

function weekdayNameToDayKey(value: string, days: Ymd[]): string | null {
  const cleaned = value.trim().toLowerCase();
  const asYmd = parseYmdKey(cleaned);
  if (asYmd) {
    const key = ymdKey(asYmd);
    return days.some((day) => ymdKey(day) === key) ? key : null;
  }

  const index = weekdayLabels.findIndex(
    (label) => label.toLowerCase() === cleaned || label.toLowerCase().startsWith(cleaned.slice(0, 3)),
  );
  if (index >= 0 && days[index]) return ymdKey(days[index]);
  return null;
}

export async function parseWeekPlan(
  text: string,
  weekMondayKey: string,
): Promise<ParseWeekPlanResult> {
  await requireAdmin();

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Skriv hva som skal gjøres denne uken." };
  }

  const monday = parseWeekParam(weekMondayKey);
  if (!monday) {
    return { error: "Ugyldig uke." };
  }

  const week = weekFromMonday(monday);
  const days = daysOfWeek(monday);
  const dayLines = days
    .map((day, index) => `${weekdayLabels[index]} ${ymdKey(day)}`)
    .join("\n");

  const customers = await db.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const customerList = customers.map((c) => c.name).join("\n");
  const customerIndex = customers.map((customer) => ({
    ...customer,
    norm: normalizeName(customer.name),
  }));

  const prompt = `Du planlegger arbeidsuke for et norsk vaktmesterfirma.
Uken er ${week.label} (mandag–søndag).
Gyldige dager (bruk dayKey nøyaktig som ISO-dato):
${dayLines}

Aktive kunder (match kundens navn så godt du kan):
${customerList || "(ingen kunder)"}

Brukerens fritekst:
"""
${trimmed}
"""

Returner KUN JSON på formen:
{"items":[{"dayKey":"YYYY-MM-DD","title":"kort tittel på norsk","customerName":"kundenavn eller null"}]}

Regler:
- Ett item per konkret jobb.
- dayKey MÅ være en av datoene over.
- title skal være kort (f.eks. "Plenklipp", "Maling ute").
- customerName skal ligne et kundenavn fra lista, eller null hvis uklart.
- Ignorer ting som ikke er jobber.`;

  try {
    const raw = await generateGeminiJson(prompt);
    const parsed = aiResponseSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return { error: "Kunne ikke lage forslag. Prøv igjen." };
    }

    const items: WeekPlanProposal[] = [];
    for (const item of parsed.data.items) {
      const dayKey =
        weekdayNameToDayKey(item.dayKey, days) ??
        (parseYmdKey(item.dayKey) &&
        days.some((day) => ymdKey(day) === item.dayKey)
          ? item.dayKey
          : null);
      if (!dayKey) continue;

      const hint = item.customerName?.trim() || null;
      items.push({
        dayKey,
        title: item.title.trim(),
        customerId: matchCustomerId(hint, customerIndex),
        customerHint: hint,
      });
    }

    if (items.length === 0) {
      return { error: "Fant ingen jobber i teksten. Prøv å skrive tydeligere." };
    }

    return { items };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Noe gikk galt. Prøv igjen.";
    return { error: message };
  }
}

const confirmItemSchema = z.object({
  dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(1),
  customerId: z.string().min(1),
});

export async function confirmWeekPlan(
  items: unknown,
): Promise<ConfirmWeekPlanResult> {
  await requireAdmin();

  const parsed = z.array(confirmItemSchema).safeParse(items);
  if (!parsed.success || parsed.data.length === 0) {
    return { error: "Ingen gyldige oppdrag å legge inn." };
  }

  let created = 0;
  for (const item of parsed.data) {
    const day = parseYmdKey(item.dayKey);
    if (!day) continue;

    const areaId = await primaryAreaId(item.customerId);
    if (!areaId) continue;

    const when = osloMidnight(day.year, day.month, day.day);
    await db.customerJob.create({
      data: {
        areaId,
        title: item.title,
        jobTypeId: null,
        kind: "ONCE",
        dueOn: when,
        weekday: null,
        startsOn: when,
        notes: null,
      },
    });
    created += 1;
  }

  if (created === 0) {
    return { error: "Ingen oppdrag ble lagret. Sjekk at kunde er valgt." };
  }

  revalidatePath("/kalender");
  revalidatePath("/ukeplan");
  return {
    message:
      created === 1
        ? "1 oppdrag lagt i kalenderen."
        : `${created} oppdrag lagt i kalenderen.`,
  };
}
