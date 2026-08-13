"use client";

import type { IssueStatus } from "@/generated/prisma/enums";
import { issueStatusLabels } from "@/lib/labels";
import { setIssueStatus, updateIssueDescription } from "@/app/actions/issues";
import { convertIssueToTodo } from "@/app/actions/todos";
import { cardStaticClass, outlineActionClass } from "@/lib/ui";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { EditableText } from "@/components/editable-text";
import { PhotoThumbs } from "@/components/photo-thumbs";

export type IssueItem = {
  id: string;
  description: string;
  status: IssueStatus;
  created: string;
  reportedBy: string;
  userId: string;
  photoUrls: string[];
};

// Åpent avvik er rødt. Under arbeid og lukket dempes ned til marineblått,
// så bare det som faktisk krever handling roper.
const badgeClasses: Record<IssueStatus, string> = {
  OPEN: "bg-red-50 text-red-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  CLOSED: "bg-navy-100 text-navy-700",
};

const allStatuses: IssueStatus[] = ["OPEN", "IN_PROGRESS", "CLOSED"];

// Handlingsknapper — tydeligere enn bare statusnavnet
const statusActionLabels: Record<IssueStatus, string> = {
  OPEN: "Sett åpen",
  IN_PROGRESS: "Under arbeid",
  CLOSED: "Lukk (utbedret)",
};

export function IssueList({
  issues,
  isAdmin = false,
  currentUserId,
}: {
  issues: IssueItem[];
  isAdmin?: boolean;
  currentUserId?: string;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {issues.map((issue) => {
        const canEdit =
          Boolean(currentUserId) &&
          (isAdmin || issue.userId === currentUserId);

        return (
          <li
            key={issue.id}
            className={`flex flex-col gap-3 px-4 py-3 ${cardStaticClass} ${
              issue.status === "OPEN"
                ? "border-red-700/25 bg-red-50/50"
                : issue.status === "IN_PROGRESS"
                  ? "border-amber-700/20 bg-amber-50/40"
                  : ""
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-meta font-semibold ${badgeClasses[issue.status]}`}
              >
                {issueStatusLabels[issue.status]}
              </span>
              <span className="font-mono text-meta font-medium text-navy-700">
                {issue.created}
              </span>
              <span className="text-meta font-medium text-navy-700">
                {issue.reportedBy}
              </span>
            </div>

            <EditableText
              initialText={issue.description}
              canEdit={canEdit}
              onSave={(text) => updateIssueDescription(issue.id, text)}
            />

            <PhotoThumbs urls={issue.photoUrls} />

            <div className="flex flex-wrap gap-2">
              {allStatuses
                .filter((status) => status !== issue.status)
                .map((status) => (
                  <form
                    key={status}
                    action={setIssueStatus.bind(null, issue.id, status)}
                  >
                    <button
                      type="submit"
                      className={`min-h-14 rounded-md px-4 text-meta font-semibold ${
                        status === "CLOSED"
                          ? "border border-green-700/30 bg-green-50 text-green-700 active:bg-green-50"
                          : outlineActionClass
                      }`}
                    >
                      {statusActionLabels[status]}
                    </button>
                  </form>
                ))}
              {/* Admin rydder feilmeldte gjøremål ut av avvikslista */}
              {isAdmin && (
                <>
                  <form action={convertIssueToTodo.bind(null, issue.id)}>
                    <button
                      type="submit"
                      className={`min-h-14 rounded-md px-4 text-meta font-semibold ${outlineActionClass}`}
                    >
                      Gjør om til gjøremål
                    </button>
                  </form>
                  <AdminDeleteButton
                    target="issue"
                    id={issue.id}
                    confirmText="Slette avviket permanent? Dette kan ikke angres."
                    className="min-h-14 rounded-md border border-red-700/25 bg-white px-4 text-meta font-semibold text-red-700 transition-colors active:bg-red-50 disabled:opacity-50"
                  />
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
