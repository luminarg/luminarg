import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { getMayoristaOrders } from "@/data/mayoristaService";

export const dynamic = "force-dynamic";

function money(n: number) {
  return `ARS ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pendiente de pago",
  paid: "Pagado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  pending: "Pendiente",
};

const STATUS_BADGE: Record<string, string> = {
  pending_payment: "badge badge-gold",
  paid: "badge badge-blue",
  preparing: "badge badge-blue",
  shipped: "badge badge-blue",
  delivered: "badge badge-green",
  cancelled: "badge badge-red",
  pending: "badge badge-gold",
};

export default async function MayoristaPedidosPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "mayorista") redirect("/login");

  const orders = await getMayoristaOrders(profile.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Mi cuenta</p>
        <h1 className="mt-2 text-3xl font-light">Mis pedidos</h1>
      </header>

      {orders.length === 0 ? (
        <div className="border border-white/[0.07] bg-white/[0.02] p-10 text-center">
          <p className="text-sm text-neutral-500">Todavía no realizaste pedidos.</p>
          <Link href="/mayorista/catalogo" className="mt-4 inline-block bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="border border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white">Pedido #{order.id}</p>
                    <span className={STATUS_BADGE[order.status] ?? "badge badge-neutral"}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">
                    {new Date(order.created_at).toLocaleDateString("es-AR", { dateStyle: "medium" })}
                  </p>
                  {order.sale_items?.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-500">
                      {order.sale_items.map((i: any) => `${i.product_name} ×${i.quantity}`).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white">{money(Number(order.total_amount ?? 0))}</p>
                  {order.delivery_status && (
                    <p className="mt-0.5 text-xs text-neutral-600">
                      Entrega: {STATUS_LABEL[order.delivery_status] ?? order.delivery_status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
