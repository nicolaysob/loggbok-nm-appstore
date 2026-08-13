import {
  ContractType,
  Frequency,
  IssueStatus,
  JobScheduleKind,
  LogType,
  PayType,
  Role,
} from "@/generated/prisma/enums";

export const contractTypeLabels: Record<ContractType, string> = {
  YEAR_ROUND: "Helår",
  SUMMER: "Sommer",
  WINTER: "Vinter",
  CLEANING: "Renhold",
};

export const frequencyLabels: Record<Frequency, string> = {
  DAILY: "Daglig",
  WEEKLY: "Ukentlig",
  MONTHLY: "Månedlig",
  AS_NEEDED: "Ved behov",
};

export const logTypeLabels: Record<LogType, string> = {
  VISIT_NOTE: "Besøk",
  TASK_COMPLETION: "Oppgaver",
  EXTRA_WORK: "Ekstraarbeid",
};

export const issueStatusLabels: Record<IssueStatus, string> = {
  OPEN: "Åpen",
  IN_PROGRESS: "Under arbeid",
  CLOSED: "Lukket",
};

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Ansatt",
  CUSTOMER: "Kunde",
};

export const payTypeLabels: Record<PayType, string> = {
  FIXED: "Fast lønn",
  HOURLY: "Timesbetalt",
};

export const jobScheduleLabels: Record<JobScheduleKind, string> = {
  ONCE: "Engangs",
  WEEKLY: "Ukentlig",
  BIWEEKLY: "Annenhver uke",
  MONTHLY: "Månedlig",
};

export const weekdayLabels = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
] as const;

export const issueStatusOrder: IssueStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "CLOSED",
];

export const frequencyOrder: Frequency[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "AS_NEEDED",
];

export const contractTypeOptions = Object.entries(contractTypeLabels) as [
  ContractType,
  string,
][];

export const frequencyOptions = Object.entries(frequencyLabels) as [
  Frequency,
  string,
][];

export const jobScheduleOptions = Object.entries(jobScheduleLabels) as [
  JobScheduleKind,
  string,
][];

export const roleOptions = Object.entries(roleLabels) as [Role, string][];

// Rollevalg for interne brukere (ikke kundekonto)
export const staffRoleOptions = roleOptions.filter(
  ([role]) => role === "ADMIN" || role === "EMPLOYEE",
);

export const payTypeOptions = Object.entries(payTypeLabels) as [
  PayType,
  string,
][];

export const weekdayOptions = weekdayLabels.map(
  (label, index) => [String(index), label] as const,
);
