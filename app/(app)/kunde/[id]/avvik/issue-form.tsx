"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/validation";
import { createIssue } from "@/app/actions/issues";
import { PhotoPicker } from "@/components/photo-picker";
import { CommentField } from "@/components/comment-field";
import { FieldError, StickySubmit, labelClass } from "@/components/mobile-form";

export function IssueForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createIssue.bind(null, customerId),
    undefined,
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  function submit(formData: FormData) {
    formData.set("description", description);
    formData.delete("photos");
    for (const file of photos) {
      formData.append("photos", file);
    }
    formAction(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClass}>
          Hva er galt?
        </label>
        <CommentField
          id="description"
          value={description}
          onChange={setDescription}
          rows={5}
        />
      </div>

      <FieldError messages={state?.errors?.description} />

      <PhotoPicker files={photos} onChange={setPhotos} />

      <FieldError messages={state?.errors?.photos} />
      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Meld avvik</StickySubmit>
    </form>
  );
}
