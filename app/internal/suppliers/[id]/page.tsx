import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getSupplierById } from "@/data/supplierService";
import { updateSupplierAction, deleteSupplierAction } from "./actions";

export const dynamic = "force-dynamic";

const CURRENCIES = ["USD", "CNY", "EUR", "ARS"];

type Props = { params: Promise<{ id: string }> };

export default async function EditSupplierPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const { id } = await params;
  const supplier = await getSupplierById(Number(id));
  if (!supplier) notFound();

  return (
    <main className="space-y-8 px-1 py-8 text-white">
      <header className="flex items-center justify-between">
        <div>
          <Link
            href="/internal/suppliers"
            className="text-xs text-neutral-600 transition hover:text-neutral-400"
          >
            ← Volver a proveedores
          </Link>
          <h1 className="mt-2 text-2xl font-light">{supplier.name}</h1>
        </div>
      </header>

      <form
        action={updateSupplierAction.bind(null, supplier.id)}
        className="border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-5 text-base font-medium text-neutral-200">
          Editar proveedor
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre *">
            <input
              name="name"
              required
              defaultValue={supplier.name}
              className="input-dark"
            />
          </Field>

          <Field label="País">
            <input
              name="country"
              defaultValue={supplier.country ?? ""}
              className="input-dark"
            />
          </Field>

          <Field label="Moneda principal">
            <select name="currency" defaultValue={supplier.currency} className="input-dark">
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Contacto">
            <input
              name="contactName"
              defaultValue={supplier.contact_name ?? ""}
              className="input-dark"
            />
          </Field>

          <Field label="Email">
            <input
              name="contactEmail"
              type="email"
              defaultValue={supplier.contact_email ?? ""}
              className="input-dark"
            />
          </Field>

          <Field label="Teléfono / WhatsApp">
            <input
              name="contactPhone"
              defaultValue={supplier.contact_phone ?? ""}
              className="input-dark"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas internas">
            <textarea
              name="notes"
              defaultValue={supplier.notes ?? ""}
              className="input-dark"
            />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-neutral-400">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={supplier.is_active}
            className="accent-[#d6b36a]"
          />
          Proveedor activo
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]"
          >
            Guardar cambios
          </button>
          <Link
            href="/internal/suppliers"
            className="border border-white/10 px-6 py-2.5 text-sm text-neutral-400 transition hover:text-white"
          >
            Cancelar
          </Link>
        </div>
      </form>

      <div className="border border-red-900/40 bg-red-950/20 p-5">
        <p className="mb-3 text-sm font-medium text-red-300">Zona de peligro</p>
        <p className="mb-4 text-xs text-neutral-500">
          Eliminar el proveedor es permanente. Si tiene órdenes de compra asociadas, no se podrá eliminar.
        </p>
        <form action={deleteSupplierAction.bind(null, supplier.id)}>
          <button
            type="submit"
            className="border border-red-700 px-5 py-2 text-sm text-red-400 transition hover:bg-red-900/30"
          >
            Eliminar proveedor
          </button>
        </form>
      </div>
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
