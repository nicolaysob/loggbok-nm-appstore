import type { Role } from "@/generated/prisma/enums";

export type StaffCapability =
  | "log"
  | "issues"
  | "hours"
  | "todos"
  | "calendar";

export type AccessFlags = {
  canLog: boolean;
  canIssues: boolean;
  canHours: boolean;
  canTodos: boolean;
  canCalendar: boolean;
};

export type StaffAccess = Record<StaffCapability, boolean>;

export const STAFF_CAPABILITIES: StaffCapability[] = [
  "log",
  "issues",
  "hours",
  "todos",
  "calendar",
];

export const capabilityField: Record<StaffCapability, keyof AccessFlags> = {
  log: "canLog",
  issues: "canIssues",
  hours: "canHours",
  todos: "canTodos",
  calendar: "canCalendar",
};

export const capabilityLabels: Record<StaffCapability, string> = {
  log: "Logg",
  issues: "Avvik",
  hours: "Timer",
  todos: "Gjøremål",
  calendar: "Kalender",
};

const ALL_ACCESS: StaffAccess = {
  log: true,
  issues: true,
  hours: true,
  todos: true,
  calendar: true,
};

export function staffAccess(
  user: { role: Role } & Partial<AccessFlags>,
): StaffAccess {
  if (user.role === "ADMIN") return ALL_ACCESS;
  if (user.role === "CUSTOMER") {
    return {
      log: false,
      issues: false,
      hours: false,
      todos: false,
      calendar: false,
    };
  }
  return {
    log: user.canLog !== false,
    issues: user.canIssues !== false,
    hours: user.canHours !== false,
    todos: user.canTodos !== false,
    calendar: user.canCalendar !== false,
  };
}

export function needsAttention(row: {
  openIssues: number;
  openTodos: number;
  unreadMessages: number;
}): boolean {
  return (
    row.openIssues > 0 || row.openTodos > 0 || row.unreadMessages > 0
  );
}
