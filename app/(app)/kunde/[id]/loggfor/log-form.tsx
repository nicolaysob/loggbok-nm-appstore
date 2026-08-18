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
import { CommentField } from "@/components/comment-field";
import { FieldError, StickySubmit, labelClass } from "@/components/mobile-form";
import { inputClass, sectionHeadClass } from "@/lib/ui";

export type LogTaskOption = {
  id: string;
  title: string;
  lastDone: string | null;
};

const chipBase =
  "min-h-12 rounded-full px-4 text-meta font-bold transition-colors duration-150";
const chipOff = `${chipBase} border-[1.5px] border-edge bg-surface text-ink active:bg-sunken`;
const chipOn = `${chipBase} bg-brand text-on-brand shadow-brand active:bg-brand-strong`;

function commentLines(comment: string): string[] {
  return comment
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function LogForm({
  customerId,
  defaultDateTime,
  tasks,
}: {
  customerId: string;
  defaultDateTime: string;
  /** Kundens faste oppgaver — tom liste skjuler seksjonen */
  tasks: LogTaskOption[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createVisitNote.bind(null, customerId),
    undefined,
  );
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  function toggleTask(id: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
    <form action={submit} className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col gap-2">
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
        <FieldError messages={state?.errors?.occurredAt} />
      </div>

      {tasks.length > 0 ? (
        <section>
          <h2 className={sectionHeadClass}>
            <span>Faste oppgaver</span>
            {checked.size > 0 ? <span>{checked.size} valgt</span> : null}
          </h2>
          <ul className="overflow-hidden rounded-2xl border border-hair bg-surface shadow-card">
            {tasks.map((task) => {
              const active = checked.has(task.id);
              return (
                <li key={task.id} className="border-b border-hair last:border-b-0">
                  {/* Hele raden er trykkbar — avkryssingsboksen ligger inni label */}
                  <label
                    className={`flex min-h-16 cursor-pointer items-center gap-3.5 px-4 py-3 transition-colors ${
                      active ? "bg-brand text-on-brand" : "text-ink active:bg-sunken"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="tasks"
                      value={task.id}
                      checked={active}
                      onChange={() => toggleTask(task.id)}
                      className="size-7 shrink-0 accent-brand"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-heading">{task.title}</span>
                      <span
                        className={`text-micro tabular-nums ${
                          active ? "text-on-brand/70" : "text-ink-3"
                        }`}
                      >
                        {task.lastDone ?? "Aldri utført"}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className={sectionHeadClass}>
          <span>Hurtigtekst</span>
        </h2>
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
                  className={active ? chipOn : chipOff}
                >
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
                  className={`${groupActive ? chipOn : chipOff} flex w-full items-center justify-between text-left`}
                >
                  <span>
                    {preset.label}
                    {groupActive ? ` · ${selectedCount}` : ""}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {open && (
                  <div className="flex flex-wrap gap-2 rounded-2xl border border-hair bg-surface p-3">
                    {preset.items.map((item) => {
                      const active = activePresets.has(groupItemLine(item));
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleGroupItem(preset, item)}
                          className={active ? chipOn : chipOff}
                        >
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
      </section>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="comment" className={labelClass}>
            Noe mer?
          </label>
          {checked.size > 0 ? (
            <span className="text-micro text-ink-3">valgfritt</span>
          ) : null}
        </div>
        <CommentField
          id="comment"
          value={comment}
          onChange={setComment}
          rows={5}
        />
        <FieldError messages={state?.errors?.comment} />
      </div>

      <PhotoPicker files={photos} onChange={setPhotos} />

      <FieldError messages={state?.errors?.photos} />
      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Lagre besøk</StickySubmit>
    </form>
  );
}
