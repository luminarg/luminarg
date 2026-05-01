import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getDashboardMetrics } from "@/data/dashboard";
import { ExpensesByMonthChart } from "./components/ExpensesByMonthChart";

export const dynamic = "force-dynamic";

function money(n: number, currency = "USD") {
  return `${currency} ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  en_transito: "En tránsito",
  recibido: "Recibido",
  confirmada: "Confirmada",
  entregada: "Entregada",
  cancelada: "Cancelada",
};

const STATUS_BADGE: Record<string, string> = {
  pendiente: "badge badge-gold",
  en_transito: "badge badge-blue",
  recibido: "badge badge-green",
  confirmada: "badge badge-blue",
  entregada: "badge badge-green",
  cancelada: "badge badge-red",
};

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const m = await getDashboardMetrics();

  const expensesChartData = Object.entries(m.expenses.byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  return (
    <div className="space-y-8 py-8 text-white">

      {/* Header */}
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Panel de control</p>
        <h1 className="mt-3 text-3xl font-light">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Resumen general del negocio.
        </p>
      </header>

      {/* ─── KPIs principales ─────────────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {/* Ventas del mes */}
        <div className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs text-neutral-500">Ventas del mes</p>
          {Object.keys(m.ventas.mesByCurrency).length === 0 ? (
            <p className="mt-2 text-2xl font-light text-neutral-600">—</p>
          ) : (
            <div className="mt-2 space-y-0.5">
              {Object.entries(m.ventas.mesByCurrency).map(([c, v]) => (
                <p key={c} className="text-2xl font-light text-white">{money(v, c)}</p>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-neutral-600">{m.ventas.mesCount} órdenes</p>
        </div>

        {/* Stock disponible */}
        <div className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs text-neutral-500">Stock disponible</p>
          <p className="mt-2 text-2xl font-light text-white">{m.products.totalStock.toLocaleString("es-AR")} ud.</p>
          <div className="mt-2 flex gap-3 text-xs text-neutral-600">
            <span>{m.products.totalEnTransito} en tránsito</span>
            <span>{m.products.totalEnPedido} en pedido</span>
          </div>
        </div>

        {/* Órdenes activas */}
        <div className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs text-neutral-500">Órdenes de compra</p>
          <p className="mt-2 text-2xl font-light text-white">
            {m.purchases.pendienteCount + m.purchases.enTransitoCount}
          </p>
          <div className="mt-2 flex gap-3 text-xs text-neutral-600">
            <span>{m.purchases.pendienteCount} pendientes</span>
            <span>{m.purchases.enTransitoCount} en tránsito</span>
          </div>
        </div>

        {/* Alertas */}
        <div className={`border p-5 ${m.alerts.total > 0 ? "border-red-800/50 bg-red-900/10" : "border-white/[0.07] bg-white/[0.02]"}`}>
          <p className="text-xs text-neutral-500">Alertas</p>
          <p className={`mt-2 text-2xl font-light ${m.alerts.total > 0 ? "text-red-400" : "text-white"}`}>
            {m.alerts.total}
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            {m.alerts.total === 0 ? "Todo en orden" : "Requieren atención"}
          </p>
        </div>
      </section>

      {/* ─── Estado de compras + Pagos pendientes ─────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="border border-[#d6b36a]/20 bg-[#d6b36a]/[0.03] p-5">
          <p className="text-xs text-neutral-500">Pendiente</p>
          <p className="mt-2 text-3xl font-light text-[#d6b36a]">{m.purchases.pendienteCount}</p>
          <p className="mt-1 text-xs text-neutral-600">órdenes sin enviar</p>
        </div>
        <div className="border border-blue-800/30 bg-blue-900/[0.05] p-5">
          <p className="text-xs text-neutral-500">En tránsito</p>
          <p className="mt-2 text-3xl font-light text-blue-400">{m.purchases.enTransitoCount}</p>
          <p className="mt-1 text-xs text-neutral-600">importaciones viajando</p>
        </div>
        <div className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs text-neutral-500">Pagos OC pendientes</p>
          {Object.keys(m.purchases.pagosPendientes).length === 0 ? (
            <p className="mt-2 text-2xl font-light text-neutral-600">—</p>
          ) : (
            <div className="mt-2 space-y-0.5">
              {Object.entries(m.purchases.pagosPendientes).map(([c, v]) => (
                <p key={c} className="text-xl font-light text-white">{money(v, c)}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Alertas inteligentes ─────────────────────────────────────────── */}
      {m.alerts.total > 0 && (
        <section className="border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Alertas</h2>
          <div className="mt-4 space-y-2">

            {m.products.outOfStock.map((p) => (
              <div key={`out-${p.id}`} className="flex items-center justify-between border border-red-800/40 bg-red-900/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-red-400">Sin stock</p>
                  <p className="text-xs text-neutral-400">{p.name} {p.sku && <span className="text-neutral-600">· {p.sku}</span>}</p>
                </div>
                <Link href={`/internal/products/${p.id}`} className="text-xs text-neutral-600 transition hover:text-white">
                  Ver →
                </Link>
              </div>
            ))}

            {m.products.lowStock.map((p) => (
              <div key={`low-${p.id}`} className="flex items-center justify-between border border-yellow-800/40 bg-yellow-900/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-yellow-400">Stock bajo ({p.stock} ud.)</p>
                  <p className="text-xs text-neutral-400">{p.name} {p.sku && <span className="text-neutral-600">· {p.sku}</span>}</p>
                </div>
                <Link href={`/internal/products/${p.id}`} className="text-xs text-neutral-600 transition hover:text-white">
                  Ver →
                </Link>
              </div>
            ))}

            {m.purchases.llegadasProximas.map((o) => (
              <div key={`arr-${o.id}`} className="flex items-center justify-between border border-blue-800/40 bg-blue-900/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-blue-400">Llegada próxima — {o.order_number}</p>
                  <p className="text-xs text-neutral-400">{o.supplier} · Est. {o.estimated_arrival}</p>
                </div>
                <Link href={`/internal/purchases/${o.id}`} className="text-xs text-neutral-600 transition hover:text-white">
                  Ver →
                </Link>
              </div>
            ))}

            {m.alerts.highPendingExpenses.map((e) => (
              <div key={`exp-${e.id}`} className="flex items-center justify-between border border-orange-800/40 bg-orange-900/10 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-orange-400">Gasto pendiente alto</p>
                  <p className="text-xs text-neutral-400">{e.description} · {money(e.amount, e.currency)}</p>
                </div>
              </div>
            ))}

          </div>
        </section>
      )}

      {/* ─── Actividad reciente ───────────────────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-2">

        {/* Últimas órdenes de compra */}
        <div className="border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Últimas OC</h2>
            <Link href="/internal/purchases" className="text-xs text-neutral-600 transition hover:text-white">
              Ver todas →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {m.purchases.recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-600">No hay órdenes de compra.</p>
            ) : (
              m.purchases.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/internal/purchases/${o.id}`}
                  className="flex items-center justify-between border border-white/[0.05] px-4 py-3 transition hover:border-white/10 hover:bg-white/[0.02]"
                >
                  <div>
                    <p className="text-sm text-white">{o.order_number}</p>
                    <p className="text-xs text-neutral-600">{o.supplier}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {o.goods_cost > 0 && (
                      <p className="text-xs text-neutral-400">{money(o.goods_cost, o.currency)}</p>
                    )}
                    <span className={STATUS_BADGE[o.status] ?? "badge badge-neutral"}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Últimas ventas */}
        <div className="border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Últimas ventas</h2>
            <Link href="/internal/sales" className="text-xs text-neutral-600 transition hover:text-white">
              Ver todas →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {m.ventas.recent.length === 0 ? (
              <p className="text-sm text-neutral-600">No hay ventas registradas.</p>
            ) : (
              m.ventas.recent.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border border-white/[0.05] px-4 py-3"
                >
                  <p className="text-xs text-neutral-500">
                    {new Date(s.created_at).toLocaleDateString("es-AR")}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-white">{money(s.total, s.currency)}</p>
                    <span className={STATUS_BADGE[s.status] ?? "badge badge-neutral"}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── Stock por capas ──────────────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs text-neutral-500">Stock físico</p>
          <p className="mt-2 text-3xl font-light text-white">{m.products.totalStock.toLocaleString("es-AR")}</p>
          <p className="mt-1 text-xs text-neutral-600">unidades en depósito</p>
        </div>
        <div className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs text-neutral-500">En tránsito</p>
          <p className="mt-2 text-3xl font-light text-blue-400">{m.products.totalEnTransito.toLocaleString("es-AR")}</p>
          <p className="mt-1 text-xs text-neutral-600">unidades viajando</p>
        </div>
        <div className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-xs text-neutral-500">En pedido</p>
          <p className="mt-2 text-3xl font-light text-[#d6b36a]">{m.products.totalEnPedido.toLocaleString("es-AR")}</p>
          <p className="mt-1 text-xs text-neutral-600">unidades solicitadas al proveedor</p>
        </div>
      </section>

      {/* ─── Gastos por mes ───────────────────────────────────────────────── */}
      <section className="border border-white/[0.07] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.2em] text-neutral-500">Gastos por mes</h2>
          <div className="flex gap-4 text-xs">
            <span className="text-green-400">
              Pagados: {m.expenses.byStatus.paidCount}
            </span>
            <span className="text-red-400">
              Pendientes: {m.expenses.byStatus.pendingCount}
            </span>
          </div>
        </div>
        <div className="mt-4 min-h-[280px]">
          <ExpensesByMonthChart data={expensesChartData} />
        </div>
      </section>

    </div>
  );
}
