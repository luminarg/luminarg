import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getSaleById } from "@/data/saleService";
import { cancelSaleAction, markSaleAsPaidAction, markSaleAsShippedAction, updateTrackingAction } from "../actions";

export const dynamic = "force-dynamic";

function money(value: number) {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Pendiente de pago", paid: "Pagada", preparing: "Preparando",
    shipped: "Enviada", delivered: "Entregada", cancelled: "Cancelada",
    pending: "Pendiente", approved: "Aprobado", failed: "Fallido", refunded: "Devuelto",
  };
  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "paid" || status === "delivered" || status === "approved") return "text-green-400";
  if (status === "pending_payment" || status === "pending" || status === "preparing") return "text-yellow-300";
  if (status === "cancelled" || status === "failed" || status === "refunded") return "text-red-400";
  return "text-blue-300";
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-4 text-xl font-light">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

export default async function InternalSaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const { id } = await params;
  const sale = await getSaleById(Number(id));
  if (!sale) notFound();

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Venta #{sale.id}</p>
            <h1 className="mt-3 text-4xl font-light">Detalle del pedido</h1>
            <p className="mt-3 text-neutral-400">Creada el {formatDate(sale.created_at)}</p>
          </div>
          <Link href="/internal/sales" className="border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:border-white/30">
            ← Volver a ventas
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card title="Estado venta"><p className={statusClass(sale.status)}>{statusLabel(sale.status)}</p></Card>
          <Card title="Estado pago"><p className={statusClass(sale.payment_status)}>{statusLabel(sale.payment_status)}</p></Card>
          <Card title="Estado entrega"><p className={statusClass(sale.delivery_status)}>{statusLabel(sale.delivery_status)}</p></Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Cliente">
            <div className="space-y-2 text-sm text-neutral-400">
              <p>Nombre: <span className="text-white">{sale.customer_name}</span></p>
              <p>Email: <span className="text-white">{sale.customer_email || "-"}</span></p>
              <p>Telefono: <span className="text-white">{sale.customer_phone || "-"}</span></p>
            </div>
          </Card>
          <Card title="Entrega">
            <div className="space-y-2 text-sm text-neutral-400">
              <p>Recibe: <span className="text-white">{sale.shipping_recipient_name}</span></p>
              <p>Telefono: <span className="text-white">{sale.shipping_recipient_phone || "-"}</span></p>
              <p>
                Direccion: <span className="text-white">
                  {sale.shipping_street} {sale.shipping_street_number}
                  {sale.shipping_floor_apartment ? `, ${sale.shipping_floor_apartment}` : ""}
                </span>
              </p>
              <p>Localidad: <span className="text-white">{sale.shipping_city}, {sale.shipping_province}</span></p>
              <p>CP: <span className="text-white">{sale.shipping_postal_code || "-"}</span></p>
              <p>Referencia: <span className="text-white">{sale.shipping_reference || "-"}</span></p>
            </div>
          </Card>
        </section>

        {/* Seguimiento */}
        {sale.status !== "cancelled" && (
          <section className="border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Seguimiento del envio</h2>
              {sale.shipping_tracking_id && <span className="badge badge-blue">Nro: {sale.shipping_tracking_id}</span>}
            </div>

            {(sale.shipping_carrier || sale.shipping_tracking_id || sale.shipping_tracking_url) && (
              <div className="mb-5 grid gap-2 border border-white/[0.05] bg-white/[0.02] p-4 text-sm sm:grid-cols-2">
                {sale.shipping_carrier && (
                  <p className="text-neutral-400">Transporte: <span className="text-white">{sale.shipping_carrier}</span></p>
                )}
                {sale.shipping_tracking_id && (
                  <p className="text-neutral-400">Numero de seguimiento: <span className="text-white font-medium">{sale.shipping_tracking_id}</span></p>
                )}
                {sale.shipping_tracking_url && (
                  <p className="text-neutral-400 sm:col-span-2">
                    Link: <a href={sale.shipping_tracking_url} target="_blank" rel="noreferrer" className="text-[#d6b36a] underline underline-offset-2 transition hover:text-white">Ver seguimiento</a>
                  </p>
                )}
                {sale.shipping_notes && (
                  <p className="text-neutral-400 sm:col-span-2">Notas: <span className="text-white">{sale.shipping_notes}</span></p>
                )}
              </div>
            )}

            <form action={updateTrackingAction.bind(null, sale.id)} className="grid gap-3 sm:grid-cols-2">
              <Field label="Transporte">
                <input name="carrier" defaultValue={sale.shipping_carrier ?? ""} placeholder="Ej: Andreani, OCA" className="input w-full" />
              </Field>
              <Field label="Numero de seguimiento">
                <input name="trackingId" defaultValue={sale.shipping_tracking_id ?? ""} placeholder="Ej: 123456789" className="input w-full" />
              </Field>
              <Field label="Link de seguimiento">
                <input name="trackingUrl" defaultValue={sale.shipping_tracking_url ?? ""} placeholder="https://..." className="input w-full" />
              </Field>
              <Field label="Notas de envio">
                <input name="shippingNotes" defaultValue={sale.shipping_notes ?? ""} placeholder="Observaciones" className="input w-full" />
              </Field>
              <div className="sm:col-span-2">
                <button type="submit" className="bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                  Guardar seguimiento
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-5 text-xl font-light">Productos</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 text-neutral-500">
                <tr>
                  <th className="py-3">Producto</th>
                  <th className="py-3">SKU</th>
                  <th className="py-3 text-right">Precio</th>
                  <th className="py-3 text-right">Cantidad</th>
                  <th className="py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-4 text-white">{item.product_name}</td>
                    <td className="py-4 text-neutral-400">{item.product_sku || "-"}</td>
                    <td className="py-4 text-right text-neutral-300">ARS {money(item.unit_price)}</td>
                    <td className="py-4 text-right text-neutral-300">{item.quantity}</td>
                    <td className="py-4 text-right text-white">ARS {money(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Pago">
            {sale.payments.length === 0 ? (
              <p className="text-sm text-neutral-500">No hay pago registrado.</p>
            ) : (
              <div className="space-y-3">
                {sale.payments.map((payment) => (
                  <div key={payment.id} className="border border-white/10 bg-black/20 p-4 text-sm">
                    <p>Metodo: <span className="text-white">{payment.method}</span></p>
                    <p>Estado: <span className={statusClass(payment.status)}>{statusLabel(payment.status)}</span></p>
                    <p>Importe: <span className="text-white">ARS {money(payment.amount)}</span></p>
                    <p>Proveedor: <span className="text-white">{payment.provider || "-"}</span></p>
                    <p>Referencia: <span className="text-white">{payment.external_reference || "-"}</span></p>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title="Totales">
            <div className="space-y-2 text-sm text-neutral-400">
              <p className="flex justify-between"><span>Subtotal</span><span className="text-white">ARS {money(sale.subtotal)}</span></p>
              <p className="flex justify-between"><span>Descuento</span><span className="text-white">ARS {money(sale.discount_amount)}</span></p>
              <p className="flex justify-between"><span>Envio</span><span className="text-white">ARS {money(sale.shipping_amount)}</span></p>
              <p className="flex justify-between border-t border-white/10 pt-3 text-base">
                <span>Total</span><span className="text-white">ARS {money(sale.total_amount)}</span>
              </p>
            </div>
          </Card>
        </section>

        {sale.notes && <Card title="Notas"><p className="text-sm text-neutral-400">{sale.notes}</p></Card>}

        {sale.payment_status === "paid" && sale.status !== "cancelled" &&
          sale.delivery_status !== "shipped" && sale.delivery_status !== "delivered" && (
          <div className="border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="mb-3 text-sm text-neutral-500">Cuando cargues el numero de seguimiento arriba, podes avanzar el estado:</p>
            <form action={markSaleAsShippedAction.bind(null, sale.id)}>
              <button type="submit" className="bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                Marcar como enviada
              </button>
            </form>
          </div>
        )}

        <section className="flex flex-wrap gap-3">
          {sale.payment_status !== "paid" && sale.status !== "cancelled" && (
            <form action={markSaleAsPaidAction.bind(null, sale.id)}>
              <button type="submit" className="bg-white px-5 py-3 text-sm font-medium text-black">
                Marcar pagada
              </button>
            </form>
          )}
          {sale.status !== "cancelled" && (
            <form action={cancelSaleAction.bind(null, sale.id)}>
              <button type="submit" className="border border-red-500/30 px-5 py-3 text-sm text-red-300 hover:border-red-500/60">
                Cancelar venta
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
