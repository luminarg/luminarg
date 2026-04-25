import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ExpenseType =
  | "general"
  | "partner_contribution"
  | "purchase"
  | "installer_expense"
  | "tax"
  | "shipping"
  | "customs";

export type ExpenseCategory =
  | "estructura"
  | "mercaderia"
  | "viaticos"
  | "marketing"
  | "sistemas"
  | "impuestos"
  | "servicios"
  | "otros";

export type Expense = {
  id: number;
  expenseDate: string;
  type: ExpenseType;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  paidBy: string | null;
  paymentMethod: string | null;
  supplier: string | null;
  invoiceNumber: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
};

function mapExpense(row: any): Expense {
  return {
    id: row.id,
    expenseDate: row.expense_date,
    type: row.type,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    paidBy: row.paid_by,
    paymentMethod: row.payment_method,
    supplier: row.supplier,
    invoiceNumber: row.invoice_number,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

type GetExpensesFilters = {
  type?: string;
  category?: string;
  currency?: string;
  paidBy?: string;
};

export async function getExpenses(
  filters: GetExpensesFilters = {}
): Promise<Expense[]> {
  let query = supabaseAdmin
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("id", { ascending: false });

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.currency && filters.currency !== "all") {
    query = query.eq("currency", filters.currency);
  }

  if (filters.paidBy) {
    query = query.ilike("paid_by", `%${filters.paidBy}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }

  return Array.isArray(data) ? data.map(mapExpense) : [];
}

export type CreateExpenseInput = {
  expenseDate: string;
  type: ExpenseType;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  paidBy?: string;
  paymentMethod?: string;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
  createdBy?: string;
};

export async function createExpense(input: CreateExpenseInput) {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .insert({
      expense_date: input.expenseDate,
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
      created_by: input.createdBy || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating expense:", error);
    throw new Error("No se pudo crear el gasto");
  }

  return data;
}

export type UpdateExpenseInput = {
  expenseDate: string;
  type: ExpenseType;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  paidBy?: string;
  paymentMethod?: string;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
};

export async function updateExpenseById(id: number, input: UpdateExpenseInput) {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .update({
      expense_date: input.expenseDate,
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
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating expense:", error);
    throw new Error("No se pudo actualizar el gasto");
  }

  return data;
}
export async function getExpenseById(id: number): Promise<Expense | null> {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching expense by id:", error);
    return null;
  }

  return data ? mapExpense(data) : null;
}
export async function deleteExpenseById(id: number) {
  const { error } = await supabaseAdmin
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting expense:", error);
    throw new Error("No se pudo eliminar el gasto");
  }
}
export type ExpenseTotals = {
  totalByCurrency: Record<string, number>;
  totalByType: Record<string, number>;
  totalByCategory: Record<string, number>;
  totalByPaidBy: Record<string, number>;
};

export function calculateExpenseTotals(expenses: Expense[]): ExpenseTotals {
  return expenses.reduce<ExpenseTotals>(
    (totals, expense) => {
      totals.totalByCurrency[expense.currency] =
        (totals.totalByCurrency[expense.currency] || 0) + expense.amount;

      totals.totalByType[expense.type] =
        (totals.totalByType[expense.type] || 0) + expense.amount;

      totals.totalByCategory[expense.category] =
        (totals.totalByCategory[expense.category] || 0) + expense.amount;

      const paidBy = expense.paidBy || "Sin especificar";

      totals.totalByPaidBy[paidBy] =
        (totals.totalByPaidBy[paidBy] || 0) + expense.amount;

      return totals;
    },
    {
      totalByCurrency: {},
      totalByType: {},
      totalByCategory: {},
      totalByPaidBy: {},
    }
  );
}
