import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { issueStatusOrder } from "@/lib/labels";
import { formatDate } from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { IssueForm } from "./issue-form";
import { IssueList, type IssueItem } from "./issue-list";

export default async function IssuesPage({
  params,
}: PageProps<"/kunde/[id]/avvik">) {
  const user = await requireUser();
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
    }));

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-4">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Meld avvik</h1>
          <p className="text-body text-navy-700">{customer.name}</p>
        </div>
      </div>

      <IssueForm customerId={customer.id} />

      {sorted.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-heading">
            Registrerte avvik
          </h2>
          <IssueList
            issues={sorted}
            isAdmin={user.role === "ADMIN"}
            currentUserId={user.id}
          />
        </section>
      )}
    </div>
  );
}
