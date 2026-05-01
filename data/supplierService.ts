import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Supplier = {
  id: number;
  name: string;
  country: string | null;
  currency: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export async function getSuppliers(soloActivos = false): Promise<Supplier[]> {
  let query = supabaseAdmin.from("suppliers").select("*").order("name");
  if (soloActivos) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as Supplier[];
}

export async function getSupplierById(id: number): Promise<Supplier | null> {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Supplier;
}

export async function createSupplier(input: {
  name: string;
  country: string;
  currency: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}) {
  const { error } = await supabaseAdmin.from("suppliers").insert({
    name: input.name,
    country: input.country || null,
    currency: input.currency || "USD",
    contact_name: input.contactName || null,
    contact_email: input.contactEmail || null,
    contact_phone: input.contactPhone || null,
    notes: input.notes || null,
    is_active: true,
  });
  if (error) throw new Error("No se pudo crear el proveedor");
}

export async function updateSupplier(
  id: number,
  input: {
    name: string;
    country: string;
    currency: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
    isActive: boolean;
  }
) {
  const { error } = await supabaseAdmin
    .from("suppliers")
    .update({
      name: input.name,
      country: input.country || null,
      currency: input.currency || "USD",
      contact_name: input.contactName || null,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      notes: input.notes || null,
      is_active: input.isActive,
    })
    .eq("id", id);
  if (error) throw new Error("No se pudo actualizar el proveedor");
}

export async function deleteSupplier(id: number) {
  const { error } = await supabaseAdmin
    .from("suppliers")
    .delete()
    .eq("id", id);
  if (error) throw new Error("No se pudo eliminar el proveedor");
}
