import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type CompanySettings = {
  company_name: string;
  company_cuit: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_web: string;
  company_bank: string;
};

const DEFAULTS: CompanySettings = {
  company_name: "",
  company_cuit: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_web: "",
  company_bank: "",
};

export async function getCompanySettings(): Promise<CompanySettings> {
  const { data, error } = await supabaseAdmin
    .from("company_settings")
    .select("key, value");

  if (error || !data) return { ...DEFAULTS };

  const settings = { ...DEFAULTS };
  for (const row of data as any[]) {
    if (row.key in settings) {
      (settings as any)[row.key] = row.value ?? "";
    }
  }
  return settings;
}

export async function updateCompanySettings(
  settings: Partial<CompanySettings>
) {
  const entries = Object.entries(settings);
  for (const [key, value] of entries) {
    const { error } = await supabaseAdmin
      .from("company_settings")
      .upsert({ key, value: value ?? "", updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(`No se pudo guardar ${key}`);
  }
}
