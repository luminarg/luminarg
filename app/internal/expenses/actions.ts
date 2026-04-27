"use server";

import { revalidatePath } from "next/cache";
import {
  createExpense,
  toggleExpensePaid,
} from "@/data/expenseService";

export async function createExpenseAction(formData: FormData) {
  await createExpense({
    description: String(formData.get("description") || ""),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ARS"),
    type: String(formData.get("type") || "general"),
    category: String(formData.get("category") || "otros"),
    paid: formData.get("paid") === "on",
  });

  revalidatePath("/internal/expenses");
}

export async function toggleExpensePaidAction(
  id: string,
  current: boolean
) {
  await toggleExpensePaid(id, !current);
  revalidatePath("/internal/expenses");
}