import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand";
import { backLinkClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Support – N&M Loggbok",
};

export default function SupportPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-6 py-10">
      <BrandLogo className="w-40" />
      <h1 className="mt-8 text-display tracking-tight text-navy-900">
        Support
      </h1>
      <p className="mt-2 text-body text-navy-700">
        Loggbok er et internt system for N&amp;M Vaktmesterservice AS.
      </p>

      <section className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-heading">Kontakt</h2>
        <p className="text-body text-navy-800">
          E-post:{" "}
          <a
            href="mailto:post@nmvaktmester.no"
            className="font-medium text-navy-900 underline underline-offset-2"
          >
            post@nmvaktmester.no
          </a>
        </p>
        <p className="text-meta text-navy-700">
          Bytt til firmaets faktiske support-adresse i{" "}
          <code className="font-mono text-meta">app/support/page.tsx</code>{" "}
          før innsending hvis denne ikke stemmer.
        </p>
      </section>

      <section className="mt-8 flex flex-col gap-2 border-t border-line pt-6">
        <Link href="/personvern" className={backLinkClass}>
          Personvernerklæring
        </Link>
        <Link href="/login" className={backLinkClass}>
          Til innlogging
        </Link>
      </section>
    </main>
  );
}
