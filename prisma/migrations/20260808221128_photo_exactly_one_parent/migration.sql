-- Et bilde skal henge på nøyaktig én forelder: enten en logginnføring eller et avvik.
-- Prisma-schemaet kan ikke uttrykke dette, så det ligger som en CHECK-constraint her.
ALTER TABLE "Photo"
  ADD CONSTRAINT "Photo_exactly_one_parent"
  CHECK (num_nonnulls("logEntryId", "issueId") = 1);
