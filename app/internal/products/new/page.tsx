import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { InternalHeader } from "@/app/components/internal/InternalHeader";
import { createProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-10">
        <InternalHeader
          title="Nuevo producto"
          description="Crear un nuevo producto en el catálogo"
        />

        <form
          action={createProductAction}
          className="border border-white/10 bg-white/[0.03] p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Input name="name" label="Nombre" required />
            <Input name="sku" label="SKU" required />
            <Input name="type" label="Tipo" />
            <Input name="collection" label="Colección" />
            <Input name="retailPrice" label="Precio minorista" type="number" />
            <Input name="wholesalePrice" label="Precio mayorista" type="number" />
            <Input name="stock" label="Stock" type="number" />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Estado
            </label>
            <select name="status" className="input-dark">
              <option value="Disponible">Disponible</option>
              <option value="Bajo pedido">Bajo pedido</option>
              <option value="Sin stock">Sin stock</option>
            </select>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm text-neutral-300 sm:flex-row sm:gap-8">
            <label className="flex items-center gap-3">
              <input type="checkbox" name="isActive" defaultChecked />
              Producto activo
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" name="isFeatured" />
              Producto destacado
            </label>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Imagen del producto
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="input-dark"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Descripción corta
            </label>
            <textarea name="description" className="input-dark min-h-[100px]" />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-neutral-400">
              Descripción larga
            </label>
            <textarea
              name="longDescription"
              className="input-dark min-h-[160px]"
            />
          </div>

          <button
            type="submit"
            className="mt-8 bg-white px-6 py-3 text-sm font-medium text-black"
          >
            Crear producto
          </button>
        </form>
      </div>
    </main>
  );
}

function Input({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-neutral-400">{label}</span>
      <input name={name} type={type} required={required} className="input-dark" />
    </label>
  );
}