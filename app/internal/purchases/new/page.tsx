import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import { getNextOrderNumber } from "@/data/purchaseService";
import { getSuppliers } from "@/data/supplierService";
import { getImportAgents } from "@/data/importAgentService";
import { getAllProducts } from "@/data/productService";
import NewPurchaseOrderForm from "./NewPurchaseOrderForm";

export const dynamic = "force-dynamic";

export default async function NewPurchaseOrderPage() {
  const profile = await getCurrentProfile();
  if (!profile || !isInternalUser(profile.role)) redirect("/login");

  const [orderNumber, suppliers, agents, allProducts] = await Promise.all([
    getNextOrderNumber(),
    getSuppliers(true),
    getImportAgents(true),
    getAllProducts(),
  ]);

  // Solo pasamos los campos que necesita el formulario
  const products = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    stock_en_transito: (p as any).stock_en_transito ?? 0,
    stock_en_pedido: (p as any).stock_en_pedido ?? 0,
  }));

  return (
    <main className="space-y-6 px-1 py-8 text-white">
      <header>
        <Link
          href="/internal/purchases"
          className="text-xs text-neutral-600 transition hover:text-neutral-400"
        >
          ← Volver a órdenes de compra
        </Link>
        <h1 className="mt-3 text-3xl font-light">Nueva orden de compra</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Registrá una importación nueva. Podés usar la IA para sugerir qué pedir según tu stock actual.
        </p>
      </header>

      <NewPurchaseOrderForm
        orderNumber={orderNumber}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name, currency: s.currency }))}
        agents={agents.map((a) => ({ id: a.id, name: a.name }))}
        products={products}
      />
    </main>
  );
}
