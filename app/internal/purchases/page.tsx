import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getPurchaseOrders } from "@/data/purchaseService";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  en_transito: "En tránsito",
  recibido: "Recibido",
};

const STATUS_BADGE: Record<string, string> = {
  pendiente: "badge badge-gold",
  en_transito: "badge badge-blue",
  recibido: "badge badge-green",
};

function money(n: number | null, currency = "USD") {
  if (n == null) return "—";
  return `${currency} ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const { status: filterStatus } = await searchParams;
  const orders = await getPurchaseOrders();

  const byStatus = {
    pendiente: orders.filter((o) => o.status === "pendiente"),
    en_transito: orders.filter((o) => o.status === "en_transito"),
    recibido: orders.filter((o) => o.status === "recibido"),
  };

  const filtered =
    filterStatus && filterStatus !== "all"
      ? orders.filter((o) => o.status === filterStatus)
      : orders;

  const openOrders = orders.filter((o) => o.status !== "recibido");
  const totalOpenUSD = openOrders.reduce((a, o) => a + Number(o.goods_cost ?? 0), 0);

  return (
    <main className="space-y-10 px-1 py-8 text-white">

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Compras</p>
          <h1 className="mt-3 text-3xl font-light">Órdenes de compra</h1>
          <p className="mt-2 text-sm text-neutral-500">Seguimiento de todas tus importaciones.</p>
        </div>
        <Link
          href="/internal/purchases/new"
          className="shrink-0 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]"
        >
          + Nueva orden
        </Link>
      </header>

      {/* Métricas */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="border border-white/[0.07] bg-white/[0.02] px-5 py-4">
          <p className="text-xs text-neutral-500">Total órdenes</p>
          <p className="mt-1 text-2xl font-light">{orders.length}</p>
        </div>
        {(["pendiente", "en_transito", "recibido"] as const).map((s) => (
          <div
            key={s}
            className={`flex items-center justify-between border px-5 py-4 ${
              filterStatus === s
                ? "border-[#d6b36a]/30 bg-[#d6b36a]/[0.04]"
                : "border-white/[0.07] bg-white/[0.02]"
            }`}
          >
            <div>
              <p className="text-xs text-neutral-500">{STATUS_LABEL[s]}</p>
              <p className="mt-1 text-2xl font-light">{byStatus[s].length}</p>
            </div>
            <span className={STATUS_BADGE[s]}>{STATUS_LABEL[s]}</span>
          </div>
        ))}
      </div>

      {/* Resumen financiero */}
      {openOrders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-white/[0.07] bg-white/[0.02] px-5 py-4">
            <p className="text-xs text-neutral-500">Exposición total (órdenes abiertas)</p>
            <p className="mt-1 text-2xl font-light text-[#d6b36a]">{money(totalOpenUSD, "USD")}</p>
            <p className="mt-1 text-xs text-neutral-600">
              {openOrders.length} {openOrders.length === 1 ? "orden pendiente/en tránsito" : "órdenes pendientes/en tránsito"}
            </p>
          </div>
          <div className="border border-white/[0.07] bg-white/[0.02] px-5 py-4">
            <p className="text-xs text-neutral-500">En tránsito ahora</p>
            <p className="mt-1 text-2xl font-light">
              {money(byStatus.en_transito.reduce((a, o) => a + Number(o.goods_cost ?? 0), 0), "USD")}
            </p>
            <p className="mt-1 text-xs text-neutral-600">
              {byStatus.en_transito.length} {byStatus.en_transito.length === 1 ? "orden en camino" : "órdenes en camino"}
            </p>
          </div>
        </div>
      )}

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "Todas", count: orders.length },
          { value: "pendiente", label: "Pendiente", count: byStatus.pendiente.length },
          { value: "en_transito", label: "En tránsito", count: byStatus.en_transito.length },
          { value: "recibido", label: "Recibido", count: byStatus.recibido.length },
        ].map((tab) => {
          const isActive =
            (!filterStatus || filterStatus === "all")
              ? tab.value === "all"
              : filterStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value === "all" ? "/internal/purchases" : `/internal/purchases?status=${tab.value}`}
              className={`border px-4 py-1.5 text-xs transition ${
                isActive
                  ? "border-[#d6b36a]/40 bg-[#d6b36a]/10 text-[#d6b36a]"
                  : "border-white/[0.08] text-neutral-500 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab.label}
              <span className={`ml-2 ${isActive ? "text-[#d6b36a]/70" : "text-neutral-700"}`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Listado */}
      {filtered.length === 0 ? (
        <div className="border border-white/[0.07] bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-neutral-500">
            {filterStatus && filterStatus !== "all"
              ? `No hay órdenes con estado "${STATUS_LABEL[filterStatus] ?? filterStatus}".`
              : "No hay órdenes de compra todavía."}
          </p>
          {(!filterStatus || filterStatus === "all") && (
            <Link
              href="/internal/purchases/new"
              className="mt-4 inline-block border border-white/10 px-5 py-2 text-sm text-neutral-300 transition hover:border-white/30 hover:text-white"
            >
              Crear la primera
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/internal/purchases/${order.id}`}
              className="flex flex-col gap-3 border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{order.order_number}</p>
                  <span className={STATUS_BADGE[order.status]}>{STATUS_LABEL[order.status]}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  {order.supplier && <span>Proveedor: {(order.supplier as any).name}</span>}
                  {order.import_agent && <span>Agente: {(order.import_agent as any).name}</span>}
                  {order.order_date && <span>Pedido: {order.order_date}</span>}
                  {order.estimated_arrival && (
                    <span className={
                      order.status !== "recibido" && new Date(order.estimated_arrival) < new Date()
                        ? "text-yellow-500"
                        : ""
                    }>
                      Llegada est.: {order.estimated_arrival}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {order.goods_cost != null && (
                  <p className="text-sm font-medium text-white">{money(order.goods_cost, order.currency)}</p>
                )}
                {order.exchange_rate && (
                  <p className="text-xs text-neutral-600">TC: {order.exchange_rate} ARS</p>
                )}
                <p className="text-xs text-neutral-600">
                  {new Date(order.created_at).toLocaleDateString("es-AR")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
