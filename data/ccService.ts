import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type CCTransactionType = "cargo" | "pago" | "ajuste";

export type CCTransaction = {
  id: number;
  customer_id: string;
  type: CCTransactionType;
  amount: number;
  description: string | null;
  sale_id: number | null;
  balance_after: number | null;
  created_by: string | null;
  created_at: string;
};

function mapTx(row: any): CCTransaction {
  return {
    id: Number(row.id),
    customer_id: row.customer_id,
    type: row.type,
    amount: Number(row.amount ?? 0),
    description: row.description,
    sale_id: row.sale_id ? Number(row.sale_id) : null,
    balance_after: row.balance_after != null ? Number(row.balance_after) : null,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

export async function getCCTransactions(customerId: string): Promise<CCTransaction[]> {
  const { data } = await supabaseAdmin
    .from("cc_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapTx);
}

/** Registra un cargo (deuda) en la cuenta corriente */
export async function registerCargo(input: {
  customerId: string;
  amount: number;
  description: string;
  saleId?: number;
  createdBy?: string;
}): Promise<void> {
  // Obtener balance actual
  const { data: profile } = await supabaseAdmin
    .from("mayorista_profiles")
    .select("current_balance")
    .eq("id", input.customerId)
    .single();

  const currentBalance = Number(profile?.current_balance ?? 0);
  const newBalance = currentBalance + input.amount;

  await supabaseAdmin.from("cc_transactions").insert({
    customer_id: input.customerId,
    type: "cargo",
    amount: input.amount,
    description: input.description,
    sale_id: input.saleId ?? null,
    balance_after: newBalance,
    created_by: input.createdBy ?? null,
  });

  await supabaseAdmin
    .from("mayorista_profiles")
    .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", input.customerId);
}

/** Registra un pago recibido */
export async function registerPago(input: {
  customerId: string;
  amount: number;
  description: string;
  createdBy?: string;
}): Promise<void> {
  const { data: profile } = await supabaseAdmin
    .from("mayorista_profiles")
    .select("current_balance")
    .eq("id", input.customerId)
    .single();

  const currentBalance = Number(profile?.current_balance ?? 0);
  const newBalance = currentBalance - input.amount;

  await supabaseAdmin.from("cc_transactions").insert({
    customer_id: input.customerId,
    type: "pago",
    amount: input.amount,
    description: input.description,
    balance_after: newBalance,
    created_by: input.createdBy ?? null,
  });

  await supabaseAdmin
    .from("mayorista_profiles")
    .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", input.customerId);
}

/** Ajuste manual (positivo suma deuda, negativo resta) */
export async function registerAjuste(input: {
  customerId: string;
  amount: number;
  description: string;
  createdBy?: string;
}): Promise<void> {
  const { data: profile } = await supabaseAdmin
    .from("mayorista_profiles")
    .select("current_balance")
    .eq("id", input.customerId)
    .single();

  const currentBalance = Number(profile?.current_balance ?? 0);
  const newBalance = currentBalance + input.amount;

  await supabaseAdmin.from("cc_transactions").insert({
    customer_id: input.customerId,
    type: "ajuste",
    amount: Math.abs(input.amount),
    description: input.description,
    balance_after: newBalance,
    created_by: input.createdBy ?? null,
  });

  await supabaseAdmin
    .from("mayorista_profiles")
    .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", input.customerId);
}
