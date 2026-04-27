"use server";

import { createSaleFromCheckout } from "@/data/checkoutService";
import { getCurrentUser } from "@/data/auth";

export async function checkoutAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const cart = JSON.parse(String(formData.get("cart") || "[]"));

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
}