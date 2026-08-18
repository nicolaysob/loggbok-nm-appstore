import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand";
import { BackLink } from "@/components/back-link";
import { cardClass, cardStaticClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Support – N&M Loggbok",
};

export default function SupportPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex animate-rise flex-col gap-6">
        <div className="flex flex-col gap-4">
          <BackLink fallback="/login" />
          <BrandLogo className="w-40" />
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-ink">
              Support
            </h1>
            <p className="text-body text-ink-2">
              Loggbok er et internt system for N&amp;M Vaktmesterservice AS.
            </p>
          </div>
        </div>

        <section className={`flex flex-col gap-3 px-4 py-4 ${cardStaticClass}`}>
          <h2 className="text-heading">Kontakt</h2>
          <a
            href="mailto:nicolaysob2002@gmail.com"
            className="text-body font-semibold text-brand"
          >
            nicolaysob2002@gmail.com
          </a>
          <p className="text-meta text-ink-2">
            Midlertidig supportadresse. Bytt til bedriftens faste e-post når den
            er klar (før App Store-innsending).
          </p>
        </section>

        <ul className="flex flex-col gap-3">
          <li>
            <Link
              href="/personvern"
              className={`flex min-h-[4.5rem] items-center justify-between gap-3 px-4 ${cardClass}`}
            >
              <span className="text-heading font-semibold text-ink">
                Personvernerklæring
              </span>
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-full bg-sunken text-ink-2"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className={`flex min-h-[4.5rem] items-center justify-between gap-3 px-4 ${cardClass}`}
            >
              <span className="text-heading font-semibold text-ink">
                Til innlogging
              </span>
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-full bg-sunken text-ink-2"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
