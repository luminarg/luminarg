import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/data/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function GraciasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: sale } = await supabase
    .from("sales")
    .select("*")
    .eq("id", Number(id))
    .eq("customer_id", user.id)
    .single();

  if (!sale) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-20 text-white">
      <section className="mx-auto max-w-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
          Pedido recibido
        </p>

        <h1 className="mt-4 text-4xl font-light">
          Gracias por tu compra
        </h1>

        <p className="mt-4 text-neutral-400">
          Tu pedido #{sale.id} fue creado correctamente.
        </p>

        <div className="mt-8 space-y-2 text-sm text-neutral-400">
          <p>
            Estado de pago:{" "}
            <span className="text-yellow-300">
              {sale.payment_status === "pending" ? "Pendiente" : sale.payment_status}
            </span>
          </p>

          <p>
            Estado de entrega:{" "}
            <span className="text-yellow-300">
              {sale.delivery_status === "pending" ? "Pendiente" : sale.delivery_status}
            </span>
          </p>

          <p>
            Total:{" "}
            <span className="text-white">
              ARS{" "}
              {Number(sale.total_amount).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-6 py-3 text-sm text-neutral-300 hover:border-white/30"
          >
            Volver al inicio
          </Link>

          <Link
            href="/products"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
          >
            Seguir comprando
          </Link>
        </div>
      </section>
    </main>
  );
}