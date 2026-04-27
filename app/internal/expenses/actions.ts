"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import {
  createExpense,
  deleteExpense,
  updateExpensePaidState,
} from "@/data/expenseService";

async function requireInternalUser() {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }
}

export async function createExpenseAction(formData: FormData) {
  await requireInternalUser();

  await createExpense({
    expenseDate: String(formData.get("expenseDate") || ""),
    type: String(formData.get("type") || "general"),
    category: String(formData.get("category") || "otros"),
    description: String(formData.get("description") || ""),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ARS"),
    paidBy: String(formData.get("paidBy") || ""),
    paymentMethod: String(formData.get("paymentMethod") || ""),
    supplier: String(formData.get("supplier") || ""),
    invoiceNumber: String(formData.get("invoiceNumber") || ""),
    notes: String(formData.get("notes") || ""),
    isPaid: formData.get("isPaid") === "on",
  });

  revalidatePath("/internal/expenses");
  revalidatePath("/internal/dashboard");
}

export async function toggleExpensePaidAction(id: number, current: boolean) {
  await requireInternalUser();

  await updateExpensePaidState(id, !current);

  revalidatePath("/internal/expenses");
  revalidatePath("/internal/dashboard");
}

export async function deleteExpenseAction(id: number) {
  await requireInternalUser();

  await deleteExpense(id);

  revalidatePath("/internal/expenses");
  revalidatePath("/internal/dashboard");
}