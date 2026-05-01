import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/data/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

function money(value: number) {
  return `ARS ${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export default async function GraciasPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: sale } = await supabase
    .from("sales")
    .select("*, sale_items(*)")
    .eq("id", Number(id))
    .eq("customer_id", user.id)
    .single();

  if (!sale) redirect("/");

  const items: any[] = sale.sale_items ?? [];

  return (
    <main className="min-h-screen px-4 py-20 text-white">
      <div className="mx-auto max-w-2xl space-y-6">

        <div className="border border-white/[0.07] bg-white/[0.02] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-[#d6b36a]/30 bg-[#d6b36a]/10 text-[#d6b36a]">
            v
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Pedido recibido</p>
          <h1 className="mt-3 text-3xl font-light">Gracias por tu compra!</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Tu pedido <span className="text-white">#{sale.id}</span> fue registrado correctamente.
          </p>
          <p className="mt-1 text-xs text-neutral-600">Nos pondremos en contacto para coordinar el pago y la entrega.</p>
        </div>

        {items.length > 0 && (
          <div className="border border-white/[0.07] bg-white/[0.02] p-6">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500">Detalle</p>
            <div className="space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between border-b border-white/[0.05] pb-2 text-sm">
                  <span className="text-neutral-300">
                    {item.product_name} <span className="text-neutral-600">x{item.quantity}</span>
                  </span>
                  <span className="text-white">{money(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-white/[0.07] pt-3">
              <span className="text-sm text-neutral-400">Total</span>
              <span className="text-lg font-light text-white">{money(sale.total_amount)}</span>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-xs text-neutral-500">Estado del pago</p>
            <p className="mt-1 text-sm font-light text-[#d6b36a]">
              {sale.payment_status === "pending" ? "Pendiente de coordinacion" : sale.payment_status}
            </p>
          </div>
          <div className="border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-xs text-neutral-500">Estado de entrega</p>
            <p className="mt-1 text-sm font-light text-[#d6b36a]">
              {sale.delivery_status === "pending" ? "Pendiente" : sale.delivery_status}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/products" className="flex-1 bg-white px-5 py-3 text-center text-sm font-medium text-black transition hover:bg-[#d6b36a]">
            Seguir comprando
          </Link>
          <Link href="/" className="flex-1 border border-white/10 px-5 py-3 text-center text-sm text-neutral-400 transition hover:border-white/30 hover:text-white">
            Volver al inicio
          </Link>
        </div>

      </div>
    </main>
  );
}
