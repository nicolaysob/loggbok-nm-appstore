import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import {
  getCustomerActivity,
  recentActivitySince,
  RECENT_ACTIVITY_LIMIT,
} from "@/lib/customer-activity";
import { decimalToNumber, formatHours } from "@/lib/format";
import { osloYmd } from "@/lib/period";
import { formatDate, formatLastVisit, formatMonthYear } from "@/lib/time";
import { cardStaticClass, eyebrowClass, sectionHeadClass } from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { BrandIcon } from "@/components/brand";
import { PortalIssueList } from "@/components/portal-issue-list";
import { ProfileMenu } from "@/components/profile-menu";
import { PortalMessageForm } from "./message-form";

const MONTH_SHORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "des",
] as const;

export default async function CustomerPortalPage() {
  const user = await requireCustomer();

  const customer = await db.customer.findUnique({
    where: { id: user.customerId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return (
      <p className="text-body text-ink-2">
        Kundekontoen er ikke koblet til en kunde.
      </p>
    );
  }

  const areaId = await primaryAreaId(customer.id);
  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  // Samme periode i fjor — hele fjoråret fram til dagens dato minus ett år,
  // så «mot i fjor» sammenlikner likt med likt
  const lastYearStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
  const lastYearSameDay = new Date(now);
  lastYearSameDay.setUTCFullYear(now.getUTCFullYear() - 1);

  const [
    lastVisitEntry,
    visitDates,
    visitsLastYearSamePeriod,
    extraHoursSum,
    openIssues,
    openMessages,
    recentActivity,
  ] = await Promise.all([
    areaId
      ? db.logEntry.findFirst({
          where: { areaId },
          orderBy: { occurredAt: "desc" },
          select: { occurredAt: true, user: { select: { name: true } } },
        })
      : Promise.resolve(null),
    areaId
      ? db.logEntry.findMany({
          where: { areaId, occurredAt: { gte: yearStart } },
          select: { occurredAt: true },
        })
      : Promise.resolve([]),
    areaId
      ? db.logEntry.count({
          where: {
            areaId,
            occurredAt: { gte: lastYearStart, lt: lastYearSameDay },
          },
        })
      : Promise.resolve(0),
    areaId
      ? db.logEntry.aggregate({
          _sum: { hours: true },
          where: {
            areaId,
            type: "EXTRA_WORK",
            occurredAt: { gte: yearStart },
          },
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
  const openIssueCount = openIssues.length;
  const initial = user.name.charAt(0).toUpperCase();
  const thisMonth = formatMonthYear(now);

  // Besøk per måned i år, i norsk tid
  const currentMonth = osloYmd(now).month;
  const monthCounts = Array.from({ length: currentMonth }, () => 0);
  for (const row of visitDates) {
    const { month } = osloYmd(row.occurredAt);
    if (month >= 1 && month <= currentMonth) monthCounts[month - 1] += 1;
  }
  const maxMonthCount = Math.max(...monthCounts, 1);
  const visitsThisYear = visitDates.length;
  // Vises bare når det er fremgang å vise — dette er utstillingsvinduet
  const visitDiff =
    visitsLastYearSamePeriod > 0
      ? visitsThisYear - visitsLastYearSamePeriod
      : 0;
  const extraHoursThisYear = extraHoursSum?._sum.hours
    ? decimalToNumber(extraHoursSum._sum.hours)
    : 0;

  return (
    <div className="flex animate-rise flex-col gap-7">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Logoen er svart — den trenger hvit bakgrunn også i mørk modus */}
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white">
              <BrandIcon size={26} className="size-6.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-meta font-bold text-ink">Loggbok</p>
              <p className="truncate text-micro text-ink-3">
                N&amp;M Vaktmesterservice
              </p>
            </div>
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

        <h1 className="mt-6 text-display text-ink">{customer.name}</h1>

        <div className="hero-season mt-4 rounded-3xl bg-hero px-5 py-5 text-white">
          <p className="text-eyebrow uppercase text-white/50">Sist utført</p>
          <p className="mt-2.5 text-title">
            {lastVisit ? formatLastVisit(lastVisit) : "Ingen besøk ennå"}
          </p>
          {lastVisit ? (
            <p className="mt-1.5 text-meta text-white/65">
              {formatDate(lastVisit)}
              {lastVisitEntry?.user?.name
                ? ` · ${lastVisitEntry.user.name}`
                : null}
            </p>
          ) : null}
        </div>

        {/* Året så langt — store tall og utvikling. Dette er siden et styre
            bedømmer oss etter, så tallene skal bære seg selv. */}
        <div className="mt-2.5 rounded-2xl border border-hair bg-surface px-4 py-4 shadow-card">
          <p className={eyebrowClass}>Besøk i år</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <p className="font-display text-[2.75rem] font-bold leading-none tracking-tight tabular-nums text-ink">
              {visitsThisYear}
            </p>
            {visitDiff > 0 ? (
              <p className="text-meta font-bold text-brand">
                +{visitDiff} mot i fjor
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex h-20 items-end gap-1.5" aria-hidden>
            {monthCounts.map((count, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t-md rounded-b-sm ${
                  index === currentMonth - 1 ? "bg-brand" : "bg-brand-soft"
                }`}
                style={{
                  height: `${Math.max(6, Math.round((count / maxMonthCount) * 100))}%`,
                }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex gap-1.5" aria-hidden>
            {MONTH_SHORT.slice(0, currentMonth).map((label) => (
              <span
                key={label}
                className="flex-1 text-center text-[0.5625rem] font-bold uppercase tracking-wide text-ink-3"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <div
            className={`rounded-2xl px-4 py-3.5 ${
              openIssueCount === 0
                ? "bg-brand-soft"
                : "border border-hair bg-surface shadow-card"
            }`}
          >
            <p
              className={
                openIssueCount === 0
                  ? "text-eyebrow uppercase text-brand"
                  : eyebrowClass
              }
            >
              Åpne avvik
            </p>
            <p
              className={`mt-2 text-title tabular-nums ${
                openIssueCount === 0 ? "text-brand" : "text-ink"
              }`}
            >
              {openIssueCount}
            </p>
          </div>
          <div className="rounded-2xl border border-hair bg-surface px-4 py-3.5 shadow-card">
            <p className={eyebrowClass}>Timer ekstraarbeid i år</p>
            <p className="mt-2 text-title tabular-nums text-ink">
              {formatHours(extraHoursThisYear)} t
            </p>
          </div>
        </div>

        {/* Rapporten er det styret faktisk skal bruke — den skal ikke ligge
            gjemt nederst under hele tidslinja. */}
        <Link
          href="/portal/rapport"
          className="mt-2.5 flex min-h-[4.5rem] items-center gap-3.5 rounded-2xl border border-hair bg-surface px-4 py-3.5 shadow-card transition-colors active:bg-sunken"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-heading text-ink">Månedsrapport</span>
            <span className="mt-0.5 block truncate text-meta text-ink-2">
              {thisMonth} · klar til utskrift
            </span>
          </span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5 shrink-0 text-ink-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </Link>
      </header>

      {openIssueCount > 0 ? (
        <section>
          <h2 className={sectionHeadClass}>
            <span>Åpne avvik</span>
            <Link
              href="/portal/avvik"
              className="text-eyebrow uppercase text-ink-2"
            >
              Alle ›
            </Link>
          </h2>
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
      ) : null}

      <section>
        <h2 className={sectionHeadClass}>
          <span>Meld fra til oss</span>
          <Link
            href="/portal/meldinger"
            className="text-eyebrow uppercase text-ink-2"
          >
            Tidligere ›
          </Link>
        </h2>
        <PortalMessageForm />

        {openMessages.length > 0 ? (
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {openMessages.map((message) => (
              <li
                key={message.id}
                className={`flex flex-col gap-1.5 px-4 py-3.5 ${cardStaticClass}`}
              >
                <span className="text-micro text-ink-3">
                  Sendt {formatDate(message.createdAt)} · ikke lest ennå
                </span>
                <p className="text-body whitespace-pre-wrap text-ink">
                  {message.body}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <h2 className={sectionHeadClass}>
          <span>Utført arbeid</span>
          <Link
            href="/portal/aktivitet"
            className="text-eyebrow uppercase text-ink-2"
          >
            Arkiv ›
          </Link>
        </h2>
        <ActivityList
          items={recentActivity}
          emptyText="Ingen registreringer ennå."
        />
      </section>
    </div>
  );
}
