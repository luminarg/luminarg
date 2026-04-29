
import ProductCard from "@/app/components/ProductCard";
import { canSeeWholesalePrice, isInternalUser } from "@/data/roles";
import { getPublicProducts } from "@/data/productService";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de luminarias | Luminarg",
  description:
    "Explorá el catálogo de luminarias Luminarg: diseños modernos, decorativos y funcionales para hogares, comercios y proyectos.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const customerType = "minorista";
  const products = await getPublicProducts();

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      

      <section className="px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
                Luminarg
              </p>

              <h1 className="mt-3 text-4xl font-light">Catálogo</h1>

              <p className="mt-3 max-w-2xl text-neutral-400">
                Explorá la selección de luminarias LUMINARG y encontrá la pieza ideal para tu espacio.
              </p>
            </div>

            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-400">
              Vista actual: minorista
            </div>
          </div>

          {products.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.03] p-8 text-neutral-400">
              No hay productos disponibles por el momento.
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </main>
  );
}