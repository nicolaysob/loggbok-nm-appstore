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
  OPEN: "bg-red-50 text-red-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  CLOSED: "bg-green-50 text-green-700",
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
      <p className="rounded-md bg-white px-5 py-5 text-body text-navy-700 shadow-card">
        {emptyText}
      </p>
    ) : null;
  }

  return (
    <ul className="flex flex-col gap-3">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className={`flex flex-col gap-2 rounded-md px-4 py-4 shadow-card ${
            issue.status === "OPEN"
              ? "bg-red-50"
              : issue.status === "IN_PROGRESS"
                ? "bg-amber-50"
                : "bg-white"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-meta font-semibold ${badgeClasses[issue.status]}`}
            >
              {issue.status === "CLOSED"
                ? "Utbedret"
                : issueStatusLabels[issue.status]}
            </span>
            <span className="font-mono text-meta font-medium text-navy-700">
              {issue.created}
            </span>
          </div>
          <p className="text-body whitespace-pre-wrap text-navy-900">
            {issue.description}
          </p>
          <p className="text-meta text-navy-700">
            Meldt av {issue.reportedBy}
            {issue.closed ? ` · lukket ${issue.closed}` : null}
          </p>
          <PhotoThumbs urls={issue.photoUrls} />
        </li>
      ))}
    </ul>
  );
}
