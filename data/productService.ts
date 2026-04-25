import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Product } from "@/data/schemas";

function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    type: row.type,
    collection: row.collection,
    retailPrice: Number(row.retail_price),
    wholesalePrice: Number(row.wholesale_price),
    stock: row.stock,
    status: row.status,
    description: row.description,
    longDescription: row.long_description,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    imageUrl: row.image_url ?? null,
  };
}

export async function getPublicProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching public products:", error);
    return [];
  }

  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching all products:", error);
    return [];
  }

  return Array.isArray(data) ? data.map(mapProduct) : [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }

  return data ? mapProduct(data) : null;
}

type UpdateProductInput = {
  name: string;
  sku: string;
  type: string;
  collection: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  status: Product["status"];
  description: string;
  longDescription: string;
  isActive: boolean;
  imageUrl?: string | null;
};

export async function updateProductBySlug(
  slug: string,
  input: UpdateProductInput
) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      name: input.name,
      sku: input.sku,
      type: input.type,
      collection: input.collection,
      retail_price: input.retailPrice,
      wholesale_price: input.wholesalePrice,
      stock: input.stock,
      status: input.status,
      description: input.description,
      long_description: input.longDescription,
      is_active: input.isActive,
      image_url: input.imageUrl ?? null,
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw new Error("No se pudo actualizar el producto");
  }

  return data;
}

type CreateProductInput = {
  slug: string;
  sku: string;
  name: string;
  type: string;
  collection: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  status: Product["status"];
  description: string;
  longDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string | null;
};

export async function createProduct(input: CreateProductInput) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      slug: input.slug,
      sku: input.sku,
      name: input.name,
      type: input.type,
      collection: input.collection,
      retail_price: input.retailPrice,
      wholesale_price: input.wholesalePrice,
      stock: input.stock,
      status: input.status,
      description: input.description,
      long_description: input.longDescription,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw new Error("No se pudo crear el producto");
  }

  return data;
}

export async function setProductActiveState(slug: string, isActive: boolean) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      is_active: isActive,
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    console.error("Error updating product active state:", error);
    throw new Error("No se pudo cambiar el estado del producto");
  }

  return data;
}

export async function updateProductImage(slug: string, imageUrl: string) {
  const { error } = await supabaseAdmin
    .from("products")
    .update({
      image_url: imageUrl,
    })
    .eq("slug", slug);

  if (error) {
    console.error("Error updating product image:", error);
    throw new Error("No se pudo guardar la imagen");
  }
}