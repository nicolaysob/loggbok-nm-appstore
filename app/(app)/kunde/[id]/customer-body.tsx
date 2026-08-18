import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/time";
import type { StaffAccess } from "@/lib/access";
import {
  getCustomerActivity,
  recentActivitySince,
  RECENT_ACTIVITY_LIMIT,
} from "@/lib/customer-activity";
import { cardStaticClass, eyebrowClass, sectionHeadClass } from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { IssueList } from "./avvik/issue-list";
import { SignMessageButton } from "./sign-message-button";
import { TodoList } from "./todo-list";

type CustomerBodyProps = {
  customerId: string;
  currentUserId: string;
  isAdmin: boolean;
  access: StaffAccess;
};

export async function CustomerBody({
  customerId,
  currentUserId,
  isAdmin,
  access,
}: CustomerBodyProps) {
  const doneSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [openIssues, openMessages, recentActivity, openTodos, doneTodos] =
    await Promise.all([
      access.issues
        ? db.issue.findMany({
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
          })
        : Promise.resolve([]),
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
      access.todos
        ? db.todo.findMany({
            where: { customerId, doneAt: null },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              text: true,
              createdAt: true,
              createdById: true,
              createdBy: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
      access.todos
        ? db.todo.findMany({
            where: { customerId, doneAt: { gte: doneSince } },
            orderBy: { doneAt: "desc" },
            take: 5,
            select: {
              id: true,
              text: true,
              doneBy: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
    ]);

  const needsAttention = openMessages.length > 0 || openIssues.length > 0;

  return (
    <>
      {needsAttention && (
        <section>
          <h2 className={sectionHeadClass}>
            <span>Krever handling</span>
          </h2>

          <div className="flex flex-col gap-2.5">
            {openMessages.map((message) => (
              <article
                key={message.id}
                className={`border-l-4 border-l-ink-3 px-4 py-3.5 ${cardStaticClass}`}
              >
                <p className={eyebrowClass}>Melding fra kunde</p>
                <p className="mt-1.5 text-body whitespace-pre-wrap text-ink">
                  {message.body}
                </p>
                <p className="mt-1.5 text-micro text-ink-3">
                  {formatDate(message.createdAt)} · {message.user.name}
                </p>
                <SignMessageButton messageId={message.id} />
              </article>
            ))}

            {openIssues.length > 0 && (
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
                  notes: issue.notes.map((note) => ({
                    id: note.id,
                    body: note.body,
                    at: `${formatDate(note.createdAt)} · ${formatTime(note.createdAt)}`,
                    author: note.user.name,
                  })),
                }))}
              />
            )}
          </div>
        </section>
      )}

      {access.todos ? (
        <section>
          <h2 className={sectionHeadClass}>
            <span>Gjøremål</span>
            {openTodos.length > 0 ? <span>{openTodos.length}</span> : null}
          </h2>
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
      ) : null}

      <section>
        <h2 className={sectionHeadClass}>
          <span>Aktivitet</span>
          <Link
            href={`/kunde/${customerId}/aktivitet`}
            className="text-eyebrow uppercase text-ink-2"
          >
            Arkiv ›
          </Link>
        </h2>
        <ActivityList
          items={recentActivity}
          emptyText="Ingen registreringer ennå."
          canDelete={isAdmin}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      </section>
    </>
  );
}
