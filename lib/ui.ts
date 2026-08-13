// Delte klasse-strenger. Ingen React — trygt å importere fra både
// server- og klientkomponenter.

export const cardClass =
  "rounded-md bg-white shadow-card " +
  "transition-colors duration-150 active:bg-navy-50";

export const cardStaticClass = "rounded-md bg-white shadow-card";

export const solidActionClass =
  "bg-brand text-white shadow-brand transition-colors duration-150 " +
  "hover:bg-brand-dark active:bg-brand-dark " +
  "disabled:opacity-50 disabled:shadow-none";

export const outlineActionClass =
  "bg-white text-navy-900 shadow-card " +
  "transition-colors duration-150 " +
  "active:bg-navy-50 disabled:opacity-50";

export const textareaClass =
  "w-full rounded-md bg-white px-3.5 py-3 " +
  "text-body text-navy-900 outline-none shadow-card " +
  "transition-[box-shadow] duration-150 " +
  "focus:ring-2 focus:ring-brand/20";

export const labelClass = "text-meta font-semibold text-navy-900";

export const backLinkClass =
  "inline-flex min-h-11 items-center text-body font-medium text-navy-700 " +
  "transition-colors active:text-navy-900";

export const adminBackLinkClass =
  "text-meta font-medium text-navy-700 transition-colors hover:text-navy-900";

export const noticeClass =
  "rounded-md bg-white px-3.5 py-3 text-body text-navy-800 shadow-card";

export const inputClass =
  "w-full rounded-md bg-white px-3 py-2.5 " +
  "text-body text-navy-900 outline-none shadow-card " +
  "transition-[box-shadow] duration-150 " +
  "focus:ring-2 focus:ring-brand/20";
