import type { IssueStatus } from "@/generated/prisma/enums";
import { issueStatusLabels } from "@/lib/labels";
import { PhotoThumbs } from "@/components/photo-thumbs";

export type PortalIssueItem = {
  id: string;
  description: string;
  status: IssueStatus;
  created: string;
  closed?: string | null;
  reportedBy: string;
  photoUrls: string[];
};

const badgeClasses: Record<IssueStatus, string> = {
  OPEN: "bg-danger-soft text-danger",
  IN_PROGRESS: "bg-warn-soft text-warn",
  CLOSED: "bg-ok-soft text-ok",
};

/** Kun visning for kundeportalen — ingen statusknapper. */
export function PortalIssueList({
  issues,
  emptyText,
}: {
  issues: PortalIssueItem[];
  emptyText?: string;
}) {
  if (issues.length === 0) {
    return emptyText ? (
      <p className="rounded-2xl border border-hair bg-surface px-4 py-6 text-center text-body text-ink-3 shadow-card">
        {emptyText}
      </p>
    ) : null;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className={`flex flex-col gap-2 rounded-2xl border border-hair bg-surface px-4 py-4 shadow-card ${
            issue.status === "OPEN"
              ? "border-l-4 border-l-danger"
              : issue.status === "IN_PROGRESS"
                ? "border-l-4 border-l-warn"
                : "border-l-4 border-l-brand"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-micro font-bold ${badgeClasses[issue.status]}`}
            >
              {issue.status === "CLOSED"
                ? "Utbedret"
                : issueStatusLabels[issue.status]}
            </span>
            <span className="text-micro text-ink-3">{issue.created}</span>
          </div>
          <p className="text-body whitespace-pre-wrap text-ink">
            {issue.description}
          </p>
          <p className="text-micro text-ink-3">
            Meldt av {issue.reportedBy}
            {issue.closed ? ` · lukket ${issue.closed}` : null}
          </p>
          <PhotoThumbs urls={issue.photoUrls} />
        </li>
      ))}
    </ul>
  );
}
