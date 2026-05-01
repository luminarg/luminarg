import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getPriceTiers } from "@/data/priceTierService";
import { createTierAction, updateTierAction, deleteTierAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PriceTiersPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const tiers = await getPriceTiers();

  return (
    <main className="space-y-8 px-1 py-8 text-white">
      <header>
        <Link href="/internal/mayoristas" className="text-xs text-neutral-600 transition hover:text-neutral-400">
          ← Volver a mayoristas
        </Link>
        <h1 className="mt-3 text-3xl font-light">Tramos de precio</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Descuentos automáticos sobre el precio mayorista base según volumen total del pedido.
        </p>
      </header>

      {/* Tabla de tramos */}
      <section className="border border-white/[0.07] bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.07]">
              <tr className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                <th className="px-5 py-3 text-left">Nombre</th>
                <th className="px-5 py-3 text-left">Desde</th>
                <th className="px-5 py-3 text-left">Hasta</th>
                <th className="px-5 py-3 text-left">Descuento</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left">Orden</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-white/[0.04]">
                  <td className="px-5 py-4 text-white">{tier.name}</td>
                  <td className="px-5 py-4 text-neutral-400">{tier.min_quantity} ud.</td>
                  <td className="px-5 py-4 text-neutral-400">
                    {tier.max_quantity ? `${tier.max_quantity} ud.` : "Sin límite"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={tier.discount_pct > 0 ? "text-[#d6b36a] font-medium" : "text-neutral-600"}>
                      {tier.discount_pct > 0 ? `-${tier.discount_pct}%` : "Sin descuento"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={tier.is_active ? "badge badge-green" : "badge badge-neutral"}>
                      {tier.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-neutral-600">{tier.sort_order}</td>
                  <td className="px-5 py-4">
                    <form action={deleteTierAction.bind(null, tier.id)}>
                      <button type="submit" className="text-xs text-red-500 transition hover:text-red-300">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {tiers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-600">
                    No hay tramos configurados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Crear nuevo tramo */}
      <section className="border border-white/[0.07] bg-white/[0.02] p-6">
        <h2 className="mb-5 text-sm uppercase tracking-[0.2em] text-neutral-500">Agregar tramo</h2>
        <form action={createTierAction} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Nombre</label>
            <input name="name" required className="input w-full" placeholder="Volumen alto" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Desde (ud.)</label>
            <input name="min_quantity" type="number" min="1" required className="input w-full" placeholder="21" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Hasta (vacío = sin límite)</label>
            <input name="max_quantity" type="number" min="1" className="input w-full" placeholder="50" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Descuento %</label>
            <input name="discount_pct" type="number" min="0" max="100" step="0.01" required className="input w-full" placeholder="15" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Orden</label>
            <input name="sort_order" type="number" min="0" className="input w-full" placeholder="3" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
              Agregar
            </button>
          </div>
        </form>
      </section>

      {/* Explicación */}
      <div className="border border-white/[0.05] p-4 text-xs text-neutral-600">
        <p>
          Los descuentos se aplican sobre el <span className="text-neutral-400">precio mayorista base</span> de cada producto,
          según el total de unidades del pedido completo.
          Si un pedido suma 15 unidades en total, aplica el tramo correspondiente a ese rango para todos los ítems.
        </p>
      </div>
    </main>
  );
}
