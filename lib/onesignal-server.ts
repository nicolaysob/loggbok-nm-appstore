import "server-only";

import { db } from "@/lib/db";
import { ONESIGNAL_APP_ID } from "@/lib/onesignal-config";

const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://loggbok-nm-lyart.vercel.app";

type PushPayload = {
  title: string;
  body: string;
  url: string;
  /** Hopp over disse bruker-id-ene (f.eks. den som nettopp lagde gjøremålet) */
  excludeUserIds?: string[];
};

async function staffExternalIds(excludeUserIds: string[] = []): Promise<string[]> {
  const exclude = new Set(excludeUserIds);
  const staff = await db.user.findMany({
    where: {
      active: true,
      role: { in: ["ADMIN", "EMPLOYEE"] },
    },
    select: { id: true },
  });
  return staff.map((user) => user.id).filter((id) => !exclude.has(id));
}

/**
 * Sender web-push til ansatte via OneSignal REST API.
 * Krever ONESIGNAL_REST_API_KEY i miljøvariabler (Vercel + .env).
 * Feiler stille hvis nøkkel mangler eller API ikke svarer — appen skal ikke stoppe.
 */
async function sendPushToExternalIds(
  externalIds: string[],
  payload: Omit<PushPayload, "excludeUserIds">,
): Promise<{ ok: boolean; detail?: string }> {
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!apiKey) {
    console.warn(
      "OneSignal: ONESIGNAL_REST_API_KEY mangler — hopper over push.",
    );
    return { ok: false, detail: "ONESIGNAL_REST_API_KEY mangler" };
  }

  if (externalIds.length === 0) {
    return { ok: false, detail: "Ingen mottakere" };
  }

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        target_channel: "push",
        include_aliases: { external_id: externalIds },
        headings: { en: payload.title, nb: payload.title },
        contents: { en: payload.body, nb: payload.body },
        url: payload.url.startsWith("http")
          ? payload.url
          : `${APP_ORIGIN}${payload.url}`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OneSignal push feilet:", response.status, text);
      return { ok: false, detail: text.slice(0, 200) };
    }

    const result = (await response.json()) as {
      id?: string;
      errors?: unknown;
      recipients?: number;
    };
    if (result.errors) {
      console.error("OneSignal push advarsler:", result.errors);
    }
    if (typeof result.recipients === "number" && result.recipients === 0) {
      console.warn(
        "OneSignal: 0 mottakere — ingen abonnenter koblet til external_id.",
        { externalIds, notificationId: result.id },
      );
      return {
        ok: false,
        detail: "0 mottakere (mangler push-abonnement på telefon)",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("OneSignal push feilet:", error);
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Ukjent feil",
    };
  }
}

export async function notifyStaffPush(payload: PushPayload): Promise<void> {
  const externalIds = await staffExternalIds(payload.excludeUserIds);
  await sendPushToExternalIds(externalIds, payload);
}

export async function notifyStaffNewCustomerMessage(input: {
  customerId: string;
  customerName: string;
  preview: string;
}): Promise<void> {
  const preview =
    input.preview.length > 120
      ? `${input.preview.slice(0, 117)}…`
      : input.preview;

  await notifyStaffPush({
    title: `Melding fra ${input.customerName}`,
    body: preview,
    url: `/kunde/${input.customerId}`,
  });
}

export async function notifyStaffNewTodo(input: {
  customerId: string;
  customerName: string;
  text: string;
  createdByUserId: string | null;
}): Promise<void> {
  const preview =
    input.text.length > 120 ? `${input.text.slice(0, 117)}…` : input.text;

  await notifyStaffPush({
    title: `Nytt gjøremål · ${input.customerName}`,
    body: preview,
    url: `/kunde/${input.customerId}`,
    excludeUserIds: input.createdByUserId ? [input.createdByUserId] : [],
  });
}
