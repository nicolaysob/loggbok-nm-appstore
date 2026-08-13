-- LogType går fra (WORK_LOG, COMMENT_BOOK) til (VISIT_NOTE, TASK_COMPLETION, EXTRA_WORK).
-- Prisma ville droppet og gjenskapt enumen, og tatt eksisterende logginnføringer
-- med seg. Her konverteres kolonnen i stedet: WORK_LOG og COMMENT_BOOK blir
-- VISIT_NOTE, som er den nærmeste av de nye typene.

ALTER TYPE "LogType" RENAME TO "LogType_old";

CREATE TYPE "LogType" AS ENUM ('VISIT_NOTE', 'TASK_COMPLETION', 'EXTRA_WORK');

ALTER TABLE "LogEntry"
  ALTER COLUMN "type" TYPE "LogType"
  USING (
    CASE "type"::text
      WHEN 'WORK_LOG' THEN 'VISIT_NOTE'
      WHEN 'COMMENT_BOOK' THEN 'VISIT_NOTE'
    END
  )::"LogType";

DROP TYPE "LogType_old";
