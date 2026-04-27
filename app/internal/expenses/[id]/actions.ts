"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function updateExpenseAction(id: number, formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  const { error } = await supabaseAdmin
    .from("expenses")
    .update({
      expense_date: String(formData.get("expenseDate") || ""),
      type: String(formData.get("type") || "general"),
      category: String(formData.get("category") || "otros"),
      description: String(formData.get("description") || ""),
      amount: Number(formData.get("amount") || 0),
      currency: String(formData.get("currency") || "ARS"),
      paid_by: String(formData.get("paidBy") || "") || null,
      payment_method: String(formData.get("paymentMethod") || "") || null,
      supplier: String(formData.get("supplier") || "") || null,
      invoice_number: String(formData.get("invoiceNumber") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      is_paid: formData.get("isPaid") === "on",
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating expense:", error);
    throw new Error("No se pudo actualizar el gasto");
  }

  revalidatePath("/internal/expenses");
  revalidatePath(`/internal/expenses/${id}`);
  revalidatePath("/internal/dashboard");

  redirect("/internal/expenses");
}