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
                className={`flex items-start gap-3 px-4 py-3 ${cardStaticClass}`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <EditableText
                    initialText={todo.text}
                    canEdit={canEdit}
                    rows={2}
                    onSave={(text) => updateTodoText(todo.id, text)}
                  />
                  <p className="text-meta font-medium text-navy-700">
                    <span className="font-mono">{todo.created}</span>
                    {todo.createdBy ? ` · ${todo.createdBy}` : ""}
                  </p>
                </div>
                <ToggleButton
                  todoId={todo.id}
                  label="Utført"
                  className="min-h-14 shrink-0 rounded-md border border-green-700/30 bg-green-50 px-4 text-meta font-semibold text-green-700 transition-colors active:bg-green-50 disabled:opacity-50"
                />
              </li>
            );
          })}
        </ul>
      )}

      {recentlyDone.length > 0 && (
        <ul className="flex flex-col gap-2">
          {recentlyDone.map((todo) => (
            <li
              key={todo.id}
              className="flex min-h-12 items-center gap-3 px-1"
            >
              <p className="min-w-0 flex-1 text-body text-navy-700 line-through">
                {todo.text}
                {todo.doneBy && (
                  <span className="ml-2 text-meta no-underline">
                    ({todo.doneBy})
                  </span>
                )}
              </p>
              <ToggleButton
                todoId={todo.id}
                label="Angre"
                className="min-h-12 shrink-0 rounded-md px-3 text-meta font-semibold text-navy-700 transition-colors active:bg-navy-50 disabled:opacity-50"
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
          className={`min-h-14 shrink-0 rounded-md px-5 text-body font-semibold ${outlineActionClass}`}
        >
          {pending ? "Lagrer …" : "Legg til"}
        </button>
      </form>
    </div>
  );
}
