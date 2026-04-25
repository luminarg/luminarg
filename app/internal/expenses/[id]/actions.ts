"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import {
  ExpenseCategory,
  ExpenseType,
  updateExpenseById,
} from "@/data/expenseService";

export async function updateExpenseAction(id: number, formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  await updateExpenseById(id, {
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
  });

  revalidatePath("/internal/expenses");
  revalidatePath(`/internal/expenses/${id}`);

  redirect("/internal/expenses");
}