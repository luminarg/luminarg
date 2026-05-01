import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { getPublicProducts } from "@/data/productService";
import { getActivePriceTiers } from "@/data/priceTierService";
import CatalogoMayorista from "./CatalogoMayorista";

export const dynamic = "force-dynamic";

export default async function MayoristaCatalogoPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "mayorista") redirect("/login");

  const [allProducts, tiers] = await Promise.all([
    getPublicProducts(),
    getActivePriceTiers(),
  ]);

  const products = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    imageUrl: p.imageUrl ?? null,
    wholesalePrice: p.wholesalePrice,
    stock: p.stock,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Catalogo</p>
        <h1 className="mt-2 text-3xl font-light">Luminarias</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Precios mayoristas. Los descuentos se aplican automaticamente segun el total de unidades del pedido.
        </p>
      </header>
      <CatalogoMayorista products={products} tiers={tiers} />
    </div>
  );
}
