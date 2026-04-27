import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  paid: boolean;
  created_at: string;
};

export async function getExpenses(filters?: {
  type?: string;
  category?: string;
  currency?: string;
  paid?: string;
}) {
  let query = supabaseAdmin.from("expenses").select("*").order("created_at", {
    ascending: false,
  });

  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.currency) query = query.eq("currency", filters.currency);
  if (filters?.paid === "paid") query = query.eq("paid", true);
  if (filters?.paid === "pending") query = query.eq("paid", false);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data as Expense[];
}

export async function createExpense(input: {
  description: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  paid: boolean;
}) {
  const { error } = await supabaseAdmin.from("expenses").insert({
    description: input.description,
    amount: input.amount,
    currency: input.currency,
    type: input.type,
    category: input.category,
    paid: input.paid,
  });

  if (error) throw new Error("Error creando gasto");
}

export async function toggleExpensePaid(id: string, paid: boolean) {
  const { error } = await supabaseAdmin
    .from("expenses")
    .update({ paid })
    .eq("id", id);

  if (error) throw new Error("Error actualizando gasto");
}
