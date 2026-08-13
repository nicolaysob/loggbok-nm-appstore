"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/validation";
import { createVisitNote } from "@/app/actions/log-entries";
import {
  groupItemLine,
  visitPresets,
  type VisitPresetGroup,
} from "@/lib/visit-presets";
import { PhotoPicker } from "@/components/photo-picker";
import { ImproveTextButton } from "@/components/improve-text-button";
import {
  FieldError,
  StickySubmit,
  labelClass,
  textareaClass,
} from "@/components/mobile-form";
import { outlineActionClass, inputClass } from "@/lib/ui";

function commentLines(comment: string): string[] {
  return comment
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function LogForm({
  customerId,
  defaultDateTime,
}: {
  customerId: string;
  defaultDateTime: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createVisitNote.bind(null, customerId),
    undefined,
  );
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  function togglePreset(text: string) {
    setComment((current) => {
      const lines = commentLines(current);
      if (lines.includes(text)) {
        return lines.filter((line) => line !== text).join("\n");
      }
      return [...lines, text].join("\n");
    });
  }

  // Bygger blokken: «Renhold utført» + valgte «- Butikk» osv.
  function toggleGroupItem(group: VisitPresetGroup, item: string) {
    setComment((current) => {
      const lines = commentLines(current);
      const bulletLines = new Set(group.items.map(groupItemLine));
      const other = lines.filter(
        (line) => line !== group.header && !bulletLines.has(line),
      );

      const selected = new Set(
        group.items.filter((entry) => lines.includes(groupItemLine(entry))),
      );
      if (selected.has(item)) selected.delete(item);
      else selected.add(item);

      if (selected.size === 0) {
        return other.join("\n");
      }

      const block = [
        group.header,
        ...group.items
          .filter((entry) => selected.has(entry))
          .map(groupItemLine),
      ];
      return [...other, ...block].join("\n");
    });
  }

  function toggleGroupOpen(label: string) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  const activePresets = new Set(commentLines(comment));

  function submit(formData: FormData) {
    formData.set("comment", comment);
    formData.delete("photos");
    for (const file of photos) {
      formData.append("photos", file);
    }
    formAction(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-4 pb-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="occurredAt" className={labelClass}>
          Tidspunkt
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="datetime-local"
          required
          defaultValue={defaultDateTime}
          max={defaultDateTime}
          className={`${inputClass} min-h-14`}
        />
        <p className="text-meta text-navy-700">
          Nå som standard — endre hvis besøket var et annet tidspunkt.
        </p>
        <FieldError messages={state?.errors?.occurredAt} />
      </div>

      <div className="flex flex-col gap-2">
        <p className={labelClass}>Hurtigvalg</p>
        <div className="flex flex-wrap gap-2">
          {visitPresets.map((preset) => {
            if (preset.kind === "simple") {
              const active = activePresets.has(preset.text);
              return (
                <button
                  key={preset.text}
                  type="button"
                  aria-pressed={active}
                  onClick={() => togglePreset(preset.text)}
                  className={`min-h-12 rounded-md px-4 text-meta font-semibold transition-all duration-150 ${
                    active
                      ? "border border-brand bg-brand-50 text-green-700"
                      : outlineActionClass
                  }`}
                >
                  {active ? "✓ " : ""}
                  {preset.text}
                </button>
              );
            }

            const open = openGroups.has(preset.label);
            const selectedCount = preset.items.filter((item) =>
              activePresets.has(groupItemLine(item)),
            ).length;
            const groupActive = selectedCount > 0;

            return (
              <div key={preset.label} className="flex w-full flex-col gap-2">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleGroupOpen(preset.label)}
                  className={`flex min-h-12 w-full items-center justify-between rounded-md px-4 text-left text-meta font-semibold transition-all duration-150 ${
                    groupActive
                      ? "border border-brand bg-brand-50 text-green-700"
                      : outlineActionClass
                  }`}
                >
                  <span>
                    {groupActive ? "✓ " : ""}
                    {preset.label}
                    {groupActive ? ` (${selectedCount})` : ""}
                  </span>
                  <span aria-hidden className="text-heading text-navy-100">
                    {open ? "▾" : "›"}
                  </span>
                </button>

                {open && (
                  <div className="flex flex-wrap gap-2 rounded-md border border-line bg-navy-50/60 p-3">
                    {preset.items.map((item) => {
                      const active = activePresets.has(groupItemLine(item));
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleGroupItem(preset, item)}
                          className={`min-h-12 rounded-md px-4 text-meta font-semibold transition-all duration-150 ${
                            active
                              ? "border border-brand bg-brand-50 text-green-700"
                              : outlineActionClass
                          }`}
                        >
                          {active ? "✓ " : ""}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <label htmlFor="comment" className={labelClass}>
        Hva ble gjort?
      </label>
      <textarea
        id="comment"
        name="comment"
        rows={6}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className={textareaClass}
      />

      <ImproveTextButton text={comment} onImproved={setComment} />

      <FieldError messages={state?.errors?.comment} />

      <div className="flex flex-col gap-2">
        <p className={labelClass}>Bilder</p>
        <PhotoPicker files={photos} onChange={setPhotos} />
      </div>

      <FieldError messages={state?.errors?.photos} />
      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Lagre besøk</StickySubmit>
    </form>
  );
}
