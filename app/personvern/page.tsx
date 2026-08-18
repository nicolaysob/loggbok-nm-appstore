import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = {
  title: "Personvern – N&M",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-lg flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 animate-rise">
        <div className="flex flex-col gap-4">
          <BackLink fallback="/login" />
          <BrandLogo className="w-40" />
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-ink">
              Personvernerklæring
            </h1>
            <p className="text-meta text-ink-2">
              Sist oppdatert 13. august 2026
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 text-body text-ink">
          <section className="flex flex-col gap-2">
            <h2 className="text-heading">1. Behandlingsansvarlig</h2>
            <p>
              N&amp;M Vaktmesterservice AS («vi») er behandlingsansvarlig for
              personopplysninger som behandles i Loggbok-appen.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">2. Hva appen brukes til</h2>
            <p>
              Loggbok er et internt system for drift og oppfølging hos kunder:
              besøk, oppgaver, ekstraarbeid, avvik, meldinger og enkel
              timeføring. Kunder kan få innlogging til en begrenset portal for
              sitt anlegg.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">3. Hvilke opplysninger vi behandler</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Ansatte: navn, brukernavn, rolle, loggføringer, eventuelle
                timer og push-abonnement (hvis tillatt).
              </li>
              <li>
                Kunder / kundekontakter: firmanavn, innlogging til portal,
                meldinger og aktivitet knyttet til anlegget.
              </li>
              <li>
                Innhold i loggen: tekst om arbeid, avvik og gjøremål. Bilder
                lagres bare hvis funksjonen er i bruk.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">4. Hvorfor vi behandler opplysningene</h2>
            <p>Behandlingen skjer for å:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>utføre og dokumentere vaktmestertjenester</li>
              <li>kommunisere med kunde om anlegget</li>
              <li>føre timer for lønn der det er aktuelt</li>
              <li>varsle ansatte om nye meldinger eller gjøremål</li>
            </ul>
            <p>
              Grunnlaget er i hovedsak avtaleforhold (oppdrag med kunde) og
              arbeidsforhold (ansatte).
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">5. Hvem som får tilgang</h2>
            <p>
              Ansatte med innlogging ser data etter rolle. Kundekontoer ser bare
              eget anlegg. Opplysningene selges ikke videre.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">6. Leverandører</h2>
            <p>
              For å drifte appen bruker vi tjenesteleverandører som behandler
              data på våre vegne, blant annet:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>database / lagring (f.eks. Supabase)</li>
              <li>drift av nettside (f.eks. Vercel)</li>
              <li>push-varsler (f.eks. OneSignal), hvis aktivert</li>
              <li>
                teksthjelp / AI (f.eks. Google Gemini) når «Forbedre tekst»
                brukes
              </li>
            </ul>
            <p>
              Der det er tilgjengelig, inngås databehandleravtale med
              leverandøren.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">7. Lagringstid</h2>
            <p>
              Opplysninger lagres så lenge det er nødvendig for drift, oppfølging
              og eventuelle krav knyttet til oppdraget. Når en bruker ikke lenger
              skal ha tilgang, deaktiveres kontoen.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">8. Sikkerhet</h2>
            <p>
              Tilgang krever innlogging. Tilkobling skjer over HTTPS. Vi begrenser
              tilgangen til dem som trenger den i arbeidet.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">9. Dine rettigheter</h2>
            <p>
              Du kan be om innsyn, retting eller sletting der det følger av
              personvernregelverket, og klage til Datatilsynet. Ta kontakt med
              oss hvis du har spørsmål.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading">10. Kontakt</h2>
            <p>N&amp;M Vaktmesterservice AS</p>
            <p className="text-meta text-ink-2">
              Dette er en kortfattet erklæring for intern bruk og
              kundeportal. Den er ment som åpen informasjon, ikke som
              juridisk rådgivning.
            </p>
          </section>
        </div>
      </div>

      <footer className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center">
        <p className="text-meta text-ink-2">N&amp;M Vaktmesterservice AS</p>
      </footer>
    </main>
  );
}
