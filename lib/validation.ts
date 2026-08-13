import { z } from "zod";
import {
  ContractType,
  Frequency,
  JobScheduleKind,
  PayType,
  Role,
} from "@/generated/prisma/enums";
import { parseDecimal } from "@/lib/format";

// Tomme tekstfelt skal lagres som null, ikke som tom streng
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

export const customerSchema = z.object({
  name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
  contractType: z.enum(ContractType, { error: "Velg kontraktstype" }),
  active: z.boolean(),
});

export const areaSchema = z.object({
  name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
  address: optionalText,
  notes: optionalText,
});

export const visitNoteSchema = z.object({
  comment: z.string().trim().min(1, { error: "Skriv et notat om besøket" }),
  occurredAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, {
      error: "Velg dato og klokkeslett",
    }),
});

export const extraWorkSchema = z.object({
  hours: z.preprocess(
    (value) => parseDecimal(String(value ?? "")),
    z
      .number({ error: "Fyll inn antall timer" })
      .min(0.5, { error: "Ekstraarbeid må være minst 0,5 time" })
      .max(24, { error: "En registrering kan ikke være over 24 timer" }),
  ),
  comment: z.string().trim().min(1, { error: "Beskriv hva som ble gjort" }),
  occurredAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, {
      error: "Velg dato og klokkeslett",
    }),
});

export const issueSchema = z.object({
  description: z.string().trim().min(1, { error: "Beskriv avviket" }),
});

export const todoSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { error: "Skriv hva som skal gjøres" })
    .max(500, { error: "Teksten er for lang" }),
});

export const taskTemplateSchema = z.object({
  title: z.string().trim().min(1, { error: "Tittel må fylles ut" }),
  frequency: z.enum(Frequency, { error: "Velg frekvens" }),
});

export const jobTypeSchema = z.object({
  name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
});

export const customerJobSchema = z
  .object({
    title: z.string().trim().min(1, { error: "Skriv hva oppdraget er" }),
    jobTypeId: z
      .string()
      .optional()
      .transform((value) => (value && value.length > 0 ? value : null)),
    kind: z.enum(JobScheduleKind, { error: "Velg frekvens" }),
    dueOn: z.string().optional(),
    weekday: z.string().optional(),
    startsOn: z.string().optional(),
    notes: optionalText,
  })
  .superRefine((value, ctx) => {
    if (value.kind === "ONCE") {
      if (!value.dueOn) {
        ctx.addIssue({
          code: "custom",
          path: ["dueOn"],
          message: "Velg dato for engangsoppdrag",
        });
      }
    } else if (!value.startsOn) {
      ctx.addIssue({
        code: "custom",
        path: ["startsOn"],
        message: "Velg startdato",
      });
    }

    if (
      (value.kind === "WEEKLY" || value.kind === "BIWEEKLY") &&
      (value.weekday === undefined ||
        value.weekday === "" ||
        Number.isNaN(Number(value.weekday)))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["weekday"],
        message: "Velg ukedag",
      });
    }
  });

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, { error: "Brukernavn må ha minst 2 tegn" })
      .max(32, { error: "Brukernavn er for langt" })
      .regex(/^[a-z0-9._-]+$/, {
        error: "Bare små bokstaver, tall, punktum, - og _",
      }),
    password: z
      .string()
      .min(4, { error: "Passord må ha minst 4 tegn" })
      .max(72, { error: "Passord er for langt" }),
    role: z.enum(Role, { error: "Velg rolle" }),
    payType: z.enum(PayType, { error: "Velg lønnstype" }).optional(),
    customerId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role === "CUSTOMER") {
      if (!value.customerId) {
        ctx.addIssue({
          code: "custom",
          path: ["customerId"],
          message: "Velg kunde for kundekonto",
        });
      }
    } else if (!value.payType) {
      ctx.addIssue({
        code: "custom",
        path: ["payType"],
        message: "Velg lønnstype",
      });
    }
  });

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(4, { error: "Passord må ha minst 4 tegn" })
    .max(72, { error: "Passord er for langt" }),
});

export const customerMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { error: "Skriv en melding" })
    .max(2000, { error: "Meldingen er for lang" }),
});

export const timeEntrySchema = z.object({
  workedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Velg dato" }),
  hours: z.preprocess(
    (value) => parseDecimal(String(value ?? "")),
    z
      .number({ error: "Fyll inn antall timer" })
      .min(0.5, { error: "Minst 0,5 time" })
      .max(24, { error: "Maks 24 timer per registrering" }),
  ),
  comment: z.string().trim().min(1, { error: "Skriv en kort kommentar" }),
});

// Avslutt stempling — timer kan komme fra klokken eller justeres manuelt
export const stopTimeClockSchema = z.object({
  hours: z.preprocess(
    (value) => {
      const raw = String(value ?? "").trim();
      if (raw === "") return undefined;
      return parseDecimal(raw);
    },
    z
      .number({ error: "Fyll inn antall timer" })
      .min(0.5, { error: "Minst 0,5 time" })
      .max(24, { error: "Maks 24 timer per registrering" })
      .optional(),
  ),
  comment: z.string().trim().min(1, { error: "Skriv en kort kommentar" }),
});

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
    }
  | undefined;
