"use server";

import { createSaleFromCheckout } from "@/data/checkoutService";
import { getCurrentUser } from "@/data/auth";

export async function checkoutAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "No estás autenticado." };
    }

    const cart = JSON.parse(String(formData.get("cart") || "[]"));

    if (!Array.isArray(cart) || cart.length === 0) {
      return { success: false, error: "El carrito está vacío." };
    }

    const shipping = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      street: String(formData.get("street") || ""),
      number: String(formData.get("number") || ""),
      floorApartment: String(formData.get("floorApartment") || ""),
      city: String(formData.get("city") || ""),
      province: String(formData.get("province") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      reference: String(formData.get("reference") || ""),
    };

    const sale = await createSaleFromCheckout({
      userId: user.id,
      userEmail: user.email ?? null,
      cart,
      shipping,
    });

    return { success: true, saleId: sale.id };
  } catch (error: any) {
    console.error("Checkout error:", error);

    return {
      success: false,
      error: error?.message || "No se pudo confirmar el pedido.",
    };
  }
}