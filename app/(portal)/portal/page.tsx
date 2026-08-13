import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import {
  getCustomerActivity,
  recentActivitySince,
  RECENT_ACTIVITY_LIMIT,
} from "@/lib/customer-activity";
import { formatDate, formatLastVisit } from "@/lib/time";
import { cardStaticClass, outlineActionClass } from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { PortalIssueList } from "@/components/portal-issue-list";
import { ProfileMenu } from "@/components/profile-menu";
import { PortalMessageForm } from "./message-form";

export default async function CustomerPortalPage() {
  const user = await requireCustomer();

  const customer = await db.customer.findUnique({
    where: { id: user.customerId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return (
      <p className="text-body text-navy-700">
        Kundekontoen er ikke koblet til en kunde. Kontakt N&amp;M.
      </p>
    );
  }

  const areaId = await primaryAreaId(customer.id);

  const [lastVisitEntry, openIssues, openMessages, recentActivity] =
    await Promise.all([
      areaId
        ? db.logEntry.findFirst({
            where: { areaId },
            orderBy: { occurredAt: "desc" },
            select: { occurredAt: true },
          })
        : Promise.resolve(null),
      db.issue.findMany({
        where: {
          area: { customerId: customer.id },
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          description: true,
          status: true,
          createdAt: true,
          user: { select: { name: true } },
          photos: { select: { url: true }, take: 3 },
        },
      }),
      db.customerMessage.findMany({
        where: { customerId: customer.id, readAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
        },
      }),
      getCustomerActivity(customer.id, {
        since: recentActivitySince(),
        take: RECENT_ACTIVITY_LIMIT,
      }),
    ]);

  const lastVisit = lastVisitEntry?.occurredAt ?? null;
  const lastVisitLabel = formatLastVisit(lastVisit);
  const openIssueCount = openIssues.length;
  const issuesOk = openIssueCount === 0;
  const initial = user.name.charAt(0).toUpperCase();
  const todayLabel = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  }).format(new Date());
  const today = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-meta font-medium text-navy-700">{today}</p>
          <h1 className="text-display tracking-tight text-navy-900">
            {customer.name}
          </h1>
        </div>
        <ProfileMenu
          initial={initial}
          name={user.name}
          subtitle="Kundeportal"
          links={[
            { href: "/personvern", label: "Personvern" },
            { href: "/support", label: "Support" },
          ]}
        />
      </div>

      <section aria-label="Status" className="grid grid-cols-2 gap-2.5">
        <div className="rounded-md bg-white px-3.5 py-4 shadow-card">
          <p className="text-meta text-navy-700">Siste besøk</p>
          <p
            className={`mt-1.5 font-mono text-[1.35rem] font-bold leading-tight ${
              !lastVisit ? "text-amber-700" : "text-navy-900"
            }`}
          >
            {lastVisitLabel}
          </p>
          {lastVisit && (
            <p className="mt-1 font-mono text-meta text-navy-700">
              {formatDate(lastVisit)}
            </p>
          )}
        </div>
        {issuesOk ? (
          <div className="rounded-md bg-brand px-3.5 py-4 shadow-brand">
            <p className="text-meta text-white/85">Avvik</p>
            <p className="mt-1.5 font-mono text-[1.35rem] font-bold leading-tight text-white">
              0
            </p>
            <p className="mt-1 text-meta text-white/85">Alt i orden</p>
          </div>
        ) : (
          <div className="rounded-md bg-white px-3.5 py-4 shadow-card">
            <p className="text-meta text-navy-700">Avvik</p>
            <p className="mt-1.5 font-mono text-[1.35rem] font-bold leading-tight text-red-700">
              {openIssueCount}
            </p>
            <p className="mt-1 text-meta text-navy-700">Åpne</p>
          </div>
        )}
      </section>

      {!issuesOk && (
        <section id="aapne-avvik" className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-heading text-red-700">Åpne avvik</h2>
            <p className="text-meta text-navy-700">
              Disse følges opp av N&amp;M. Når de er utbedret, flyttes de til
              arkivet.
            </p>
          </div>
          <PortalIssueList
            issues={openIssues.map((issue) => ({
              id: issue.id,
              description: issue.description,
              status: issue.status,
              created: formatDate(issue.createdAt),
              reportedBy: issue.user.name,
              photoUrls: issue.photos.map((photo) => photo.url),
            }))}
          />
        </section>
      )}

      <section className="flex flex-col gap-4">
        <PortalMessageForm />
        {openMessages.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-meta font-semibold text-navy-900">
              Venter på oppfølging
            </h2>
            <ul className="flex flex-col gap-3">
              {openMessages.map((message) => (
                <li
                  key={message.id}
                  className={`flex flex-col gap-1 px-4 py-3.5 ${cardStaticClass}`}
                >
                  <span className="font-mono text-meta font-medium text-navy-700">
                    {formatDate(message.createdAt)}
                  </span>
                  <p className="text-body whitespace-pre-wrap text-navy-900">
                    {message.body}
                  </p>
                  <p className="text-meta font-semibold text-green-700">
                    Mottatt — venter på oppfølging
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-heading text-navy-900">Siste aktivitet</h2>
          <p className="text-meta text-navy-700">
            Besøk, oppgaver og avvik de siste 14 dagene
          </p>
        </div>
        <ActivityList
          items={recentActivity}
          emptyText="Ingen registreringer de siste 14 dagene."
        />
        <div className="flex flex-col gap-3 pt-1">
          <Link
            href="/portal/avvik"
            className={`flex min-h-[4.5rem] items-center justify-between rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
          >
            Avvikarkiv
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-navy-50"
            >
              ›
            </span>
          </Link>
          <Link
            href="/portal/aktivitet"
            className={`flex min-h-[4.5rem] items-center justify-between rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
          >
            Se all aktivitet
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-navy-50"
            >
              ›
            </span>
          </Link>
          <Link
            href="/portal/meldinger"
            className={`flex min-h-[4.5rem] items-center justify-between rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
          >
            Se meldinger
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-navy-50"
            >
              ›
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
