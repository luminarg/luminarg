import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/data/productService";
import {
  toggleProductActiveAction,
  uploadProductImageAction,
} from "./actions";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { InternalHeader } from "@/app/components/internal/InternalHeader";

export const dynamic = "force-dynamic";

export default async function InternalProductsPage() {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-light">Acceso restringido</h1>
        </div>
      </main>
    );
  }

  const products = await getAllProducts();

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-7xl space-y-10">

        <InternalHeader
  title="Productos"
  description="Gestión interna de catálogo"
  actions={
    <Link
      href="/internal/products/new"
      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
    >
      + Nuevo producto
    </Link>
  }
/>



        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              {/* IMAGEN */}
              <div className="mb-4 h-[180px] w-full overflow-hidden rounded-xl bg-black">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">
                  {product.name}
                </h3>

                <p className="text-sm text-neutral-400">
                  SKU: {product.sku}
                </p>

                <p className="text-sm text-neutral-400">
                  Stock: {product.stock}
                </p>
              </div>

              {/* SUBIR IMAGEN */}
              

              {/* ESTADO */}
              <form
                action={toggleProductActiveAction.bind(
                  null,
                  product.slug,
                  !product.isActive
                )}
                className="mt-4"
              >
                <button
                  type="submit"
                  className={`w-full rounded-full px-4 py-2 text-xs ${
                    product.isActive
                      ? "border border-red-500/30 text-red-300"
                      : "border border-green-500/30 text-green-300"
                  }`}
                >
                  {product.isActive ? "Desactivar" : "Activar"}
                </button>
              </form>

              {/* LINK */}
              <Link
                href={`/internal/products/${product.slug}`}
                className="mt-3 block text-center text-xs text-neutral-400 hover:text-white"
              >
                Editar producto
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}