"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/validation";
import { createIssue } from "@/app/actions/issues";
import { PhotoPicker } from "@/components/photo-picker";
import {
  FieldError,
  StickySubmit,
  labelClass,
  textareaClass,
} from "@/components/mobile-form";

export function IssueForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createIssue.bind(null, customerId),
    undefined,
  );
  const [photos, setPhotos] = useState<File[]>([]);

  function submit(formData: FormData) {
    formData.delete("photos");
    for (const file of photos) {
      formData.append("photos", file);
    }
    formAction(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-4 pb-4">
      <label htmlFor="description" className={labelClass}>
        Hva er avviket?
      </label>
      <textarea
        id="description"
        name="description"
        rows={6}
        className={textareaClass}
      />

      <FieldError messages={state?.errors?.description} />

      <div className="flex flex-col gap-2">
        <p className={labelClass}>Bilder</p>
        <PhotoPicker files={photos} onChange={setPhotos} />
      </div>

      <FieldError messages={state?.errors?.photos} />
      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Meld avvik</StickySubmit>
    </form>
  );
}
