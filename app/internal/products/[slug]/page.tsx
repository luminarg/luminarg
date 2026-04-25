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
  params: Promise<{ slug: string }>;
};

export default async function InternalProductPage({ params }: PageProps) {
  const { slug } = await params;

  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    redirect("/login");
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
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
      status: String(formData.get("status") || "Disponible") as Product["status"],
      description: String(formData.get("description") || ""),
      longDescription: String(formData.get("longDescription") || ""),
      isActive: formData.get("isActive") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      imageUrl: currentImageUrl,
    });

    revalidatePath("/products");
    revalidatePath("/internal/products");
    revalidatePath(`/internal/products/${productSlug}`);
    revalidatePath(`/products/${productSlug}`);
    revalidatePath("/");

    redirect("/internal/products");
  }

  return (
    <main className="min-h-screen px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
              Gestión interna
            </p>
            <h1 className="mt-3 text-4xl font-light">Editar producto</h1>
          </div>

          <Link
            href="/internal/products"
            className="border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30"
          >
            Volver
          </Link>
        </div>

        <section className="border border-white/10 bg-white/[0.03] p-8">
          <h2 className="mb-4 text-xl font-light">Imagen del producto</h2>

          <div className="mb-6 h-[260px] w-full overflow-hidden bg-black">
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

          <form action={uploadProductImageAction} className="flex flex-col gap-4">
            <input type="hidden" name="slug" value={product.slug} />
            <input type="file" name="image" accept="image/*" className="input-dark" />

            <button
              type="submit"
              className="w-fit bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Subir / reemplazar imagen
            </button>
          </form>
        </section>

        <form action={update} className="border border-white/10 bg-white/[0.03] p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Nombre">
              <input name="name" defaultValue={product.name} className="input-dark" />
            </Field>

            <Field label="SKU">
              <input name="sku" defaultValue={product.sku} className="input-dark" />
            </Field>

            <Field label="Tipo">
              <input name="type" defaultValue={product.type} className="input-dark" />
            </Field>

            <Field label="Colección">
              <input
                name="collection"
                defaultValue={product.collection}
                className="input-dark"
              />
            </Field>

            <Field label="Precio minorista">
              <input
                name="retailPrice"
                type="number"
                defaultValue={product.retailPrice}
                className="input-dark"
              />
            </Field>

            <Field label="Precio mayorista">
              <input
                name="wholesalePrice"
                type="number"
                defaultValue={product.wholesalePrice}
                className="input-dark"
              />
            </Field>

            <Field label="Stock">
              <input
                name="stock"
                type="number"
                defaultValue={product.stock}
                className="input-dark"
              />
            </Field>

            <Field label="Estado">
              <select name="status" defaultValue={product.status} className="input-dark">
                <option value="Disponible">Disponible</option>
                <option value="Bajo pedido">Bajo pedido</option>
                <option value="Sin stock">Sin stock</option>
              </select>
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm text-neutral-300 sm:flex-row sm:gap-8">
            <label className="flex items-center gap-3">
              <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
              Producto activo
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product.isFeatured}
              />
              Producto destacado
            </label>
          </div>

          <div className="mt-6">
            <Field label="Descripción corta">
              <textarea
                name="description"
                defaultValue={product.description}
                className="input-dark min-h-[100px]"
              />
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Descripción larga">
              <textarea
                name="longDescription"
                defaultValue={product.longDescription}
                className="input-dark min-h-[160px]"
              />
            </Field>
          </div>

          <div className="mt-8 flex gap-4">
            <button type="submit" className="bg-white px-6 py-3 text-sm font-medium text-black">
              Guardar cambios
            </button>

            <Link href="/internal/products" className="border border-white/10 px-6 py-3 text-sm">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-neutral-400">{label}</span>
      {children}
    </label>
  );
}