import ProductCard from "@/app/components/ProductCard";
import { canSeeWholesalePrice, isInternalUser } from "@/data/roles";
import { getPublicProducts } from "@/data/productService";
import { getCurrentProfile } from "@/data/auth";
export const dynamic = "force-dynamic";
export default async function ProductsPage() {
  const profile = await getCurrentProfile();
  const customerType = profile?.role ?? "minorista";
  const products = await getPublicProducts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-light">
              {isInternalUser(customerType)
                ? "Vista interna de catálogo"
                : "Catálogo"}
            </h1>

            <p className="mt-3 max-w-2xl text-neutral-400">
              {isInternalUser(customerType)
                ? "Visualización operativa de productos, stock y estado comercial."
                : "Explorá la selección de luminarias LUMINARG y encontrá la pieza ideal para tu espacio."}
            </p>
          </div>

          <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-400">
            Vista actual: {customerType}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => {
            const visiblePrice = canSeeWholesalePrice(customerType)
              ? product.wholesalePrice
              : product.retailPrice;

            return (
              <ProductCard
                key={product.id}
                product={product}
                visiblePrice={visiblePrice}
                isInternalView={isInternalUser(customerType)}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}