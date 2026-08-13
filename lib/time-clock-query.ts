import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";

/** Åpen stempling for innlogget ansatt — memoisert per request. */
export const getOpenTimeClock = cache(async () => {
  const user = await requireStaff();
  return db.timeClock.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      kind: true,
      customerId: true,
      startedAt: true,
      customer: { select: { id: true, name: true } },
    },
  });
});
