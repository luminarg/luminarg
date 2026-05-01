import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getSales } from "@/data/saleService";
import { cancelSaleAction, markSaleAsPaidAction, updateSaleDeliveryStatusAction } from "./actions";

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
    pending: "Pendiente", failed: "Fallido", refunded: "Devuelto",
  };
  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "paid" || status === "delivered") return "text-green-400";
  if (status === "pending_payment" || status === "pending" || status === "preparing") return "text-yellow-300";
  if (status === "cancelled" || status === "failed" || status === "refunded") return "text-red-400";
  return "text-blue-300";
}

function nextDeliveryStatus(current: string) {
  if (current === "pending") return "preparing";
  if (current === "preparing") return "shipped";
  if (current === "shipped") return "delivered";
  return "pending";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-light">{value}</p>
    </div>
  );
}

export default async function InternalSalesPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const sales = await getSales();

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Ventas</p>
          <h1 className="mt-3 text-4xl font-light">Pedidos / ventas</h1>
          <p className="mt-3 text-neutral-400">Gestion interna de pedidos de clientes, pagos, entregas e impacto de stock.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Total pedidos" value={String(sales.length)} />
          <Metric label="Pendientes de pago" value={String(sales.filter((s) => s.payment_status === "pending").length)} />
          <Metric label="Pagadas" value={String(sales.filter((s) => s.payment_status === "paid").length)} />
          <Metric
            label="Facturacion pagada"
            value={`ARS ${money(sales.filter((s) => s.payment_status === "paid").reduce((a, s) => a + Number(s.total_amount), 0))}`}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-light">Listado</h2>

          {sales.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.03] p-8 text-neutral-400">
              Todavia no hay ventas registradas.
            </div>
          ) : (
            <div className="grid gap-4">
              {sales.map((sale) => (
                <article key={sale.id} className="border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-medium">Venta #{sale.id}</p>
                          <span className={`text-sm ${statusClass(sale.status)}`}>{statusLabel(sale.status)}</span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-500">{formatDate(sale.created_at)}</p>
                      </div>

                      <div className="grid gap-2 text-sm text-neutral-400 sm:grid-cols-2 lg:grid-cols-3">
                        <p>Cliente: <span className="text-white">{sale.customer_name}</span></p>
                        <p>Telefono: <span className="text-white">{sale.customer_phone || "-"}</span></p>
                        <p>Email: <span className="text-white">{sale.customer_email || "-"}</span></p>
                        <p>Pago: <span className={statusClass(sale.payment_status)}>{statusLabel(sale.payment_status)}</span></p>
                        <p>Entrega: <span className={statusClass(sale.delivery_status)}>{statusLabel(sale.delivery_status)}</span></p>
                        <p>Total: <span className="text-white">ARS {money(sale.total_amount)}</span></p>
                      </div>

                      <div className="text-sm text-neutral-500">
                        Entrega: {sale.shipping_street} {sale.shipping_street_number}, {sale.shipping_city}, {sale.shipping_province}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                      <Link
                        href={`/internal/sales/${sale.id}`}
                        className="border border-white/10 px-4 py-2 text-center text-sm text-neutral-300 transition hover:border-white/30 hover:text-white"
                      >
                        Ver detalle
                      </Link>

                      {sale.payment_status !== "paid" && sale.status !== "cancelled" && (
                        <form action={markSaleAsPaidAction.bind(null, sale.id)}>
                          <button type="submit" className="w-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                            Marcar pagada
                          </button>
                        </form>
                      )}

                      {sale.payment_status === "paid" && sale.status !== "cancelled" && sale.delivery_status !== "delivered" && (
                        <form action={updateSaleDeliveryStatusAction.bind(null, sale.id, nextDeliveryStatus(sale.delivery_status) as any)}>
                          <button type="submit" className="w-full border border-white/10 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/30 hover:text-white">
                            Avanzar entrega
                          </button>
                        </form>
                      )}

                      {sale.status !== "cancelled" && (
                        <form action={cancelSaleAction.bind(null, sale.id)}>
                          <button type="submit" className="w-full border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:border-red-500/50">
                            Cancelar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
