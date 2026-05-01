"use server";

import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { createPurchaseOrder } from "@/data/purchaseService";
import { sugerirReposicion, type SugerenciaReposicion } from "@/data/aiService";

async function requireInternal() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }
}

// ─── Crear orden de compra ────────────────────────────────────────────────────

type CreatePOPayload = {
  orderNumber: string;
  supplierId: number | null;
  importAgentId: number | null;
  orderDate: string;
  estimatedArrival: string;
  currency: string;
  exchangeRate: number | null;
  notes: string;
  items: Array<{
    productId: number | null;
    description: string;
    quantity: number;
    unitPrice: number | null;
    currency: string;
    notes: string;
  }>;
  costs: Array<{
    type: string;
    description: string;
    amount: number;
    currency: string;
    isPaid: boolean;
  }>;
  payments: Array<{
    type: string;
    description: string;
    amount: number;
    currency: string;
    scheduledDate: string;
    isPaid: boolean;
    paymentMethod: string;
  }>;
};

export async function createPurchaseOrderAction(
  data: CreatePOPayload
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    await requireInternal();

    if (!data.orderNumber) return { success: false, error: "Falta el número de OC" };
    if (data.items.length === 0) return { success: false, error: "Agregá al menos un producto" };

    const id = await createPurchaseOrder(data);
    return { success: true, id };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Error desconocido" };
  }
}

// ─── Sugerencia IA ────────────────────────────────────────────────────────────

export async function getSuggestionsAction(): Promise<{
  success: boolean;
  data?: SugerenciaReposicion;
  error?: string;
}> {
  try {
    await requireInternal();
    const data = await sugerirReposicion();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Error al consultar la IA" };
  }
}
