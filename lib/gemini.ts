import "server-only";

type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string; status?: string };
};

// Billig/rask modell for nye gratisbrukere. Overstyr med GEMINI_MODEL.
const DEFAULT_MODEL = "gemini-3.1-flash-lite";

function friendlyGeminiError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource_exhausted")
  ) {
    return "Kvoten er brukt opp for nå. Vent et minutt og prøv igjen.";
  }
  return message;
}

// Kall Gemini med JSON-svar. Nøkkelen leses bare på serveren.
export async function generateGeminiJson(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY mangler i miljøvariabler.");
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(`${url}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(
      friendlyGeminiError(data.error?.message ?? "Gemini-forespørsel feilet."),
    );
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Tomt svar fra Gemini.");
  }

  return text;
}
