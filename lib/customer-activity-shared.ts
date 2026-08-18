import type { IssueStatus, LogType } from "@/generated/prisma/enums";
import { logTypeLabels } from "@/lib/labels";

export type ActivityKind = LogType | "ISSUE";

export type ActivityItem = {
  key: string;
  // Database-id-en bak raden — logEntry.id eller issue.id etter kind
  id: string;
  kind: ActivityKind;
  at: Date;
  userId: string;
  userName: string;
  text: string | null;
  hours: number | null;
  tasks: string[];
  status: IssueStatus | null;
  photoUrls: string[];
};

export const activityKindLabels: Record<ActivityKind, string> = {
  ...logTypeLabels,
  ISSUE: "Avvik",
};

/** Farge på ikonboblen i tidslinja — bakgrunn + ikonfarge. */
export const activityKindTone: Record<ActivityKind, string> = {
  VISIT_NOTE: "bg-brand-soft text-brand",
  TASK_COMPLETION: "bg-brand-soft text-brand",
  EXTRA_WORK: "bg-sunken text-ink-2",
  ISSUE: "bg-danger-soft text-danger",
};
