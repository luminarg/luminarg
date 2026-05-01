import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getSuppliers } from "@/data/supplierService";
import { createSupplierAction, deleteSupplierAction } from "./actions";

export const dynamic = "force-dynamic";

const CURRENCIES = ["USD", "CNY", "EUR", "ARS"];

export default async function SuppliersPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const suppliers = await getSuppliers();

  return (
    <main className="space-y-10 px-1 py-8 text-white">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
          Compras
        </p>
        <h1 className="mt-3 text-3xl font-light">Proveedores</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Empresas o personas del exterior a quienes comprás mercadería.
        </p>
      </header>

      {/* ── FORMULARIO NUEVO ─────────────────────────────────────── */}
      <form
        action={createSupplierAction}
        className="border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-5 text-base font-medium text-neutral-200">
          Nuevo proveedor
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre *">
            <input name="name" required className="input-dark" placeholder="Ej: Shenzhen LED Co." />
          </Field>

          <Field label="País">
            <input name="country" className="input-dark" placeholder="Ej: China" />
          </Field>

          <Field label="Moneda principal">
            <select name="currency" defaultValue="USD" className="input-dark">
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Contacto">
            <input name="contactName" className="input-dark" placeholder="Nombre del contacto" />
          </Field>

          <Field label="Email">
            <input name="contactEmail" type="email" className="input-dark" placeholder="contacto@proveedor.com" />
          </Field>

          <Field label="Teléfono / WhatsApp">
            <input name="contactPhone" className="input-dark" placeholder="+86..." />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas internas">
            <textarea name="notes" className="input-dark" placeholder="Condiciones, tiempos de entrega, notas..." />
          </Field>
        </div>

        <button
          type="submit"
          className="mt-5 bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]"
        >
          Guardar proveedor
        </button>
      </form>

      {/* ── LISTADO ──────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-base font-medium text-neutral-300">
          {suppliers.length === 0 ? "Sin proveedores" : `${suppliers.length} proveedor${suppliers.length !== 1 ? "es" : ""}`}
        </h2>

        {suppliers.length === 0 ? (
          <div className="border border-white/[0.07] bg-white/[0.02] p-8 text-sm text-neutral-600">
            Todavía no cargaste ningún proveedor.
          </div>
        ) : (
          <div className="space-y-3">
            {suppliers.map((s) => (
              <article
                key={s.id}
                className="flex flex-col gap-4 border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{s.name}</p>
                    <span className={`badge ${s.is_active ? "badge-green" : "badge-neutral"}`}>
                      {s.is_active ? "Activo" : "Inactivo"}
                    </span>
                    <span className="badge badge-gold">{s.currency}</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {[s.country, s.contact_name, s.contact_email, s.contact_phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {s.notes && (
                    <p className="text-xs text-neutral-600">{s.notes}</p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/internal/suppliers/${s.id}`}
                    className="border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white/30 hover:text-white"
                  >
                    Editar
                  </Link>
                  <form action={deleteSupplierAction.bind(null, s.id)}>
                    <button
                      type="submit"
                      className="border border-red-800/60 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-600"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
