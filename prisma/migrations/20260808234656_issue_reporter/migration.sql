-- Avvik skal registrere hvem som meldte det.
-- Kolonnen legges til som nullbar, fylles for eksisterende rader, og settes
-- deretter til NOT NULL. Å legge den til påkrevd direkte ville feilet på
-- tabeller som allerede har data.
ALTER TABLE "Issue" ADD COLUMN "userId" TEXT;

-- Eksisterende avvik ble meldt før feltet fantes. De tilskrives den eldste
-- admin-brukeren, som er den som satte opp systemet.
UPDATE "Issue"
SET "userId" = (
  SELECT "id" FROM "User" WHERE "role" = 'ADMIN' ORDER BY "createdAt" ASC LIMIT 1
)
WHERE "userId" IS NULL;

ALTER TABLE "Issue" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Issue"
  ADD CONSTRAINT "Issue_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Issue_userId_idx" ON "Issue"("userId");
