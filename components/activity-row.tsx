"use client";

import type { ActivityItem } from "@/lib/customer-activity-shared";
import {
  activityKindLabels,
  activityKindTone,
} from "@/lib/customer-activity-shared";
import { formatHours } from "@/lib/format";
import { issueStatusLabels } from "@/lib/labels";
import { formatDate } from "@/lib/time";
import { updateIssueDescription } from "@/app/actions/issues";
import { updateLogEntryComment } from "@/app/actions/log-entries";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { EditableText } from "@/components/editable-text";
import { PhotoThumbs } from "@/components/photo-thumbs";

export function ActivityRow({
  item,
  canDelete,
  canEdit,
}: {
  item: ActivityItem;
  canDelete: boolean;
  canEdit: boolean;
}) {
  // Oppgaveavkryssinger har sjelden fri tekst — da er det lite å redigere
  const hasEditableText =
    item.kind !== "TASK_COMPLETION" || Boolean(item.text);

  return (
    <li className="flex flex-col gap-1.5 px-4 py-3.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={`text-meta font-semibold ${activityKindTone[item.kind]}`}
        >
          {activityKindLabels[item.kind]}
        </span>
        <span className="font-mono text-meta font-medium text-navy-700">
          {formatDate(item.at)}
        </span>
        {item.hours !== null && (
          <span className="font-mono text-meta font-semibold text-navy-900">
            {formatHours(item.hours)} t
          </span>
        )}
        {canDelete && (
          <span className="ml-auto">
            <AdminDeleteButton
              target={item.kind === "ISSUE" ? "issue" : "log"}
              id={item.id}
              confirmText={
                item.kind === "ISSUE"
                  ? "Slette avviket permanent? Dette kan ikke angres."
                  : "Slette registreringen permanent? Dette kan ikke angres."
              }
            />
          </span>
        )}
      </div>

      <p className="text-meta font-medium text-navy-700">
        {item.userName}
        {item.status && <> · {issueStatusLabels[item.status]}</>}
      </p>

      {canEdit && hasEditableText ? (
        <EditableText
          initialText={item.text ?? ""}
          canEdit
          onSave={(text) =>
            item.kind === "ISSUE"
              ? updateIssueDescription(item.id, text)
              : updateLogEntryComment(item.id, text)
          }
        />
      ) : (
        item.text && (
          <p className="text-body whitespace-pre-wrap text-navy-900">
            {item.text}
          </p>
        )
      )}

      {item.tasks.length > 0 && (
        <p className="text-body text-navy-900">{item.tasks.join(", ")}</p>
      )}

      {item.photoUrls.length > 0 && (
        <div className="pt-1">
          <PhotoThumbs urls={item.photoUrls} />
        </div>
      )}
    </li>
  );
}
