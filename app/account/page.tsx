import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/data/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

function money(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: "Pendiente de pago",
    paid: "Pagado",
    preparing: "Preparando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    pending: "Pendiente",
    failed: "Fallido",
    refunded: "Devuelto",
  };
  return labels[status] ?? status;
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const { data: sales } = await supabase
    .from("sales")
    .select(`*, sale_items (*), sale_payments (*)`)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <header>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Mi cuenta</p>
            <h1 className="mt-3 text-4xl font-light">Mis compras</h1>
            <p className="mt-3 text-neutral-400">Seguimiento de pedidos, pagos y envios.</p>
          </header>

          {!sales || sales.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.03] p-8">
              <p className="text-neutral-400">Todavia no tenes compras.</p>
              <Link href="/products" className="mt-6 inline-block bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                Ver catalogo
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {sales.map((sale: any) => (
                <article key={sale.id} className="border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-light">Pedido #{sale.id}</p>
                      <p className="mt-2 text-sm text-neutral-500">
                        {new Date(sale.created_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                      <div className="mt-5 grid gap-2 text-sm text-neutral-400 sm:grid-cols-2">
                        <p>Pago: <span className="text-white">{statusLabel(sale.payment_status)}</span></p>
                        <p>Entrega: <span className="text-white">{statusLabel(sale.delivery_status)}</span></p>
                        <p>Total: <span className="text-white">ARS {money(Number(sale.total_amount || 0))}</span></p>
                        <p>Transporte: <span className="text-white">{sale.shipping_carrier || "Pendiente"}</span></p>
                        <p>Seguimiento: <span className="text-white">{sale.shipping_tracking_id || "Pendiente"}</span></p>
                      </div>
                      {sale.shipping_tracking_url && (
                        <a href={sale.shipping_tracking_url} target="_blank" className="mt-4 inline-block text-sm text-[#d6b36a]">
                          Ver seguimiento
                        </a>
                      )}
                      {sale.shipping_notes && (
                        <p className="mt-4 text-sm text-neutral-500">Envio: {sale.shipping_notes}</p>
                      )}
                    </div>
                    <div className="min-w-[220px] border border-white/10 bg-black/20 p-4">
                      <p className="mb-3 text-sm uppercase tracking-[0.18em] text-neutral-500">Productos</p>
                      <div className="space-y-2">
                        {(sale.sale_items ?? []).map((item: any) => (
                          <p key={item.id} className="text-sm text-neutral-300">{item.product_name} x{item.quantity}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
