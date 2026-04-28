"use server";

import { createSaleFromCheckout } from "@/data/checkoutService";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function checkoutAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Debes iniciar sesión para finalizar la compra.",
    };
  }

  try {
    const cart = JSON.parse(String(formData.get("cart") || "[]"));

    const shipping = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      street: String(formData.get("street") || ""),
      number: String(formData.get("number") || ""),
      city: String(formData.get("city") || ""),
      province: String(formData.get("province") || ""),
    };

    const sale = await createSaleFromCheckout({
      userId: user.id,
      userEmail: user.email ?? null,
      cart,
      shipping,
    });

    return { success: true, saleId: sale.id };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Error en checkout",
    };
  }
}