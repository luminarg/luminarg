import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/data/productService";
import { toggleProductActiveAction } from "./actions";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InternalProductsPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const products = await getAllProducts();

  return (
    <main className="space-y-8 px-1 py-8 text-white">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Catalogo</p>
          <h1 className="mt-3 text-3xl font-light">Productos</h1>
          <p className="mt-2 text-sm text-neutral-500">Gestion interna del catalogo de luminarias.</p>
        </div>
        <Link href="/internal/products/new" className="shrink-0 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
          + Nuevo producto
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-neutral-500">
          No hay productos cargados.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="h-[180px] w-full overflow-hidden bg-black">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-neutral-600">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-light text-white">{product.name}</h3>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      {product.sku && <span>SKU: {product.sku} · </span>}
                      Stock: {product.stock}
                    </p>
                  </div>
                  <span className={product.isActive ? "badge badge-green" : "badge badge-neutral"}>
                    {product.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/internal/products/${product.slug}`}
                    className="flex-1 border border-white/[0.08] px-3 py-2 text-center text-xs text-neutral-400 transition hover:border-white/20 hover:text-white"
                  >
                    Editar
                  </Link>
                  <form action={toggleProductActiveAction.bind(null, product.slug, !product.isActive)}>
                    <button
                      type="submit"
                      className={`px-3 py-2 text-xs transition border ${
                        product.isActive
                          ? "border-red-800/40 text-red-400 hover:border-red-600/60"
                          : "border-green-800/40 text-green-400 hover:border-green-600/60"
                      }`}
                    >
                      {product.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
