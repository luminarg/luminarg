import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ImportAgent = {
  id: number;
  name: string;
  company: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  commission_rate: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export async function getImportAgents(soloActivos = false): Promise<ImportAgent[]> {
  let query = supabaseAdmin.from("import_agents").select("*").order("name");
  if (soloActivos) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as ImportAgent[];
}

export async function getImportAgentById(id: number): Promise<ImportAgent | null> {
  const { data, error } = await supabaseAdmin
    .from("import_agents")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as ImportAgent;
}

export async function createImportAgent(input: {
  name: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  commissionRate: string;
  notes: string;
}) {
  const { error } = await supabaseAdmin.from("import_agents").insert({
    name: input.name,
    company: input.company || null,
    contact_name: input.contactName || null,
    contact_email: input.contactEmail || null,
    contact_phone: input.contactPhone || null,
    commission_rate: input.commissionRate ? Number(input.commissionRate) : null,
    notes: input.notes || null,
    is_active: true,
  });
  if (error) throw new Error("No se pudo crear el agente");
}

export async function updateImportAgent(
  id: number,
  input: {
    name: string;
    company: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    commissionRate: string;
    notes: string;
    isActive: boolean;
  }
) {
  const { error } = await supabaseAdmin
    .from("import_agents")
    .update({
      name: input.name,
      company: input.company || null,
      contact_name: input.contactName || null,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      commission_rate: input.commissionRate ? Number(input.commissionRate) : null,
      notes: input.notes || null,
      is_active: input.isActive,
    })
    .eq("id", id);
  if (error) throw new Error("No se pudo actualizar el agente");
}

export async function deleteImportAgent(id: number) {
  const { error } = await supabaseAdmin
    .from("import_agents")
    .delete()
    .eq("id", id);
  if (error) throw new Error("No se pudo eliminar el agente");
}
