import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Expense = {
  id: number;
  expense_date: string | null;
  type: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string | null;
  payment_method: string | null;
  supplier: string | null;
  invoice_number: string | null;
  notes: string | null;
  is_paid: boolean;
  created_at: string;
};

export async function getExpenses() {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }

  return (data ?? []) as Expense[];
}

export async function getExpenseById(id: number) {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching expense:", error);
    return null;
  }

  return data as Expense;
}

export async function createExpense(input: {
  expenseDate: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  paymentMethod: string;
  supplier: string;
  invoiceNumber: string;
  notes: string;
  isPaid: boolean;
}) {
  const { error } = await supabaseAdmin.from("expenses").insert({
    expense_date: input.expenseDate || null,
    type: input.type,
    category: input.category,
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    paid_by: input.paidBy || null,
    payment_method: input.paymentMethod || null,
    supplier: input.supplier || null,
    invoice_number: input.invoiceNumber || null,
    notes: input.notes || null,
    is_paid: input.isPaid,
  });

  if (error) {
    console.error("Error creating expense:", error);
    throw new Error("No se pudo crear el gasto");
  }
}

export async function updateExpensePaidState(id: number, isPaid: boolean) {
  const { error } = await supabaseAdmin
    .from("expenses")
    .update({ is_paid: isPaid })
    .eq("id", id);

  if (error) {
    console.error("Error updating expense paid state:", error);
    throw new Error("No se pudo actualizar el estado del gasto");
  }
}

export async function deleteExpense(id: number) {
  const { error } = await supabaseAdmin
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting expense:", error);
    throw new Error("No se pudo eliminar el gasto");
  }
}