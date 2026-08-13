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

export const activityKindTone: Record<ActivityKind, string> = {
  VISIT_NOTE: "text-navy-900",
  TASK_COMPLETION: "text-green-700",
  EXTRA_WORK: "text-navy-900",
  ISSUE: "text-red-700",
};
