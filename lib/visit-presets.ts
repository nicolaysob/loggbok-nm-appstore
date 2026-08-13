// Vanlige besøkstekster — ett trykk i stedet for å skrive ute på anlegg.
// Grupper kan åpnes for mer detaljerte underpunkter.

export type VisitPresetSimple = {
  kind: "simple";
  text: string;
};

export type VisitPresetGroup = {
  kind: "group";
  /** Knappetekst i UI */
  label: string;
  /** Overskrift som skrives i loggen når noe er valgt */
  header: string;
  items: readonly string[];
};

export type VisitPreset = VisitPresetSimple | VisitPresetGroup;

export function groupItemLine(item: string): string {
  return `- ${item}`;
}

export const visitPresets: readonly VisitPreset[] = [
  { kind: "simple", text: "Rutinerunde — alt i orden" },
  { kind: "simple", text: "Kontrollert porter og lås" },
  { kind: "simple", text: "Snømåking / strøing" },
  {
    kind: "group",
    label: "Renhold utført",
    header: "Renhold utført",
    items: [
      "Butikk",
      "Lager",
      "Panterom",
      "Kontorer",
      "Toaletter",
      "Garderober",
      "Spiserom",
      "Melkekjøl",
    ],
  },
  { kind: "simple", text: "Sjekket tekniske rom" },
  { kind: "simple", text: "Tømt søppel" },
] as const;
