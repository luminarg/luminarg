import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getDashboardMetrics() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    expensesResult,
    productsResult,
    purchaseOrdersResult,
    purchaseCostsResult,
    purchasePaymentsResult,
    salesMonthResult,
    salesAllResult,
  ] = await Promise.all([
    supabaseAdmin.from("expenses").select("*"),
    supabaseAdmin.from("products").select("*"),
    supabaseAdmin
      .from("purchase_orders")
      .select("id, order_number, status, goods_cost, currency, order_date, estimated_arrival, supplier_id, suppliers(name)")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("purchase_order_costs")
      .select("purchase_order_id, amount, currency, is_paid"),
    supabaseAdmin
      .from("purchase_order_payments")
      .select("purchase_order_id, amount, currency, is_paid, scheduled_date"),
    supabaseAdmin
      .from("sales")
      .select("id, total, currency, status, created_at")
      .neq("status", "cancelada")
      .gte("created_at", firstOfMonth),
    supabaseAdmin
      .from("sales")
      .select("id, total, currency, status, created_at")
      .neq("status", "cancelada")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const expenses = expensesResult.data ?? [];
  const products = productsResult.data ?? [];
  const purchaseOrders = purchaseOrdersResult.data ?? [];
  const purchaseCosts = purchaseCostsResult.data ?? [];
  const purchasePayments = purchasePaymentsResult.data ?? [];
  const salesMonth = salesMonthResult.data ?? [];
  const recentSales = salesAllResult.data ?? [];

  // ─── Gastos ──────────────────────────────────────────────────────────────────

  const expensesByCurrency = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      const c = e.currency ?? "SIN MONEDA";
      acc[c] = (acc[c] ?? 0) + Number(e.amount ?? 0);
      return acc;
    },
    {}
  );

  const expensesByStatus = expenses.reduce(
    (acc, e) => {
      if (e.is_paid) {
        acc.paid += Number(e.amount ?? 0);
        acc.paidCount += 1;
      } else {
        acc.pending += Number(e.amount ?? 0);
        acc.pendingCount += 1;
      }
      return acc;
    },
    { paid: 0, pending: 0, paidCount: 0, pendingCount: 0 }
  );

  const expensesByMonth = expenses.reduce<Record<string, number>>((acc, e) => {
    const rawDate = e.date ?? e.created_at;
    if (!rawDate) return acc;
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return acc;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] ?? 0) + Number(e.amount ?? 0);
    return acc;
  }, {});

  const highPendingExpenses = expenses
    .filter((e) => !e.is_paid && Number(e.amount ?? 0) >= 100000)
    .map((e) => ({
      id: e.id,
      description: e.description ?? e.category ?? "Gasto sin detalle",
      amount: Number(e.amount ?? 0),
      currency: e.currency ?? "SIN MONEDA",
    }));

  // ─── Productos / Stock ────────────────────────────────────────────────────────

  const totalStock = products.reduce((acc, p) => acc + Number(p.stock ?? 0), 0);
  const totalEnTransito = products.reduce((acc, p) => acc + Number(p.stock_en_transito ?? 0), 0);
  const totalEnPedido = products.reduce((acc, p) => acc + Number(p.stock_en_pedido ?? 0), 0);

  const outOfStock = products
    .filter((p) => Number(p.stock ?? 0) <= 0)
    .map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: Number(p.stock ?? 0) }));

  const lowStock = products
    .filter((p) => { const s = Number(p.stock ?? 0); return s > 0 && s <= 5; })
    .map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: Number(p.stock ?? 0) }));

  // ─── Órdenes de compra ────────────────────────────────────────────────────────

  const ocPendiente = purchaseOrders.filter((o) => o.status === "pendiente");
  const ocEnTransito = purchaseOrders.filter((o) => o.status === "en_transito");
  const ocRecibido = purchaseOrders.filter((o) => o.status === "recibido");

  const recentOrders = purchaseOrders.slice(0, 5).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    status: o.status as string,
    goods_cost: Number(o.goods_cost ?? 0),
    currency: o.currency ?? "USD",
    supplier: (o.suppliers as any)?.name ?? "—",
    estimated_arrival: o.estimated_arrival ?? null,
  }));

  // Pagos de OC pendientes (no pagados, con fecha programada)
  const pagosPendientesOC = purchasePayments
    .filter((p) => !p.is_paid)
    .reduce<Record<string, number>>((acc, p) => {
      const c = p.currency ?? "USD";
      acc[c] = (acc[c] ?? 0) + Number(p.amount ?? 0);
      return acc;
    }, {});

  // ─── Ventas del mes ───────────────────────────────────────────────────────────

  const ventasMesByCurrency = salesMonth.reduce<Record<string, number>>((acc, s) => {
    const c = s.currency ?? "ARS";
    acc[c] = (acc[c] ?? 0) + Number(s.total ?? 0);
    return acc;
  }, {});

  const ventasMesCount = salesMonth.length;

  // ─── Alertas ──────────────────────────────────────────────────────────────────

  // OC en tránsito con llegada estimada en los próximos 7 días
  const hoy = new Date();
  const en7dias = new Date();
  en7dias.setDate(hoy.getDate() + 7);

  const llegadasProximas = ocEnTransito.filter((o) => {
    if (!o.estimated_arrival) return false;
    const fecha = new Date(o.estimated_arrival);
    return fecha >= hoy && fecha <= en7dias;
  }).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    estimated_arrival: o.estimated_arrival,
    supplier: (o.suppliers as any)?.name ?? "—",
  }));

  const totalAlertas =
    outOfStock.length +
    lowStock.length +
    highPendingExpenses.length +
    llegadasProximas.length;

  return {
    expenses: {
      totalCount: expenses.length,
      byCurrency: expensesByCurrency,
      byStatus: expensesByStatus,
      byMonth: expensesByMonth,
    },
    products: {
      total: products.length,
      totalStock,
      totalEnTransito,
      totalEnPedido,
      lowStock,
      outOfStock,
    },
    purchases: {
      pendienteCount: ocPendiente.length,
      enTransitoCount: ocEnTransito.length,
      recibidoCount: ocRecibido.length,
      pagosPendientes: pagosPendientesOC,
      recentOrders,
      llegadasProximas,
    },
    ventas: {
      mesCount: ventasMesCount,
      mesByCurrency: ventasMesByCurrency,
      recent: recentSales.map((s) => ({
        id: s.id,
        total: Number(s.total ?? 0),
        currency: s.currency ?? "ARS",
        status: s.status,
        created_at: s.created_at,
      })),
    },
    alerts: {
      total: totalAlertas,
      highPendingExpenses,
      llegadasProximas,
    },
  };
}
