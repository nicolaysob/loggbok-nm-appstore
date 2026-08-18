"use client";

import { useRef, useTransition } from "react";
import { useActionState } from "react";
import type { FormState } from "@/lib/validation";
import { createTodo, toggleTodo, updateTodoText } from "@/app/actions/todos";
import { FieldError } from "@/components/mobile-form";
import { EditableText } from "@/components/editable-text";
import { cardStaticClass, inputClass, outlineActionClass } from "@/lib/ui";

export type TodoItem = {
  id: string;
  text: string;
  created: string;
  createdBy: string | null;
  createdById: string | null;
};

export type DoneTodoItem = {
  id: string;
  text: string;
  doneBy: string | null;
};

function ToggleButton({
  todoId,
  label,
  className,
}: {
  todoId: string;
  label: string;
  className: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleTodo(todoId))}
      className={className}
    >
      {pending ? "Lagrer …" : label}
    </button>
  );
}

/** Stor avkryssingsboks — skal treffes med hansker. */
function TodoCheckbox({ todoId, text }: { todoId: string; text: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Marker «${text}» som utført`}
      onClick={() => startTransition(() => toggleTodo(todoId))}
      className="-my-1 -ml-1 flex size-12 shrink-0 items-center justify-center disabled:opacity-40"
    >
      <span className="flex size-7 items-center justify-center rounded-lg border-2 border-edge transition-colors active:border-brand active:bg-brand" />
    </button>
  );
}

export function TodoList({
  customerId,
  open,
  recentlyDone,
  currentUserId,
  isAdmin = false,
}: {
  customerId: string;
  open: TodoItem[];
  recentlyDone: DoneTodoItem[];
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createTodo.bind(null, customerId),
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  function submit(formData: FormData) {
    formAction(formData);
    formRef.current?.reset();
  }

  return (
    <div className="flex flex-col gap-3">
      {open.length > 0 && (
        <ul className="flex flex-col gap-3">
          {open.map((todo) => {
            const canEdit =
              Boolean(currentUserId) &&
              (isAdmin ||
                todo.createdById === null ||
                todo.createdById === currentUserId);

            return (
              <li
                key={todo.id}
                className={`flex items-start gap-3 px-4 py-4 ${cardStaticClass}`}
              >
                <TodoCheckbox todoId={todo.id} text={todo.text} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <EditableText
                    initialText={todo.text}
                    canEdit={canEdit}
                    rows={2}
                    onSave={(text) => updateTodoText(todo.id, text)}
                  />
                  <p className="text-micro text-ink-3">
                    <span className="tabular-nums">{todo.created}</span>
                    {todo.createdBy ? ` · ${todo.createdBy}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {recentlyDone.length > 0 && (
        <ul className="flex flex-col gap-2">
          {recentlyDone.map((todo) => (
            <li key={todo.id} className="flex min-h-12 items-center gap-3 px-1">
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand text-on-brand"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5 9.5 17 19 7" />
                </svg>
              </span>
              <p className="min-w-0 flex-1 text-body text-ink-3 line-through">
                {todo.text}
                {todo.doneBy && (
                  <span className="ml-2 text-micro no-underline">
                    ({todo.doneBy})
                  </span>
                )}
              </p>
              <ToggleButton
                todoId={todo.id}
                label="Angre"
                className="min-h-12 shrink-0 rounded-xl px-3 text-meta font-semibold text-ink-2 transition-colors active:bg-sunken disabled:opacity-50"
              />
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={submit} className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            name="text"
            type="text"
            placeholder="Nytt gjøremål …"
            autoComplete="off"
            className={`${inputClass} min-h-14`}
          />
          <FieldError messages={state?.errors?.text} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={`min-h-14 shrink-0 rounded-xl px-5 text-body font-semibold ${outlineActionClass}`}
        >
          {pending ? "Lagrer …" : "Legg til"}
        </button>
      </form>
    </div>
  );
}
