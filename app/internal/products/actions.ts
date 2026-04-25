"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  setProductActiveState,
  updateProductImage,
} from "@/data/productService";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export async function toggleProductActiveAction(
  slug: string,
  nextState: boolean
) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  await setProductActiveState(slug, nextState);

  revalidatePath("/products");
  revalidatePath("/internal/products");
  revalidatePath(`/internal/products/${slug}`);
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
}

export async function uploadProductImageAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    throw new Error("No autorizado");
  }

  const slug = String(formData.get("slug") || "");
  const image = formData.get("image");

  if (!slug) {
    throw new Error("Producto inválido");
  }

  if (!image || typeof image === "string") {
    throw new Error("Imagen inválida");
  }

  const file = image as File;

if (file.size === 0) {
  throw new Error("Imagen inválida");
}

const extension =
  file.type === "image/png"
    ? "png"
    : file.type === "image/webp"
    ? "webp"
    : "jpg";
  const filePath = `${slug}-${Date.now()}.${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading product image:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(filePath);

  await updateProductImage(slug, data.publicUrl);

  revalidatePath("/products");
  revalidatePath("/internal/products");
  revalidatePath(`/internal/products/${slug}`);
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
}