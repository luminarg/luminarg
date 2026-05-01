"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { updateCompanySettings } from "@/data/companySettingsService";

async function requireInternal() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }
}

export async function updateCompanySettingsAction(formData: FormData) {
  await requireInternal();

  await updateCompanySettings({
    company_name: String(formData.get("company_name") || ""),
    company_cuit: String(formData.get("company_cuit") || ""),
    company_address: String(formData.get("company_address") || ""),
    company_phone: String(formData.get("company_phone") || ""),
    company_email: String(formData.get("company_email") || ""),
    company_web: String(formData.get("company_web") || ""),
    company_bank: String(formData.get("company_bank") || ""),
  });

  revalidatePath("/internal/settings");
}
