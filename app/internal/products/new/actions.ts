"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createProduct } from "@/data/productService";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { Product } from "@/data/schemas";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function uploadProductImage(slug: string, image: FormDataEntryValue | null) {
  if (!(image instanceof File) || image.size === 0) {
    return null;
  }

  const extension = image.name.split(".").pop() || "jpg";
  const filePath = `${slug}-${Date.now()}.${extension}`;

  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(filePath, image, {
      contentType: image.type,
      upsert: true,
    });

  if (error) {
    console.error("Error uploading product image:", error);
    throw new Error("No se pudo subir la imagen");
  }

  const { data } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createProductAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  const name = String(formData.get("name") || "");
  const sku = String(formData.get("sku") || "");
  const type = String(formData.get("type") || "");
  const collection = String(formData.get("collection") || "");
  const retailPrice = Number(formData.get("retailPrice") || 0);
  const wholesalePrice = Number(formData.get("wholesalePrice") || 0);
  const stock = Number(formData.get("stock") || 0);
  const status = String(
    formData.get("status") || "Disponible"
  ) as Product["status"];
  const description = String(formData.get("description") || "");
  const longDescription = String(formData.get("longDescription") || "");

  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  const slug = createSlug(`${name}-${sku}`);
  const imageUrl = await uploadProductImage(slug, formData.get("image"));

  await createProduct({
    slug,
    sku,
    name,
    type,
    collection,
    retailPrice,
    wholesalePrice,
    stock,
    status,
    description,
    longDescription,
    isActive,
    isFeatured,
    imageUrl,
  });

  revalidatePath("/products");
  revalidatePath("/internal/products");
  revalidatePath("/internal/dashboard");
  revalidatePath("/");

  redirect("/internal/products/new");
}