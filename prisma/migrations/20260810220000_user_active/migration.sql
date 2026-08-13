-- Deaktiverte brukere kan ikke logge inn, men historikk beholdes
ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
