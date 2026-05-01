"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { updateImportAgent, deleteImportAgent } from "@/data/importAgentService";

async function requireInternal() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }
}

export async function updateImportAgentAction(id: number, formData: FormData) {
  await requireInternal();

  await updateImportAgent(id, {
    name: String(formData.get("name") || ""),
    company: String(formData.get("company") || ""),
    contactName: String(formData.get("contactName") || ""),
    contactEmail: String(formData.get("contactEmail") || ""),
    contactPhone: String(formData.get("contactPhone") || ""),
    commissionRate: String(formData.get("commissionRate") || ""),
    notes: String(formData.get("notes") || ""),
    isActive: formData.get("isActive") === "on",
  });

  revalidatePath("/internal/import-agents");
  redirect("/internal/import-agents");
}

export async function deleteImportAgentAction(id: number) {
  await requireInternal();
  await deleteImportAgent(id);
  revalidatePath("/internal/import-agents");
  redirect("/internal/import-agents");
}
