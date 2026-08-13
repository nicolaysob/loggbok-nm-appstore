"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireStaff } from "@/lib/dal";
import { notifyStaffNewTodo } from "@/lib/onesignal-server";
import { todoSchema, type FormState } from "@/lib/validation";

function revalidateTodoViews(customerId: string) {
  revalidatePath(`/kunde/${customerId}`);
  revalidatePath(`/kunde/${customerId}/avvik`);
  revalidatePath("/");
}

export async function createTodo(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireStaff();

  const result = todoSchema.safeParse({ text: formData.get("text") });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await db.todo.create({
    data: {
      customerId,
      createdById: user.id,
      text: result.data.text,
    },
  });

  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { name: true },
  });
  if (customer) {
    await notifyStaffNewTodo({
      customerId,
      customerName: customer.name,
      text: result.data.text,
      createdByUserId: user.id,
    });
  }

  revalidateTodoViews(customerId);
  return undefined;
}

// Utført/angre i én — et feiltrykk med hansker skal kunne rettes
export async function toggleTodo(todoId: string) {
  const user = await requireStaff();

  const todo = await db.todo.findUnique({
    where: { id: todoId },
    select: { customerId: true, doneAt: true },
  });
  if (!todo) return;

  await db.todo.update({
    where: { id: todoId },
    data: todo.doneAt
      ? { doneAt: null, doneByUserId: null }
      : { doneAt: new Date(), doneByUserId: user.id },
  });

  revalidateTodoViews(todo.customerId);
}

// Admin rydder opp når et gjøremål er meldt inn som avvik:
// teksten flyttes til gjøremålslista og avviket slettes.
export async function convertIssueToTodo(issueId: string) {
  await requireAdmin();

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    select: {
      description: true,
      userId: true,
      area: { select: { customerId: true } },
    },
  });
  if (!issue) return;

  await db.$transaction([
    db.todo.create({
      data: {
        customerId: issue.area.customerId,
        createdById: issue.userId,
        text: issue.description,
      },
    }),
    db.issue.delete({ where: { id: issueId } }),
  ]);

  const customer = await db.customer.findUnique({
    where: { id: issue.area.customerId },
    select: { name: true },
  });
  if (customer) {
    await notifyStaffNewTodo({
      customerId: issue.area.customerId,
      customerName: customer.name,
      text: issue.description,
      createdByUserId: issue.userId,
    });
  }

  revalidateTodoViews(issue.area.customerId);
  revalidatePath("/uke");
}

// Eier eller admin kan rette feilskrevet gjøremål
export async function updateTodoText(
  todoId: string,
  text: string,
): Promise<{ error?: string }> {
  const user = await requireStaff();

  const result = todoSchema.safeParse({ text });
  if (!result.success) {
    return { error: z.flattenError(result.error).fieldErrors.text?.[0] };
  }

  const todo = await db.todo.findUnique({
    where: { id: todoId },
    select: { customerId: true, createdById: true },
  });
  if (!todo) return { error: "Gjøremålet finnes ikke" };
  if (
    user.role !== "ADMIN" &&
    todo.createdById !== null &&
    todo.createdById !== user.id
  ) {
    return { error: "Du kan bare redigere egne gjøremål" };
  }

  await db.todo.update({
    where: { id: todoId },
    data: { text: result.data.text },
  });

  revalidateTodoViews(todo.customerId);
  return {};
}
