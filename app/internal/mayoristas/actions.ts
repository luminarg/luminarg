"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { approveMayorista, updateMayoristaProfile } from "@/data/mayoristaService";
import { registerPago, registerAjuste } from "@/data/ccService";

async function requireInternal() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) throw new Error("No autorizado");
  return profile;
}

export async function approveMayoristaAction(id: string) {
  await requireInternal();
  await approveMayorista(id);
  revalidatePath("/internal/mayoristas");
  revalidatePath(`/internal/mayoristas/${id}`);
}

export async function updateMayoristaAction(id: string, formData: FormData) {
  await requireInternal();
  await updateMayoristaProfile(id, {
    company_name: String(formData.get("company_name") || ""),
    cuit: String(formData.get("cuit") || ""),
    address: String(formData.get("address") || ""),
    city: String(formData.get("city") || ""),
    province: String(formData.get("province") || ""),
    phone: String(formData.get("phone") || ""),
    contact_name: String(formData.get("contact_name") || ""),
    payment_type: (formData.get("payment_type") as "contado" | "cuenta_corriente") || "contado",
    credit_limit: Number(formData.get("credit_limit") || 0),
    notes: String(formData.get("notes") || ""),
  });
  revalidatePath("/internal/mayoristas");
  revalidatePath(`/internal/mayoristas/${id}`);
}

export async function registerPagoAction(id: string, formData: FormData) {
  const profile = await requireInternal();
  await registerPago({
    customerId: id,
    amount: Number(formData.get("amount") || 0),
    description: String(formData.get("description") || "Pago recibido"),
    createdBy: profile.id,
  });
  revalidatePath(`/internal/mayoristas/${id}`);
}

export async function registerAjusteAction(id: string, formData: FormData) {
  const profile = await requireInternal();
  const raw = Number(formData.get("amount") || 0);
  const direction = formData.get("direction") as string;
  const amount = direction === "credito" ? -Math.abs(raw) : Math.abs(raw);
  await registerAjuste({
    customerId: id,
    amount,
    description: String(formData.get("description") || "Ajuste manual"),
    createdBy: profile.id,
  });
  revalidatePath(`/internal/mayoristas/${id}`);
}
