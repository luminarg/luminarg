"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import {
  createExpense,
  deleteExpenseById,
  ExpenseCategory,
  ExpenseType,
} from "@/data/expenseService";

export async function createExpenseAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  await createExpense({
    expenseDate: String(formData.get("expenseDate") || ""),
    type: String(formData.get("type") || "general") as ExpenseType,
    category: String(formData.get("category") || "otros") as ExpenseCategory,
    description: String(formData.get("description") || ""),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ARS"),
    paidBy: String(formData.get("paidBy") || ""),
    paymentMethod: String(formData.get("paymentMethod") || ""),
    supplier: String(formData.get("supplier") || ""),
    invoiceNumber: String(formData.get("invoiceNumber") || ""),
    notes: String(formData.get("notes") || ""),
    createdBy: profile.id,
  });

  revalidatePath("/internal/expenses");
  redirect("/internal/expenses");
}

export async function deleteExpenseAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  const id = Number(formData.get("id") || 0);

  if (!id) {
    throw new Error("ID inválido");
  }

  await deleteExpenseById(id);

  revalidatePath("/internal/expenses");
}
