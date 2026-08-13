const wholeKroner = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const partialKroner = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Runde beløp vises uten desimaler («150 000»), ellers med to («1 234 567,50»).
// Én desimal ser ut som en feil på et kronebeløp.
export function formatKroner(value: number): string {
  return Number.isInteger(value)
    ? wholeKroner.format(value)
    : partialKroner.format(value);
}

const hoursFormat = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

// 2,5 med komma — ikke 2.5
export function formatHours(value: number): string {
  return hoursFormat.format(value);
}

// Prisma gir Decimal-objekter. De kan ikke sendes til klientkomponenter,
// så de må gjøres om til tall før de forlater serveren.
export function decimalToNumber(value: { toString(): string }): number {
  return Number(value.toString());
}

// Godtar «150 000», «150000,50» og «150000.50».
// \s dekker også det harde mellomrommet Intl bruker som tusenskille.
// Returnerer null når feltet er tomt eller ikke lar seg tolke — zod tar feilmeldingen.
export function parseDecimal(input: string): number | null {
  const cleaned = input.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return null;

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
