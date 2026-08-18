import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffAccess } from "@/lib/dal";
import { issueStatusOrder } from "@/lib/labels";
import { formatDate, formatTime } from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { IssueForm } from "./issue-form";
import { IssueList, type IssueItem } from "./issue-list";

export default async function IssuesPage({
  params,
}: PageProps<"/kunde/[id]/avvik">) {
  const user = await requireStaffAccess("issues");
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const issues = await db.issue.findMany({
    where: { area: { customerId: id } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      description: true,
      status: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true } },
      photos: { select: { url: true }, take: 3 },
      notes: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  // Åpne først, lukkede nederst. Innenfor hver status nyeste først,
  // som allerede er rekkefølgen fra spørringen.
  const sorted: IssueItem[] = issues
    .slice()
    .sort(
      (a, b) =>
        issueStatusOrder.indexOf(a.status) - issueStatusOrder.indexOf(b.status),
    )
    .map((issue) => ({
      id: issue.id,
      description: issue.description,
      status: issue.status,
      created: formatDate(issue.createdAt),
      reportedBy: issue.user.name,
      userId: issue.userId,
      photoUrls: issue.photos.map((photo) => photo.url),
      notes: issue.notes.map((note) => ({
        id: note.id,
        body: note.body,
        at: `${formatDate(note.createdAt)} · ${formatTime(note.createdAt)}`,
        author: note.user.name,
      })),
    }));

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="-mx-2 flex items-center gap-1">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <h1 className="min-w-0 truncate text-heading">{customer.name}</h1>
      </div>

      <IssueForm customerId={customer.id} />

          {sorted.length > 0 && (
        <IssueList
          issues={sorted}
          isAdmin={user.role === "ADMIN"}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
