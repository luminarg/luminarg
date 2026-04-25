import Link from "next/link";
import { canSeeWholesalePrice, isInternalUser } from "@/data/roles";
import { getProductBySlug } from "@/data/productService";
import { getCurrentProfile } from "@/data/auth";
import ProductInfo from "@/app/components/ProductInfo";
import ProductQuickInfo from "@/app/components/ProductQuickInfo";
import ProductInternalPanel from "@/app/components/ProductInternalPanel";
import type { Metadata } from "next";
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
type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-light">Producto no encontrado</h1>
          <p className="mt-4 text-neutral-400">Slug buscado: {slug}</p>
          <Link href="/" className="mt-6 inline-block text-[#d6b36a]">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const profile = await getCurrentProfile();
  const customerType = profile?.role ?? "minorista";

  const visiblePrice = canSeeWholesalePrice(customerType)
    ? product.wholesalePrice
    : product.retailPrice;

  const priceLabel = canSeeWholesalePrice(customerType)
    ? "Precio mayorista"
    : "Precio minorista";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white">
          ← Volver
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
                buttonLabel={
                isInternalUser(customerType)
                ? "Editar producto"
                : "Comprar / Consultar"
                }
                buttonHref={
                isInternalUser(customerType)
                ? `/internal/products/${product.slug}`
                : undefined
                 }
/>

            <ProductQuickInfo
              product={product}
              visiblePrice={visiblePrice}
              priceLabel={priceLabel}
              showInternalData={isInternalUser(customerType)}
            />

            {isInternalUser(customerType) && (
              <ProductInternalPanel product={product} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}