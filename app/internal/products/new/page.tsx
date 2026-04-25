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
      <div className="mx-auto max-w-3xl space-y-10">
        <InternalHeader
          title="Nuevo producto"
          description="Crear un nuevo producto en el catálogo"
        />

        <form action={createProductAction} className="space-y-6">
          <input
            name="name"
            placeholder="Nombre"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <input
            name="sku"
            placeholder="SKU"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <input
            name="type"
            placeholder="Tipo"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <input
            name="collection"
            placeholder="Colección"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <input
            name="retailPrice"
            type="number"
            placeholder="Precio minorista"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <input
            name="wholesalePrice"
            type="number"
            placeholder="Precio mayorista"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <textarea
            name="description"
            placeholder="Descripción"
            className="w-full border border-white/10 bg-black/30 p-3 text-white"
          />

          <button
            type="submit"
            className="w-full bg-white px-4 py-3 text-black"
          >
            Crear producto
          </button>
        </form>
      </div>
    </main>
  );
}