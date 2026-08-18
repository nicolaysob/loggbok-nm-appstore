// Delte klasse-strenger for designsystemet «Felt».
// Ingen React — trygt å importere fra både server- og klientkomponenter.
//
// Regler:
// - Én grønn primærhandling per skjerm. Alt annet er nøytralt.
// - Minste trykkflate er 48px. Hovedhandlinger er 56px.
// - Aldri rå fargekoder — bare tokenene fra globals.css, ellers ryker mørk modus.

/* ── Flater ────────────────────────────────────────────────── */

export const cardClass =
  "rounded-2xl border border-hair bg-surface shadow-card " +
  "transition-colors duration-150 active:bg-sunken";

export const cardStaticClass =
  "rounded-2xl border border-hair bg-surface shadow-card";

/** Hårstrek mellom rader i et kort. */
export const rowDividerClass = "h-px bg-hair";

/* ── Handlinger ────────────────────────────────────────────── */

/** Primærhandling: grønn. Loggfør, Start, Lagre. */
export const solidActionClass =
  "rounded-xl bg-brand text-on-brand font-semibold shadow-brand " +
  "transition-colors duration-150 active:bg-brand-strong " +
  "disabled:opacity-50 disabled:shadow-none";

/** Tung nøytral handling der grønt ville konkurrert med noe annet. */
export const inkActionClass =
  "rounded-xl bg-hero text-white font-semibold " +
  "transition-colors duration-150 active:bg-hero-2 disabled:opacity-50";

export const outlineActionClass =
  "rounded-xl border-[1.5px] border-edge bg-surface text-ink font-semibold " +
  "transition-colors duration-150 active:bg-sunken disabled:opacity-50";

/** Destruktiv handling — alltid sekundær i vekt. */
export const dangerActionClass =
  "rounded-xl border-[1.5px] border-danger/35 bg-danger-soft text-danger " +
  "font-semibold transition-colors duration-150 disabled:opacity-50";

/** Høyde og oppsett for en hovedknapp. Kombineres med klassene over. */
export const actionSize =
  "flex min-h-14 w-full items-center justify-center gap-2.5 text-body";

/* ── Skjemafelter ──────────────────────────────────────────── */

export const inputClass =
  "w-full rounded-xl border border-edge bg-surface px-4 py-3.5 " +
  "text-body text-ink outline-none placeholder:text-ink-3 " +
  "transition-colors duration-150 focus:border-brand";

export const textareaClass =
  "w-full rounded-xl border border-edge bg-surface px-4 py-3.5 " +
  "text-body text-ink outline-none placeholder:text-ink-3 " +
  "transition-colors duration-150 focus:border-brand";

export const labelClass = "text-meta font-semibold text-ink-2";

/* ── Tekstnivåer ───────────────────────────────────────────── */

/** SPERRET VERSAL over en seksjon. */
export const eyebrowClass = "text-eyebrow uppercase text-ink-3";

/** Seksjonshode med valgfri høyrekolonne (antall, «Arkiv ›»). */
export const sectionHeadClass =
  "flex items-center justify-between gap-3 px-1 pb-2.5 text-eyebrow uppercase text-ink-3";

export const noticeClass =
  "rounded-2xl border border-hair bg-surface px-4 py-3.5 text-body text-ink-2";

/* ── Merkelapper ───────────────────────────────────────────── */

export type BadgeTone = "danger" | "warn" | "ok" | "neutral";

const badgeBase =
  "inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-micro font-bold";

export const badgeClass: Record<BadgeTone, string> = {
  danger: `${badgeBase} bg-danger-soft text-danger`,
  warn: `${badgeBase} bg-warn-soft text-warn`,
  ok: `${badgeBase} bg-brand-soft text-brand`,
  neutral: `${badgeBase} bg-sunken text-ink-2`,
};

/* ── Navigasjon ────────────────────────────────────────────── */

export const backLinkClass =
  "inline-flex min-h-12 items-center gap-1 text-body font-semibold text-ink-2 " +
  "transition-colors active:text-ink";

export const adminBackLinkClass =
  "text-meta font-semibold text-ink-2 transition-colors hover:text-ink";
