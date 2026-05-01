import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getPurchaseOrderById } from "@/data/purchaseService";
import PurchaseOrderDetail from "./PurchaseOrderDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PurchaseOrderPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const { id } = await params;
  const order = await getPurchaseOrderById(Number(id));

  if (!order) notFound();

  return (
    <main className="space-y-8 px-1 py-8 text-white">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/internal/purchases"
            className="text-xs text-neutral-600 transition hover:text-neutral-400"
          >
            ← Volver a órdenes de compra
          </Link>
          <h1 className="mt-3 text-3xl font-light">{order.order_number}</h1>
          {order.supplier && (
            <p className="mt-1 text-sm text-neutral-500">
              {(order.supplier as any).name}
              {order.import_agent && (
                <span className="ml-3 text-neutral-600">
                  · Agente: {(order.import_agent as any).name}
                </span>
              )}
            </p>
          )}
        </div>
      </header>

      <PurchaseOrderDetail order={order} />
    </main>
  );
}
