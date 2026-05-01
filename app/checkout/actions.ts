"use server";

import { createSaleFromCheckout } from "@/data/checkoutService";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function checkoutAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesion para finalizar la compra." };
  }

  try {
    const cart = JSON.parse(String(formData.get("cart") || "[]"));
    const shipping = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      street: String(formData.get("street") || ""),
      number: String(formData.get("number") || ""),
      floorApartment: String(formData.get("floorApartment") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      city: String(formData.get("city") || ""),
      province: String(formData.get("province") || ""),
      reference: String(formData.get("reference") || ""),
      notes: String(formData.get("notes") || ""),
    };
    const sale = await createSaleFromCheckout({ userId: user.id, userEmail: user.email ?? null, cart, shipping });
    return { success: true, saleId: sale.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error en checkout" };
  }
}
