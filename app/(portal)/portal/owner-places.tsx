import Link from "next/link";
import { formatLastVisit } from "@/lib/time";
import { eyebrowClass, sectionHeadClass } from "@/lib/ui";
import { BrandIcon } from "@/components/brand";
import { ProfileMenu } from "@/components/profile-menu";
import type { OwnerPlace } from "@/lib/portal-scope";

/** Forsiden for en eier med flere steder — hvor brenner det, og hvor er alt rolig. */
export function OwnerPlaces({
  ownerName,
  userName,
  places,
  thisMonth,
}: {
  ownerName: string;
  userName: string;
  places: OwnerPlace[];
  thisMonth: string;
}) {
  const openIssues = places.reduce((sum, place) => sum + place.openIssues, 0);

  return (
    <div className="flex animate-rise flex-col gap-7">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Logoen er svart — den trenger hvit bakgrunn */}
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
            initial={userName.charAt(0).toUpperCase()}
            name={userName}
            subtitle="Kundeportal"
            links={[
              { href: "/personvern", label: "Personvern" },
              { href: "/support", label: "Support" },
            ]}
          />
        </div>

        <h1 className="mt-6 text-display text-ink">{ownerName}</h1>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-hair bg-surface px-4 py-3.5 shadow-card">
            <p className={eyebrowClass}>Steder</p>
            <p className="mt-2 font-display text-title tabular-nums text-ink">
              {places.length}
            </p>
          </div>
          <div
            className={`rounded-2xl px-4 py-3.5 ${
              openIssues === 0
                ? "bg-brand-soft"
                : "border border-hair bg-surface shadow-card"
            }`}
          >
            <p
              className={
                openIssues === 0
                  ? "text-eyebrow uppercase text-brand"
                  : eyebrowClass
              }
            >
              Åpne avvik
            </p>
            <p
              className={`mt-2 font-display text-title tabular-nums ${
                openIssues === 0 ? "text-brand" : "text-danger"
              }`}
            >
              {openIssues}
            </p>
          </div>
        </div>

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
              {thisMonth} ·{" "}
              {places.length === 1
                ? "stedet deres"
                : `alle ${places.length} stedene`}
            </span>
          </span>
          <Chevron />
        </Link>
      </header>

      <section>
        <h2 className={sectionHeadClass}>
          <span>Stedene deres</span>
        </h2>

        {places.length === 0 ? (
          <p className="rounded-2xl border border-hair bg-surface px-4 py-6 text-center text-body text-ink-3 shadow-card">
            Ingen steder er registrert ennå.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-hair bg-surface shadow-card">
            {places.map((place) => (
              <li key={place.id} className="border-b border-hair last:border-b-0">
                <Link
                  href={`/portal?sted=${place.id}`}
                  className="flex min-h-[4.25rem] items-center gap-3 px-4 py-3 active:bg-sunken"
                >
                  <span
                    aria-hidden
                    className={`size-2.5 shrink-0 rounded-full ${
                      place.openIssues > 0 ? "bg-danger" : "bg-brand"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-heading text-ink">
                      {place.name}
                    </span>
                    <span className="mt-0.5 block truncate text-meta text-ink-2">
                      {formatLastVisit(place.lastVisit)}
                      {place.openIssues > 0
                        ? ` · ${place.openIssues === 1 ? "1 åpent avvik" : `${place.openIssues} åpne avvik`}`
                        : " · alt i orden"}
                    </span>
                  </span>
                  <Chevron />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Chevron() {
  return (
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
  );
}
