"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import {
  cancelSale,
  DeliveryStatus,
  markSaleAsPaid,
  markSaleAsShipped,
  updateSaleDeliveryStatus,
} from "@/data/saleService";

async function requireInternalUser() {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  return profile;
}

export async function markSaleAsPaidAction(id: number) {
  const profile = await requireInternalUser();

  await markSaleAsPaid(id, profile.id);

  revalidatePath("/internal/sales");
  revalidatePath(`/internal/sales/${id}`);
  revalidatePath("/internal/dashboard");
  revalidatePath("/internal/products");
}

export async function cancelSaleAction(id: number) {
  const profile = await requireInternalUser();

  await cancelSale(id, profile.id);

  revalidatePath("/internal/sales");
  revalidatePath(`/internal/sales/${id}`);
  revalidatePath("/internal/dashboard");
  revalidatePath("/internal/products");
}

export async function updateSaleDeliveryStatusAction(
  id: number,
  deliveryStatus: DeliveryStatus
) {
  await requireInternalUser();

  await updateSaleDeliveryStatus(id, deliveryStatus);

  revalidatePath("/internal/sales");
  revalidatePath(`/internal/sales/${id}`);
  revalidatePath("/internal/dashboard");
}

export async function markSaleAsShippedAction(id: number, formData: FormData) {
  await requireInternalUser();

  await markSaleAsShipped(id, {
    carrier: String(formData.get("carrier") || ""),
    trackingId: String(formData.get("trackingId") || ""),
    trackingUrl: String(formData.get("trackingUrl") || ""),
    shippingNotes: String(formData.get("shippingNotes") || ""),
  });

  revalidatePath("/internal/sales");
  revalidatePath(`/internal/sales/${id}`);
  revalidatePath("/internal/dashboard");
}