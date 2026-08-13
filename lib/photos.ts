import "server-only";

const MAX_PHOTOS = 3;
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PhotoInput = {
  url: string;
};

// Leser bildefiler fra skjemaet, validerer og gjør dem om til data-URL
// som kan lagres i Photo.url. Klienten komprimerer først, så filene er små.
export async function photosFromFormData(
  formData: FormData,
  fieldName = "photos",
): Promise<{ photos: PhotoInput[] } | { error: string }> {
  const files = formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) return { photos: [] };
  if (files.length > MAX_PHOTOS) {
    return { error: `Maks ${MAX_PHOTOS} bilder per registrering.` };
  }

  const photos: PhotoInput[] = [];

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return { error: "Bare JPEG, PNG og WebP er støttet." };
    }
    if (file.size > MAX_BYTES) {
      return { error: "Et bilde er for stort (maks 4 MB)." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = `data:${file.type};base64,${buffer.toString("base64")}`;
    photos.push({ url });
  }

  return { photos };
}
