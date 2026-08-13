// Stempling — runder alltid opp til nærmeste halvtime.

const THIRTY_MINUTES_MS = 30 * 60_000;

/** Millisekunder → timer, rundet opp til nærmeste 30 min. */
export function roundHoursUpToNearestHalfHour(durationMs: number): number {
  if (durationMs <= 0) return 0;
  const roundedMs =
    Math.ceil(durationMs / THIRTY_MINUTES_MS) * THIRTY_MINUTES_MS;
  return Math.round((roundedMs / 3_600_000) * 100) / 100;
}

export function hoursFromClock(
  startedAt: Date,
  endedAt: Date = new Date(),
): number {
  return roundHoursUpToNearestHalfHour(
    endedAt.getTime() - startedAt.getTime(),
  );
}
