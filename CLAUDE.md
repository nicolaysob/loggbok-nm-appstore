Dette er et internt loggbok- og rapportsystem for et norsk vaktmesterfirma med to eiere og noen få ansatte.

Stack: Next.js App Router, TypeScript, Prisma, PostgreSQL, Tailwind. Deployes på Vercel.

Regler:
- Hele grensesnittet skal være på norsk. Norske datoformater. kr som valuta.
- Kode og variabelnavn på engelsk, kommentarer på norsk der de forklarer noe.
- Mobil først. Hovedbrukeren står ute på et anlegg med hansker og regn. Store trykkflater, minimalt med skriving.
- Hold komponenter små nok til å leses i én skjerm.
- Ikke bygg funksjonalitet jeg ikke har bedt om. Foreslå gjerne, men ikke implementer på eget initiativ.
- Ett steg om gangen. Vis meg planen før du skriver mange filer.

Datamodell — regler som ikke kan uttrykkes i Prisma-schemaet:
- `LogEntry.type` har tre verdier med hver sine regler, håndhevet i applikasjonslaget: `VISIT_NOTE` krever `comment` og har ingen timer, `TASK_COMPLETION` krever `completedTasks` og kan ha valgfri `comment` (oppgaver og fritekst loggføres i samme skjema), `EXTRA_WORK` krever både `hours` og `comment`.
- `EXTRA_WORK` er den eneste fakturerbare typen og den eneste med timer. Det finnes ingen egen `billable`-kolonne — typen er den ene sannheten. Fakturerbare timer summeres med `where: { type: "EXTRA_WORK" }`.
- `Area` er skjult for brukerne. Kunden er stedet. Hver kunde får automatisk ett standardområde med samme navn når den opprettes, og all logging og alle oppgavemaler henger på det. Ingen side skal vise eller la noen redigere områder — bruk `primaryAreaId()` i `lib/customer.ts` for å slå det opp.
- Bruk alltid `prisma migrate`, aldri `prisma db push`. CHECK-constrainten som sikrer at et `Photo` henger på nøyaktig én forelder (`logEntryId` eller `issueId`) finnes bare i migrasjonsfilene, ikke i schemaet. `db push` synker direkte fra schemaet og vil stille droppe den.

@AGENTS.md
