import Link from "next/link";
import { canSeeWholesalePrice, isInternalUser } from "@/data/roles";
import { getProductBySlug } from "@/data/productService";
import ProductInfo from "@/app/components/ProductInfo";
import ProductQuickInfo from "@/app/components/ProductQuickInfo";
import ProductInternalPanel from "@/app/components/ProductInternalPanel";
import type { Metadata } from "next";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no encontrado | Luminarg",
      description: "El producto solicitado no se encuentra disponible.",
    };
  }

  return {
    title: `${product.name} | Luminarg`,
    description:
      product.description ||
      `Conocé ${product.name}, una luminaria de la colección ${product.collection}.`,
    openGraph: {
      title: `${product.name} | Luminarg`,
      description:
        product.description ||
        `Conocé ${product.name}, una luminaria de la colección ${product.collection}.`,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    return (
      <main className="min-h-screen bg-[#070707] text-white">
        

        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-light">Producto no encontrado</h1>
            <p className="mt-4 text-neutral-400">Slug buscado: {slug}</p>

            <Link
              href="/products"
              className="mt-6 inline-block text-[#d6b36a]"
            >
              Volver al catálogo
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const customerType = "minorista";

  const visiblePrice = canSeeWholesalePrice(customerType)
    ? product.wholesalePrice
    : product.retailPrice;

  const priceLabel = canSeeWholesalePrice(customerType)
    ? "Precio mayorista"
    : "Precio minorista";

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      
      <section className="px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/products"
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Volver al catálogo
          </Link>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div className="min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-black">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.3em] text-neutral-500">
                  Luminarg
                </div>
              )}
            </div>

            <div>
              <ProductInfo
                product={product}
                visiblePrice={visiblePrice}
                buttonLabel="Agregar al carrito"
              />

              <ProductQuickInfo
                product={product}
                visiblePrice={visiblePrice}
                priceLabel={priceLabel}
                showInternalData={false}
              />

              {isInternalUser(customerType) && (
                <ProductInternalPanel product={product} />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}