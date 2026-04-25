import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { createProductAction } from "./actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
const profile = await getCurrentProfile();

if (!profile || !isInternalUser(profile.role)) {
  redirect("/login");
}
export default async function NewInternalProductPage() {
  const profile = await getCurrentProfile();
  const userRole = profile?.role;

  if (!userRole || !isInternalUser(userRole)) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-light">Acceso restringido</h1>
          <p className="mt-4 text-neutral-400">
            Esta sección está disponible solo para usuarios internos.
          </p>

          <Link href="/" className="mt-6 inline-block text-[#d6b36a]">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
              Gestión interna
            </p>
            <h1 className="mt-3 text-4xl font-light">Nuevo producto</h1>
          </div>

          <Link
            href="/internal/products"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30"
          >
            Volver
          </Link>
        </div>

      <form
  action={createProductAction}

  className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Nombre
              </label>
              <input
                name="name"
                required
                placeholder="Ej: Lámpara Globo Vidrio Gris"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                SKU
              </label>
              <input
                name="sku"
                required
                placeholder="Ej: LUM-002"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Tipo
              </label>
              <input
                name="type"
                placeholder="Ej: Colgante"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Colección
              </label>
              <input
                name="collection"
                placeholder="Ej: Glass"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Precio minorista
              </label>
              <input
                name="retailPrice"
                type="number"
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Precio mayorista
              </label>
              <input
                name="wholesalePrice"
                type="number"
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                placeholder="0"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Estado
              </label>
              <select
                name="status"
                defaultValue="Disponible"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option value="Disponible">Disponible</option>
                <option value="Bajo pedido">Bajo pedido</option>
                <option value="Sin stock">Sin stock</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm text-neutral-300">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="h-4 w-4"
              />
              Producto activo
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                className="h-4 w-4"
              />
              Producto destacado
            </label>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Descripción corta
            </label>
            <textarea
              name="description"
              placeholder="Resumen visible del producto"
              className="min-h-[100px] w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Descripción larga
            </label>
            <textarea
              name="longDescription"
              placeholder="Detalle completo del producto"
              className="min-h-[160px] w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>
<div className="mt-6">
  <label className="mb-2 block text-sm text-neutral-400">
    Imagen del producto
  </label>
  <input
    type="file"
    name="image"
    accept="image/*"
    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
  />
</div>
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Crear producto
            </button>

            <Link
              href="/internal/products"
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}