import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { listCustomerClosedIssueMonths } from "@/lib/customer-activity";
import { calendarMonth, parseYearMonth } from "@/lib/period";
import { formatDate } from "@/lib/time";
import { backLinkClass, cardStaticClass } from "@/lib/ui";
import { MonthFolderList } from "@/components/month-folder-list";
import { PortalIssueList } from "@/components/portal-issue-list";

export default async function PortalIssueArchivePage({
  searchParams,
}: PageProps<"/portal/avvik">) {
  const user = await requireCustomer();
  const { maaned } = await searchParams;
  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );

  if (parsed) {
    const period = calendarMonth(parsed.year, parsed.month);
    const issues = await db.issue.findMany({
      where: {
        area: { customerId: user.customerId },
        status: "CLOSED",
        OR: [
          {
            closedAt: { gte: period.start, lt: period.end },
          },
          {
            closedAt: null,
            updatedAt: { gte: period.start, lt: period.end },
          },
        ],
      },
      orderBy: [{ closedAt: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        closedAt: true,
        user: { select: { name: true } },
        photos: { select: { url: true }, take: 3 },
      },
    });

    return (
      <div className="flex animate-rise flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link href="/portal/avvik" className={backLinkClass}>
            ← Avvikarkiv
          </Link>
          <h1 className="text-display tracking-tight text-navy-900">
            {period.label}
          </h1>
          <p className="text-body text-navy-700">
            Utbedrede avvik lukket denne måneden.
          </p>
        </div>

        {issues.length === 0 ? (
          <p className={`px-4 py-5 text-body text-navy-700 ${cardStaticClass}`}>
            Ingen lukkede avvik denne måneden.
          </p>
        ) : (
          <PortalIssueList
            issues={issues.map((issue) => ({
              id: issue.id,
              description: issue.description,
              status: issue.status,
              created: formatDate(issue.createdAt),
              closed: issue.closedAt ? formatDate(issue.closedAt) : null,
              reportedBy: issue.user.name,
              photoUrls: issue.photos.map((photo) => photo.url),
            }))}
          />
        )}
      </div>
    );
  }

  const folders = await listCustomerClosedIssueMonths(user.customerId);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/portal" className={backLinkClass}>
          ← Forside
        </Link>
        <h1 className="text-display tracking-tight text-navy-900">
          Avvikarkiv
        </h1>
        <p className="text-body text-navy-700">
          Når N&amp;M lukker et avvik, ligger det her. Velg en måned.
        </p>
      </div>

      <MonthFolderList
        folders={folders}
        hrefFor={(param) => `/portal/avvik?maaned=${param}`}
        emptyText="Ingen lukkede avvik ennå."
        countLabel={(count) =>
          count === 1 ? "1 avvik" : `${count} avvik`
        }
      />
    </div>
  );
}
