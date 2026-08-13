import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/time";
import {
  getCustomerActivity,
  recentActivitySince,
  RECENT_ACTIVITY_LIMIT,
} from "@/lib/customer-activity";
import { cardStaticClass, outlineActionClass } from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { IssueList } from "./avvik/issue-list";
import { SignMessageButton } from "./sign-message-button";
import { TodoList } from "./todo-list";

type CustomerBodyProps = {
  customerId: string;
  currentUserId: string;
  isAdmin: boolean;
};

export async function CustomerBody({
  customerId,
  currentUserId,
  isAdmin,
}: CustomerBodyProps) {
  // Nylig utførte gjøremål vises med angre-knapp i en uke
  const doneSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [openIssues, openMessages, recentActivity, openTodos, doneTodos] =
    await Promise.all([
      db.issue.findMany({
        where: {
          area: { customerId },
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
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
      }),
      db.customerMessage.findMany({
        where: { customerId, readAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      getCustomerActivity(customerId, {
        since: recentActivitySince(),
        take: RECENT_ACTIVITY_LIMIT,
      }),
      db.todo.findMany({
        where: { customerId, doneAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          createdById: true,
          createdBy: { select: { name: true } },
        },
      }),
      db.todo.findMany({
        where: { customerId, doneAt: { gte: doneSince } },
        orderBy: { doneAt: "desc" },
        take: 5,
        select: {
          id: true,
          text: true,
          doneBy: { select: { name: true } },
        },
      }),
    ]);

  return (
    <>
      {openMessages.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-heading text-navy-900">
            {openMessages.length === 1
              ? "Ny melding fra kunden"
              : `${openMessages.length} nye meldinger fra kunden`}
          </h2>
          <ul className="flex flex-col gap-3">
            {openMessages.map((message) => (
              <li
                key={message.id}
                className={`border-navy-100 bg-navy-50 px-4 py-3.5 ${cardStaticClass}`}
              >
                <p className="text-meta font-medium text-navy-700">
                  <span className="font-mono">
                    {formatDate(message.createdAt)}
                  </span>
                  {" · "}
                  {message.user.name}
                </p>
                <p className="mt-1.5 text-body whitespace-pre-wrap text-navy-900">
                  {message.body}
                </p>
                <SignMessageButton messageId={message.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {openIssues.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-heading text-red-700">Åpne avvik</h2>
            <Link
              href={`/kunde/${customerId}/avvik`}
              className="text-meta font-semibold text-red-700 underline"
            >
              Se alle
            </Link>
          </div>
          <IssueList
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            issues={openIssues.map((issue) => ({
              id: issue.id,
              description: issue.description,
              status: issue.status,
              created: formatDate(issue.createdAt),
              reportedBy: issue.user.name,
              userId: issue.userId,
              photoUrls: issue.photos.map((photo) => photo.url),
            }))}
          />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-heading">Gjøremål</h2>
        <p className="text-meta text-navy-700">
          Interne ting som skal gjøres — vises ikke for kunden.
        </p>
        <TodoList
          customerId={customerId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          open={openTodos.map((todo) => ({
            id: todo.id,
            text: todo.text,
            created: formatDate(todo.createdAt),
            createdBy: todo.createdBy?.name ?? null,
            createdById: todo.createdById,
          }))}
          recentlyDone={doneTodos.map((todo) => ({
            id: todo.id,
            text: todo.text,
            doneBy: todo.doneBy?.name ?? null,
          }))}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading">Siste aktivitet</h2>
        <p className="text-meta text-navy-700">Siste 14 dager</p>
        <ActivityList
          items={recentActivity}
          emptyText="Ingen registreringer de siste 14 dagene."
          canDelete={isAdmin}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
        <Link
          href={`/kunde/${customerId}/aktivitet`}
          className={`flex min-h-14 items-center justify-between rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
        >
          Aktivitetsarkiv
          <span aria-hidden className="text-display leading-none text-navy-100">
            ›
          </span>
        </Link>
      </section>
    </>
  );
}
