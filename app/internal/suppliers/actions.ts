"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { createSupplier, deleteSupplier } from "@/data/supplierService";

async function requireInternal() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }
}

export async function createSupplierAction(formData: FormData) {
  await requireInternal();

  await createSupplier({
    name: String(formData.get("name") || ""),
    country: String(formData.get("country") || ""),
    currency: String(formData.get("currency") || "USD"),
    contactName: String(formData.get("contactName") || ""),
    contactEmail: String(formData.get("contactEmail") || ""),
    contactPhone: String(formData.get("contactPhone") || ""),
    notes: String(formData.get("notes") || ""),
  });

  revalidatePath("/internal/suppliers");
}

export async function deleteSupplierAction(id: number) {
  await requireInternal();
  await deleteSupplier(id);
  revalidatePath("/internal/suppliers");
}
