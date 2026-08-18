// Stempling — runder alltid opp til nærmeste halvtime.

const THIRTY_MINUTES_MS = 30 * 60_000;

/** Millisekunder → timer, rundet opp til nærmeste 30 min. */
export function roundHoursUpToNearestHalfHour(durationMs: number): number {
  if (durationMs <= 0) return 0;
  const roundedMs =
    Math.ceil(durationMs / THIRTY_MINUTES_MS) * THIRTY_MINUTES_MS;
  return Math.round((roundedMs / 3_600_000) * 100) / 100;
}

export type ClockPause = {
  /** Satt mens en pause løper */
  pausedAt: Date | null;
  /** Sum av avsluttede pauser i millisekunder */
  pausedMs: number;
};

/**
 * Arbeidet tid i millisekunder — total tid minus alle pauser.
 * Kunden skal ikke betale for pausetid, så dette er tallet som teller.
 */
export function workedMs(
  startedAt: Date,
  pause: ClockPause,
  now: Date = new Date(),
): number {
  const total = now.getTime() - startedAt.getTime();
  const running = pause.pausedAt
    ? now.getTime() - pause.pausedAt.getTime()
    : 0;
  return Math.max(0, total - pause.pausedMs - running);
}

export function hoursFromClock(
  startedAt: Date,
  endedAt: Date = new Date(),
  pause: ClockPause = { pausedAt: null, pausedMs: 0 },
): number {
  return roundHoursUpToNearestHalfHour(workedMs(startedAt, pause, endedAt));
}
