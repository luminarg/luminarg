"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { canManageUsers } from "@/data/roles";
import {
  createPriceTier,
  updatePriceTier,
  deletePriceTier,
} from "@/data/priceTierService";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || !canManageUsers(profile.role)) throw new Error("No autorizado");
}

export async function createTierAction(formData: FormData) {
  await requireAdmin();
  await createPriceTier({
    name: String(formData.get("name") || ""),
    min_quantity: Number(formData.get("min_quantity") || 1),
    max_quantity: formData.get("max_quantity") ? Number(formData.get("max_quantity")) : null,
    discount_pct: Number(formData.get("discount_pct") || 0),
    sort_order: Number(formData.get("sort_order") || 0),
  });
  revalidatePath("/internal/mayoristas/tiers");
}

export async function updateTierAction(id: number, formData: FormData) {
  await requireAdmin();
  await updatePriceTier(id, {
    name: String(formData.get("name") || ""),
    min_quantity: Number(formData.get("min_quantity") || 1),
    max_quantity: formData.get("max_quantity") ? Number(formData.get("max_quantity")) : null,
    discount_pct: Number(formData.get("discount_pct") || 0),
    is_active: formData.get("is_active") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
  });
  revalidatePath("/internal/mayoristas/tiers");
}

export async function deleteTierAction(id: number) {
  await requireAdmin();
  await deletePriceTier(id);
  revalidatePath("/internal/mayoristas/tiers");
}
