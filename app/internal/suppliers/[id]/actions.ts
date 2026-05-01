"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { updateSupplier, deleteSupplier } from "@/data/supplierService";

async function requireInternal() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }
}

export async function updateSupplierAction(id: number, formData: FormData) {
  await requireInternal();

  await updateSupplier(id, {
    name: String(formData.get("name") || ""),
    country: String(formData.get("country") || ""),
    currency: String(formData.get("currency") || "USD"),
    contactName: String(formData.get("contactName") || ""),
    contactEmail: String(formData.get("contactEmail") || ""),
    contactPhone: String(formData.get("contactPhone") || ""),
    notes: String(formData.get("notes") || ""),
    isActive: formData.get("isActive") === "on",
  });

  revalidatePath("/internal/suppliers");
  redirect("/internal/suppliers");
}

export async function deleteSupplierAction(id: number) {
  await requireInternal();
  await deleteSupplier(id);
  revalidatePath("/internal/suppliers");
  redirect("/internal/suppliers");
}
