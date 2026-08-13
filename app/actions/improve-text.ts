"use server";

import { z } from "zod";
import { requireStaff } from "@/lib/dal";
import { generateGeminiJson } from "@/lib/gemini";

export type ImproveTextResult =
  | { text: string; error?: undefined }
  | { text?: undefined; error: string };

const responseSchema = z.object({
  text: z.string(),
});

/**
 * Tolker og omskriver loggtekst til klar bokmål — ikke bare stavefeil.
 * Brukes fra loggføring — ansatte beholder kontroll før lagring.
 */
export async function improveNorwegianText(
  raw: string,
): Promise<ImproveTextResult> {
  await requireStaff();

  const input = raw.trim();
  if (!input) {
    return { error: "Skriv noe først, så kan teksten forbedres." };
  }

  if (input.length > 4000) {
    return { error: "Teksten er for lang å forbedre i én omgang." };
  }

  const prompt = `Du hjelper ansatte i et norsk vaktmesterfirma med å skrive loggnotater.

Oppgave:
- Tolke hva personen ment, også hvis teksten er ufullstendig, slangete eller dårlig skrevet.
- Skriv om til klar, profesjonell norsk bokmål som passer i en loggbok kunden kan lese.
- Rett stavemåte, tegnsetting og setningsbygning underveis.

Strenge regler:
- Behold samme fakta og mening. Ikke finn på arbeid, steder, tall eller detaljer som ikke står i originalen.
- Ikke fjern viktig informasjon som faktisk står der.
- Hold det kort og konkret — typisk 1–4 setninger, eller punktliste hvis originalen er punkter.
- Ikke bruk anførselstegn rundt hele svaret.
- Svar KUN som JSON: {"text":"..."} med den forbedrede teksten.

Original tekst:
"""
${input}
"""`;

  try {
    const rawJson = await generateGeminiJson(prompt);
    const parsed = responseSchema.safeParse(JSON.parse(rawJson));
    if (!parsed.success) {
      return { error: "Fikk ikke tolket svaret. Prøv igjen." };
    }
    const text = parsed.data.text.trim();
    if (!text) {
      return { error: "Tomt svar. Prøv igjen." };
    }
    return { text };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Noe gikk galt. Prøv igjen.";
    return { error: message };
  }
}
