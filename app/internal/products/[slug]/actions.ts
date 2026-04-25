"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProductBySlug } from "@/data/productService";
import { Product } from "@/data/schemas";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export async function saveProductAction(slug: string, formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  const status = formData.get("status") as Product["status"];

  await updateProductBySlug(slug, {
    name: String(formData.get("name") || ""),
    sku: String(formData.get("sku") || ""),
    type: String(formData.get("type") || ""),
    collection: String(formData.get("collection") || ""),
    retailPrice: Number(formData.get("retailPrice") || 0),
    wholesalePrice: Number(formData.get("wholesalePrice") || 0),
    stock: Number(formData.get("stock") || 0),
    status,
    description: String(formData.get("description") || ""),
    longDescription: String(formData.get("longDescription") || ""),
    isActive: formData.get("isActive") === "on",
  });

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/internal/products");
  revalidatePath(`/internal/products/${slug}`);
  revalidatePath("/");

  redirect("/internal/products");
}