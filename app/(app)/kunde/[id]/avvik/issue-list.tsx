"use client";

import type { IssueStatus } from "@/generated/prisma/enums";
import { issueStatusLabels } from "@/lib/labels";
import { setIssueStatus, updateIssueDescription } from "@/app/actions/issues";
import { convertIssueToTodo } from "@/app/actions/todos";
import { outlineActionClass, solidActionClass } from "@/lib/ui";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { EditableText } from "@/components/editable-text";
import { PhotoThumbs } from "@/components/photo-thumbs";
import { IssueNotes, type IssueNoteItem } from "./issue-notes";

export type IssueItem = {
  id: string;
  description: string;
  status: IssueStatus;
  created: string;
  reportedBy: string;
  userId: string;
  photoUrls: string[];
  notes: IssueNoteItem[];
};

// Åpent avvik er rødt. Under arbeid og lukket dempes ned til marineblått,
// så bare det som faktisk krever handling roper.
const badgeClasses: Record<IssueStatus, string> = {
  OPEN: "bg-danger-soft text-danger",
  IN_PROGRESS: "bg-warn-soft text-warn",
  CLOSED: "bg-edge text-ink-2",
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
            className={`flex flex-col gap-3 rounded-2xl border border-hair bg-surface px-4 py-4 shadow-card ${
              issue.status === "OPEN"
                ? "border-l-4 border-l-danger"
                : issue.status === "IN_PROGRESS"
                  ? "border-l-4 border-l-warn"
                  : "border-l-4 border-l-edge"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-micro font-bold ${badgeClasses[issue.status]}`}
              >
                {issueStatusLabels[issue.status]}
              </span>
              <span className="text-micro tabular-nums text-ink-3">
                {issue.created} · {issue.reportedBy}
              </span>
            </div>

            <EditableText
              initialText={issue.description}
              canEdit={canEdit}
              onSave={(text) => updateIssueDescription(issue.id, text)}
            />

            <PhotoThumbs urls={issue.photoUrls} />

            <IssueNotes
              issueId={issue.id}
              notes={issue.notes}
              isAdmin={isAdmin}
            />

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
                      className={`min-h-13 rounded-xl px-4 text-meta font-bold ${
                        status === "CLOSED"
                          ? solidActionClass
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
                      className={`min-h-13 rounded-xl px-4 text-meta font-bold ${outlineActionClass}`}
                    >
                      Gjør om til gjøremål
                    </button>
                  </form>
                  <AdminDeleteButton
                    target="issue"
                    id={issue.id}
                    confirmText="Slette avviket permanent? Dette kan ikke angres."
                    className="min-h-14 rounded-2xl bg-surface px-4 text-meta font-semibold text-danger shadow-card transition-colors active:bg-danger-soft disabled:opacity-50"
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
