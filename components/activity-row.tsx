"use client";

import type { ActivityItem } from "@/lib/customer-activity-shared";
import {
  activityKindLabels,
  activityKindTone,
} from "@/lib/customer-activity-shared";
import { formatHours } from "@/lib/format";
import { issueStatusLabels } from "@/lib/labels";
import { formatTime } from "@/lib/time";
import { updateIssueDescription } from "@/app/actions/issues";
import { updateLogEntryComment } from "@/app/actions/log-entries";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { EditableText } from "@/components/editable-text";
import { PhotoThumbs } from "@/components/photo-thumbs";

function KindIcon({ kind }: { kind: ActivityItem["kind"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-4",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "ISSUE") {
    return (
      <svg {...common}>
        <path d="M12 8v5M12 16.6h.01" />
      </svg>
    );
  }
  if (kind === "EXTRA_WORK") {
    return (
      <svg {...common} strokeWidth={2.2}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 1.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

export function ActivityRow({
  item,
  canDelete,
  canEdit,
  last = false,
}: {
  item: ActivityItem;
  canDelete: boolean;
  canEdit: boolean;
  /** Siste rad i gruppa — da skal ikke skinnen fortsette nedover. */
  last?: boolean;
}) {
  // Oppgaveavkryssinger har sjelden fri tekst — da er det lite å redigere
  const hasEditableText = item.kind !== "TASK_COMPLETION" || Boolean(item.text);

  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className="absolute bottom-0 left-[0.9375rem] top-8 w-0.5 rounded-full bg-hair"
        />
      ) : null}

      <span
        aria-hidden
        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${activityKindTone[item.kind]}`}
      >
        <KindIcon kind={item.kind} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {/* Ikke truncate: timeantallet står sist og er det kunden faktureres
              for — det skal aldri kuttes bort av et langt navn. */}
          <p className="min-w-0 flex-1 text-micro text-ink-3">
            <span className="font-bold text-ink">
              {activityKindLabels[item.kind]}
            </span>
            {" · "}
            {item.userName}
            {" · "}
            {formatTime(item.at)}
            {item.hours !== null ? (
              <>
                {" · "}
                <span className="font-bold text-ink">
                  {formatHours(item.hours)} t
                </span>
              </>
            ) : null}
            {item.status ? <> · {issueStatusLabels[item.status]}</> : null}
          </p>
          {canDelete ? (
            <AdminDeleteButton
              target={item.kind === "ISSUE" ? "issue" : "log"}
              id={item.id}
              confirmText={
                item.kind === "ISSUE"
                  ? "Slette avviket permanent? Dette kan ikke angres."
                  : "Slette registreringen permanent? Dette kan ikke angres."
              }
            />
          ) : null}
        </div>

        {canEdit && hasEditableText ? (
          <div className="mt-1">
            <EditableText
              initialText={item.text ?? ""}
              canEdit
              onSave={(text) =>
                item.kind === "ISSUE"
                  ? updateIssueDescription(item.id, text)
                  : updateLogEntryComment(item.id, text)
              }
            />
          </div>
        ) : (
          item.text && (
            <p className="mt-1 text-body whitespace-pre-wrap text-ink">
              {item.text}
            </p>
          )
        )}

        {item.tasks.length > 0 && (
          <p className="mt-1 text-body text-ink">{item.tasks.join(", ")}</p>
        )}

        {item.photoUrls.length > 0 && (
          <div className="pt-2.5">
            <PhotoThumbs urls={item.photoUrls} />
          </div>
        )}
      </div>
    </li>
  );
}
