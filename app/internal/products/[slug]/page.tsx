import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import {
  getProductBySlug,
  updateProductBySlug,
} from "@/data/productService";
import { uploadProductImageAction } from "../actions";
import { Product } from "@/data/schemas";


export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function InternalProductPage({ params }: PageProps) {
  const { slug } = await params;

  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    return redirect("/");
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const productSlug = product.slug;
  const currentImageUrl = product.imageUrl ?? null;

  async function update(formData: FormData) {
    "use server";

    await updateProductBySlug(productSlug, {
      name: String(formData.get("name") || ""),
      sku: String(formData.get("sku") || ""),
      type: String(formData.get("type") || ""),
      collection: String(formData.get("collection") || ""),
      retailPrice: Number(formData.get("retailPrice") || 0),
      wholesalePrice: Number(formData.get("wholesalePrice") || 0),
      stock: Number(formData.get("stock") || 0),
      status: String(
        formData.get("status") || "Disponible"
      ) as Product["status"],
      description: String(formData.get("description") || ""),
      longDescription: String(formData.get("longDescription") || ""),
      isActive: formData.get("isActive") === "on",
      imageUrl: currentImageUrl,
      
    });

    revalidatePath("/products");
    revalidatePath("/internal/products");
    revalidatePath(`/internal/products/${productSlug}`);
    revalidatePath(`/products/${productSlug}`);
    redirect("/internal/products");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
              Gestión interna
            </p>
            <h1 className="mt-3 text-4xl font-light">Editar producto</h1>
          </div>

          <Link
            href="/internal/products"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30"
          >
            Volver
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="mb-4 text-xl font-light">Imagen del producto</h2>

          <div className="mb-6 h-[260px] w-full overflow-hidden rounded-xl bg-black">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={900}
                height={500}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                Sin imagen
              </div>
            )}
          </div>

          <form
  action={uploadProductImageAction}
  encType="multipart/form-data"
  className="flex flex-col gap-4"
>
            <input type="hidden" name="slug" value={product.slug} />

            <input
              type="file"
              name="image"
              accept="image/*"
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />

            <button
              type="submit"
              className="w-fit rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Subir / reemplazar imagen
            </button>
          </form>
        </div>

        <form
          action={update}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Nombre
              </label>
              <input
                name="name"
                defaultValue={product.name}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                SKU
              </label>
              <input
                name="sku"
                defaultValue={product.sku}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Tipo
              </label>
              <input
                name="type"
                defaultValue={product.type}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Colección
              </label>
              <input
                name="collection"
                defaultValue={product.collection}
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
                defaultValue={product.retailPrice}
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
                defaultValue={product.wholesalePrice}
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
                defaultValue={product.stock}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-400">
                Estado
              </label>
              <select
                name="status"
                defaultValue={product.status}
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
              >
                <option value="Disponible">Disponible</option>
                <option value="Bajo pedido">Bajo pedido</option>
                <option value="Sin stock">Sin stock</option>
              </select>
            </div>
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm text-neutral-300">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product.isActive}
            />
            Producto activo
          </label>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Descripción corta
            </label>
            <textarea
              name="description"
              defaultValue={product.description}
              className="min-h-[100px] w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Descripción larga
            </label>
            <textarea
              name="longDescription"
              defaultValue={product.longDescription}
              className="min-h-[160px] w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Guardar cambios
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