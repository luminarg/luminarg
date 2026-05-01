import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type PriceTier = {
  id: number;
  name: string;
  min_quantity: number;
  max_quantity: number | null;
  discount_pct: number;
  is_active: boolean;
  sort_order: number;
};

function mapTier(row: any): PriceTier {
  return {
    id: Number(row.id),
    name: row.name,
    min_quantity: Number(row.min_quantity),
    max_quantity: row.max_quantity != null ? Number(row.max_quantity) : null,
    discount_pct: Number(row.discount_pct ?? 0),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order ?? 0),
  };
}

export async function getPriceTiers(): Promise<PriceTier[]> {
  const { data } = await supabaseAdmin
    .from("price_tiers")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []).map(mapTier);
}

export async function getActivePriceTiers(): Promise<PriceTier[]> {
  const { data } = await supabaseAdmin
    .from("price_tiers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []).map(mapTier);
}

/** Dado un total de unidades, devuelve el tramo que aplica */
export function resolveTier(tiers: PriceTier[], totalQty: number): PriceTier | null {
  const active = tiers
    .filter((t) => t.is_active && totalQty >= t.min_quantity)
    .sort((a, b) => b.min_quantity - a.min_quantity);
  return active[0] ?? null;
}

/** Aplica el descuento del tramo a un precio base */
export function applyTierDiscount(basePrice: number, tier: PriceTier | null): number {
  if (!tier || tier.discount_pct <= 0) return basePrice;
  return basePrice * (1 - tier.discount_pct / 100);
}

export async function createPriceTier(input: {
  name: string;
  min_quantity: number;
  max_quantity: number | null;
  discount_pct: number;
  sort_order: number;
}): Promise<PriceTier> {
  const { data, error } = await supabaseAdmin
    .from("price_tiers")
    .insert(input)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Error creando tramo");
  return mapTier(data);
}

export async function updatePriceTier(
  id: number,
  input: Partial<{
    name: string;
    min_quantity: number;
    max_quantity: number | null;
    discount_pct: number;
    is_active: boolean;
    sort_order: number;
  }>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("price_tiers")
    .update(input)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePriceTier(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("price_tiers")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
