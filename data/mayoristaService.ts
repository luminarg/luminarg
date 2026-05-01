import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type PaymentType = "contado" | "cuenta_corriente";

export type MayoristaProfile = {
  id: string;
  email: string;
  company_name: string;
  cuit: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  contact_name: string | null;
  payment_type: PaymentType;
  credit_limit: number;
  current_balance: number;
  is_approved: boolean;
  notes: string | null;
  created_at: string;
};

function mapProfile(row: any): MayoristaProfile {
  return {
    id: row.id,
    email: row.email ?? row.profiles_email ?? "",
    company_name: row.company_name,
    cuit: row.cuit,
    address: row.address,
    city: row.city,
    province: row.province,
    phone: row.phone,
    contact_name: row.contact_name,
    payment_type: row.payment_type ?? "contado",
    credit_limit: Number(row.credit_limit ?? 0),
    current_balance: Number(row.current_balance ?? 0),
    is_approved: Boolean(row.is_approved),
    notes: row.notes,
    created_at: row.created_at,
  };
}

export async function getMayoristaProfiles(): Promise<MayoristaProfile[]> {
  const { data } = await supabaseAdmin
    .from("mayorista_profiles")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => mapProfile({
    ...row,
    email: (row.profiles as any)?.email ?? "",
  }));
}

export async function getMayoristaById(id: string): Promise<MayoristaProfile | null> {
  const { data } = await supabaseAdmin
    .from("mayorista_profiles")
    .select("*, profiles(email)")
    .eq("id", id)
    .single();

  if (!data) return null;
  return mapProfile({ ...data, email: (data.profiles as any)?.email ?? "" });
}

export async function createMayoristaProfile(
  userId: string,
  input: {
    company_name: string;
    cuit?: string;
    address?: string;
    city?: string;
    province?: string;
    phone?: string;
    contact_name?: string;
  }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("mayorista_profiles")
    .insert({ id: userId, ...input, is_approved: false });
  if (error) throw new Error(error.message);
}

export async function updateMayoristaProfile(
  id: string,
  input: Partial<{
    company_name: string;
    cuit: string;
    address: string;
    city: string;
    province: string;
    phone: string;
    contact_name: string;
    payment_type: PaymentType;
    credit_limit: number;
    is_approved: boolean;
    notes: string;
  }>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("mayorista_profiles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function approveMayorista(id: string): Promise<void> {
  await updateMayoristaProfile(id, { is_approved: true });
  // También actualizar el rol en profiles
  await supabaseAdmin
    .from("profiles")
    .update({ role: "mayorista" })
    .eq("id", id);
}

export async function getMayoristaOrders(customerId: string) {
  const { data } = await supabaseAdmin
    .from("sales")
    .select("id, status, payment_status, delivery_status, total_amount, created_at, sale_items(product_name, quantity)")
    .eq("customer_id", customerId)
    .neq("status", "cancelada")
    .order("created_at", { ascending: false });
  return data ?? [];
}
