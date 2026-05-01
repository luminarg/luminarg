"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import {
  updatePurchaseOrderStatus,
  updatePurchaseOrder,
  addCostToPurchaseOrder,
  addPaymentToPurchaseOrder,
  toggleCostPaid,
  togglePaymentPaid,
  deleteCost,
  deletePayment,
  type PurchaseOrderStatus,
} from "@/data/purchaseService";
import {
  distribuirCostosImportacion,
  type ItemParaDistribucion,
  type CostoAdicional,
  type DistribucionCostos,
} from "@/data/aiService";

async function requireInternal() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) throw new Error("No autorizado");
}

function revalidate(id: number) {
  revalidatePath(`/internal/purchases/${id}`);
  revalidatePath("/internal/purchases");
  revalidatePath("/internal/dashboard");
}

// ─── Estado de la OC ──────────────────────────────────────────────────────────

export async function updateStatusAction(
  id: number,
  status: PurchaseOrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireInternal();
    await updatePurchaseOrderStatus(id, status);
    revalidate(id);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Costos adicionales ───────────────────────────────────────────────────────

export async function addCostAction(formData: FormData) {
  await requireInternal();
  const id = Number(formData.get("orderId"));
  await addCostToPurchaseOrder(id, {
    type: String(formData.get("type") || "otros"),
    description: String(formData.get("description") || ""),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "ARS"),
    isPaid: formData.get("isPaid") === "on",
  });
  revalidate(id);
}

export async function toggleCostAction(costId: number, orderId: number, current: boolean) {
  await requireInternal();
  await toggleCostPaid(costId, current);
  revalidate(orderId);
}

export async function deleteCostAction(costId: number, orderId: number) {
  await requireInternal();
  await deleteCost(costId);
  revalidate(orderId);
}

// ─── Pagos ────────────────────────────────────────────────────────────────────

export async function addPaymentAction(formData: FormData) {
  await requireInternal();
  const id = Number(formData.get("orderId"));
  await addPaymentToPurchaseOrder(id, {
    type: String(formData.get("type") || "adelanto"),
    description: String(formData.get("description") || ""),
    amount: Number(formData.get("amount") || 0),
    currency: String(formData.get("currency") || "USD"),
    scheduledDate: String(formData.get("scheduledDate") || ""),
    paymentMethod: String(formData.get("paymentMethod") || ""),
  });
  revalidate(id);
}

export async function togglePaymentAction(paymentId: number, orderId: number, current: boolean) {
  await requireInternal();
  await togglePaymentPaid(paymentId, current);
  revalidate(orderId);
}

export async function deletePaymentAction(paymentId: number, orderId: number) {
  await requireInternal();
  await deletePayment(paymentId);
  revalidate(orderId);
}

// ─── Editar datos de la orden ─────────────────────────────────────────────────

export async function updateOrderAction(formData: FormData) {
  await requireInternal();
  const id = Number(formData.get("orderId"));
  await updatePurchaseOrder(id, {
    orderDate: String(formData.get("orderDate") || "") || null,
    estimatedArrival: String(formData.get("estimatedArrival") || "") || null,
    currency: String(formData.get("currency") || "USD"),
    exchangeRate: formData.get("exchangeRate") ? Number(formData.get("exchangeRate")) : null,
    notes: String(formData.get("notes") || "") || null,
  });
  revalidate(id);
}

// ─── IA: Distribución de costos ───────────────────────────────────────────────

export async function distribuirCostosAction(input: {
  items: ItemParaDistribucion[];
  costos_adicionales: CostoAdicional[];
  tipo_de_cambio: number;
}): Promise<{ success: boolean; data?: DistribucionCostos; error?: string }> {
  try {
    await requireInternal();
    const data = await distribuirCostosImportacion(input);
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
