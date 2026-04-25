export type ProductStatus = "Disponible" | "Bajo pedido" | "Sin stock";

export type Product = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  type: string;
  collection: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  status: ProductStatus;
  description: string;
  longDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string | null;
};