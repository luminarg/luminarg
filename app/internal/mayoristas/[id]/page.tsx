import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getMayoristaById, getMayoristaOrders } from "@/data/mayoristaService";
import { getCCTransactions } from "@/data/ccService";
import {
  approveMayoristaAction,
  updateMayoristaAction,
  registerPagoAction,
  registerAjusteAction,
} from "../actions";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `ARS ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { dateStyle: "short" });
}

export default async function MayoristaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const { id } = await params;
  const [mayorista, transactions, orders] = await Promise.all([
    getMayoristaById(id),
    getCCTransactions(id),
    getMayoristaOrders(id),
  ]);

  if (!mayorista) notFound();

  const isCC = mayorista.payment_type === "cuenta_corriente";

  return (
    <main className="space-y-8 px-1 py-8 text-white">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/internal/mayoristas" className="text-xs text-neutral-600 transition hover:text-neutral-400">
            ← Volver a mayoristas
          </Link>
          <h1 className="mt-3 text-3xl font-light">{mayorista.company_name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{mayorista.email}</p>
        </div>
        <div className="flex gap-2">
          <span className={mayorista.is_approved ? "badge badge-green" : "badge badge-gold"}>
            {mayorista.is_approved ? "Aprobado" : "Pendiente"}
          </span>
          <span className={isCC ? "badge badge-blue" : "badge badge-neutral"}>
            {isCC ? "Cta. corriente" : "Contado"}
          </span>
        </div>
      </header>

      {/* Aprobar si está pendiente */}
      {!mayorista.is_approved && (
        <div className="border border-[#d6b36a]/20 bg-[#d6b36a]/[0.04] p-5">
          <p className="text-sm text-[#d6b36a]">Este mayorista está pendiente de aprobación.</p>
          <form action={approveMayoristaAction.bind(null, id)} className="mt-3">
            <button type="submit" className="bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
              Aprobar y activar
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Datos de la empresa */}
        <section className="border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="mb-5 text-sm uppercase tracking-[0.2em] text-neutral-500">Datos de la empresa</h2>
          <form action={updateMayoristaAction.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Razón social *</label>
              <input name="company_name" defaultValue={mayorista.company_name} required className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">CUIT</label>
              <input name="cuit" defaultValue={mayorista.cuit ?? ""} className="input w-full" placeholder="20-12345678-9" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Contacto</label>
              <input name="contact_name" defaultValue={mayorista.contact_name ?? ""} className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Teléfono</label>
              <input name="phone" defaultValue={mayorista.phone ?? ""} className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Dirección</label>
              <input name="address" defaultValue={mayorista.address ?? ""} className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Ciudad</label>
              <input name="city" defaultValue={mayorista.city ?? ""} className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Provincia</label>
              <input name="province" defaultValue={mayorista.province ?? ""} className="input w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Condición de pago</label>
              <select name="payment_type" defaultValue={mayorista.payment_type} className="input w-full">
                <option value="contado">Contado</option>
                <option value="cuenta_corriente">Cuenta corriente</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Límite de crédito (ARS)</label>
              <input name="credit_limit" type="number" min="0" defaultValue={mayorista.credit_limit} className="input w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-neutral-500">Notas internas</label>
              <textarea name="notes" defaultValue={mayorista.notes ?? ""} rows={2} className="input w-full resize-none" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                Guardar cambios
              </button>
            </div>
          </form>
        </section>

        {/* Cuenta corriente */}
        {isCC && (
          <section className="space-y-4">
            {/* Saldo */}
            <div className={`border p-5 ${mayorista.current_balance > 0 ? "border-[#d6b36a]/30 bg-[#d6b36a]/[0.04]" : "border-green-800/30 bg-green-900/[0.05]"}`}>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Saldo cuenta corriente</p>
              <p className={`mt-2 text-3xl font-light ${mayorista.current_balance > 0 ? "text-[#d6b36a]" : "text-green-400"}`}>
                {money(Math.abs(mayorista.current_balance))}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {mayorista.current_balance > 0
                  ? "Saldo deudor — el cliente debe este importe"
                  : mayorista.current_balance < 0
                    ? "Saldo a favor del cliente"
                    : "Sin deuda"}
              </p>
              {mayorista.credit_limit > 0 && (
                <p className="mt-2 text-xs text-neutral-600">
                  Límite de crédito: {money(mayorista.credit_limit)}
                </p>
              )}
            </div>

            {/* Registrar pago */}
            <div className="border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-500">Registrar pago</h3>
              <form action={registerPagoAction.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Importe (ARS)</label>
                  <input name="amount" type="number" min="0.01" step="0.01" required className="input w-full" placeholder="50000" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Descripción</label>
                  <input name="description" className="input w-full" placeholder="Transferencia bancaria" defaultValue="Pago recibido" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                    Registrar pago
                  </button>
                </div>
              </form>
            </div>

            {/* Ajuste manual */}
            <div className="border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-500">Ajuste manual</h3>
              <form action={registerAjusteAction.bind(null, id)} className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Tipo</label>
                  <select name="direction" className="input w-full">
                    <option value="debito">Cargo (suma deuda)</option>
                    <option value="credito">Crédito (resta deuda)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Importe (ARS)</label>
                  <input name="amount" type="number" min="0.01" step="0.01" required className="input w-full" placeholder="10000" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Motivo</label>
                  <input name="description" required className="input w-full" placeholder="Nota de crédito" />
                </div>
                <div className="sm:col-span-3">
                  <button type="submit" className="border border-white/10 px-5 py-2.5 text-sm text-neutral-400 transition hover:border-white/30 hover:text-white">
                    Aplicar ajuste
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>

      {/* Historial cuenta corriente */}
      {isCC && transactions.length > 0 && (
        <section className="border border-white/[0.07] bg-white/[0.02]">
          <div className="border-b border-white/[0.07] px-5 py-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Movimientos de cuenta corriente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.07] text-xs text-neutral-500">
                <tr>
                  <th className="px-5 py-3 text-left">Fecha</th>
                  <th className="px-5 py-3 text-left">Tipo</th>
                  <th className="px-5 py-3 text-left">Descripción</th>
                  <th className="px-5 py-3 text-right">Importe</th>
                  <th className="px-5 py-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/[0.04]">
                    <td className="px-5 py-3 text-neutral-500">{formatDate(tx.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={
                        tx.type === "pago" ? "badge badge-green" :
                        tx.type === "cargo" ? "badge badge-gold" : "badge badge-neutral"
                      }>
                        {tx.type === "cargo" ? "Cargo" : tx.type === "pago" ? "Pago" : "Ajuste"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-400">{tx.description ?? "—"}</td>
                    <td className={`px-5 py-3 text-right font-medium ${tx.type === "pago" ? "text-green-400" : "text-[#d6b36a]"}`}>
                      {tx.type === "pago" ? "-" : "+"}{money(tx.amount)}
                    </td>
                    <td className="px-5 py-3 text-right text-white">
                      {tx.balance_after != null ? money(tx.balance_after) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pedidos */}
      {orders.length > 0 && (
        <section className="border border-white/[0.07] bg-white/[0.02]">
          <div className="border-b border-white/[0.07] px-5 py-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Historial de pedidos ({orders.length})</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {orders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-white">Pedido #{order.id}</p>
                  <p className="text-xs text-neutral-600">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white">{money(Number(order.total_amount ?? 0))}</span>
                  <Link
                    href={`/internal/sales/${order.id}`}
                    className="text-xs text-neutral-600 transition hover:text-white"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
