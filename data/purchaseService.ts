import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type PurchaseOrderStatus = "pendiente" | "en_transito" | "recibido";

export type PurchaseOrder = {
  id: number;
  order_number: string;
  supplier_id: number | null;
  import_agent_id: number | null;
  order_date: string | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  status: PurchaseOrderStatus;
  currency: string;
  exchange_rate: number | null;
  goods_cost: number | null;
  financial_disbursement: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: { name: string; currency: string } | null;
  import_agent?: { name: string } | null;
};

export type PurchaseOrderItem = {
  id: number;
  purchase_order_id: number;
  product_id: number | null;
  description: string | null;
  quantity: number;
  unit_price: number | null;
  currency: string;
  notes: string | null;
  product?: { id: number; name: string; sku: string } | null;
};

export type PurchaseOrderCost = {
  id: number;
  purchase_order_id: number;
  type: string;
  description: string | null;
  amount: number;
  currency: string;
  is_paid: boolean;
  paid_date: string | null;
  notes: string | null;
};

export type PurchaseOrderPayment = {
  id: number;
  purchase_order_id: number;
  type: string;
  description: string | null;
  amount: number;
  currency: string;
  scheduled_date: string | null;
  paid_date: string | null;
  is_paid: boolean;
  payment_method: string | null;
  notes: string | null;
};

export type PurchaseOrderWithDetails = PurchaseOrder & {
  items: PurchaseOrderItem[];
  costs: PurchaseOrderCost[];
  payments: PurchaseOrderPayment[];
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export async function getNextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OC-${year}-`;

  const { data } = await supabaseAdmin
    .from("purchase_orders")
    .select("order_number")
    .like("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return `${prefix}001`;

  const seq = parseInt((data[0].order_number as string).replace(prefix, ""), 10);
  return `${prefix}${String((isNaN(seq) ? 0 : seq) + 1).padStart(3, "0")}`;
}

// ─── LECTURA ──────────────────────────────────────────────────────────────────

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("purchase_orders")
    .select(`
      *,
      supplier:suppliers(name, currency),
      import_agent:import_agents(name)
    `)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as PurchaseOrder[];
}

export async function getPurchaseOrderById(
  id: number
): Promise<PurchaseOrderWithDetails | null> {
  const { data: po, error } = await supabaseAdmin
    .from("purchase_orders")
    .select(`
      *,
      supplier:suppliers(name, currency),
      import_agent:import_agents(name)
    `)
    .eq("id", id)
    .single();

  if (error || !po) return null;

  const [{ data: items }, { data: costs }, { data: payments }] =
    await Promise.all([
      supabaseAdmin
        .from("purchase_order_items")
        .select("*, product:products(id, name, sku)")
        .eq("purchase_order_id", id)
        .order("id"),
      supabaseAdmin
        .from("purchase_order_costs")
        .select("*")
        .eq("purchase_order_id", id)
        .order("id"),
      supabaseAdmin
        .from("purchase_order_payments")
        .select("*")
        .eq("purchase_order_id", id)
        .order("id"),
    ]);

  return {
    ...(po as PurchaseOrder),
    items: (items ?? []) as PurchaseOrderItem[],
    costs: (costs ?? []) as PurchaseOrderCost[],
    payments: (payments ?? []) as PurchaseOrderPayment[],
  };
}

// ─── CREACIÓN ─────────────────────────────────────────────────────────────────

type CreatePOInput = {
  orderNumber: string;
  supplierId: number | null;
  importAgentId: number | null;
  orderDate: string;
  estimatedArrival: string;
  currency: string;
  exchangeRate: number | null;
  notes: string;
  items: Array<{
    productId: number | null;
    description: string;
    quantity: number;
    unitPrice: number | null;
    currency: string;
    notes: string;
  }>;
  costs: Array<{
    type: string;
    description: string;
    amount: number;
    currency: string;
    isPaid: boolean;
  }>;
  payments: Array<{
    type: string;
    description: string;
    amount: number;
    currency: string;
    scheduledDate: string;
    isPaid: boolean;
    paymentMethod: string;
  }>;
};

export async function createPurchaseOrder(input: CreatePOInput): Promise<number> {
  // Calcular goods_cost como suma de líneas con precio conocido
  const goodsCost = input.items.reduce((acc, item) => {
    if (item.unitPrice != null) {
      return acc + item.quantity * item.unitPrice;
    }
    return acc;
  }, 0);

  // 1. Crear la orden
  const { data: po, error: poError } = await supabaseAdmin
    .from("purchase_orders")
    .insert({
      order_number: input.orderNumber,
      supplier_id: input.supplierId,
      import_agent_id: input.importAgentId || null,
      order_date: input.orderDate || null,
      estimated_arrival: input.estimatedArrival || null,
      status: "pendiente",
      currency: input.currency,
      exchange_rate: input.exchangeRate,
      goods_cost: goodsCost > 0 ? goodsCost : null,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (poError || !po) throw new Error("No se pudo crear la orden de compra");

  const orderId = po.id as number;

  // 2. Insertar items
  if (input.items.length > 0) {
    const { error: itemsError } = await supabaseAdmin
      .from("purchase_order_items")
      .insert(
        input.items.map((item) => ({
          purchase_order_id: orderId,
          product_id: item.productId,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency: item.currency,
          notes: item.notes || null,
        }))
      );
    if (itemsError) throw new Error("Error al guardar los productos");
  }

  // 3. Insertar costos adicionales
  if (input.costs.length > 0) {
    const { error: costsError } = await supabaseAdmin
      .from("purchase_order_costs")
      .insert(
        input.costs.map((c) => ({
          purchase_order_id: orderId,
          type: c.type,
          description: c.description || null,
          amount: c.amount,
          currency: c.currency,
          is_paid: c.isPaid,
        }))
      );
    if (costsError) throw new Error("Error al guardar los costos");
  }

  // 4. Insertar pagos
  if (input.payments.length > 0) {
    const { error: paymentsError } = await supabaseAdmin
      .from("purchase_order_payments")
      .insert(
        input.payments.map((p) => ({
          purchase_order_id: orderId,
          type: p.type,
          description: p.description || null,
          amount: p.amount,
          currency: p.currency,
          scheduled_date: p.scheduledDate || null,
          is_paid: p.isPaid,
          payment_method: p.paymentMethod || null,
        }))
      );
    if (paymentsError) throw new Error("Error al guardar los pagos");
  }

  // 5. Actualizar stock_en_pedido para cada producto con productId
  for (const item of input.items) {
    if (!item.productId) continue;

    const { data: prod } = await supabaseAdmin
      .from("products")
      .select("stock_en_pedido")
      .eq("id", item.productId)
      .single();

    if (prod) {
      await supabaseAdmin
        .from("products")
        .update({
          stock_en_pedido: (Number(prod.stock_en_pedido) || 0) + item.quantity,
        })
        .eq("id", item.productId);
    }
  }

  return orderId;
}

// ─── CAMBIO DE ESTADO ─────────────────────────────────────────────────────────

export async function updatePurchaseOrderStatus(
  id: number,
  newStatus: PurchaseOrderStatus
): Promise<void> {
  const po = await getPurchaseOrderById(id);
  if (!po) throw new Error("Orden no encontrada");

  const prevStatus = po.status;

  // Actualizar el estado de la orden
  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .update({
      status: newStatus,
      actual_arrival: newStatus === "recibido" ? new Date().toISOString().split("T")[0] : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error("No se pudo actualizar el estado");

  // Actualizar capas de stock según la transición
  for (const item of po.items) {
    if (!item.product_id) continue;

    const { data: prod } = await supabaseAdmin
      .from("products")
      .select("stock, stock_en_transito, stock_en_pedido")
      .eq("id", item.product_id)
      .single();

    if (!prod) continue;

    let stockFisico = Number(prod.stock) || 0;
    let enTransito = Number(prod.stock_en_transito) || 0;
    let enPedido = Number(prod.stock_en_pedido) || 0;

    if (prevStatus === "pendiente" && newStatus === "en_transito") {
      // Sale de pedido, entra en tránsito
      enPedido = Math.max(0, enPedido - item.quantity);
      enTransito = enTransito + item.quantity;
    } else if (prevStatus === "en_transito" && newStatus === "recibido") {
      // Sale de tránsito, entra al stock físico
      enTransito = Math.max(0, enTransito - item.quantity);
      stockFisico = stockFisico + item.quantity;
    } else if (prevStatus === "pendiente" && newStatus === "recibido") {
      // Caso directo (sin pasar por en_transito)
      enPedido = Math.max(0, enPedido - item.quantity);
      stockFisico = stockFisico + item.quantity;
    }

    // Determinar nuevo status del producto
    const nuevoStatus =
      stockFisico > 5
        ? "Disponible"
        : stockFisico > 0
        ? "Disponible"
        : enTransito > 0 || enPedido > 0
        ? "Bajo pedido"
        : "Sin stock";

    await supabaseAdmin
      .from("products")
      .update({
        stock: stockFisico,
        stock_en_transito: enTransito,
        stock_en_pedido: enPedido,
        status: nuevoStatus,
      })
      .eq("id", item.product_id);
  }
}

// ─── OPERACIONES EN DETALLE DE OC ─────────────────────────────────────────────

export async function addCostToPurchaseOrder(
  orderId: number,
  cost: {
    type: string;
    description: string;
    amount: number;
    currency: string;
    isPaid: boolean;
  }
) {
  const { error } = await supabaseAdmin.from("purchase_order_costs").insert({
    purchase_order_id: orderId,
    type: cost.type,
    description: cost.description || null,
    amount: cost.amount,
    currency: cost.currency,
    is_paid: cost.isPaid,
  });
  if (error) throw new Error("No se pudo agregar el costo");
}

export async function toggleCostPaid(costId: number, current: boolean) {
  const { error } = await supabaseAdmin
    .from("purchase_order_costs")
    .update({
      is_paid: !current,
      paid_date: !current ? new Date().toISOString().split("T")[0] : null,
    })
    .eq("id", costId);
  if (error) throw new Error("No se pudo actualizar el costo");
}

export async function deleteCost(costId: number) {
  const { error } = await supabaseAdmin
    .from("purchase_order_costs")
    .delete()
    .eq("id", costId);
  if (error) throw new Error("No se pudo eliminar el costo");
}

export async function addPaymentToPurchaseOrder(
  orderId: number,
  payment: {
    type: string;
    description: string;
    amount: number;
    currency: string;
    scheduledDate: string;
    paymentMethod: string;
  }
) {
  const { error } = await supabaseAdmin.from("purchase_order_payments").insert({
    purchase_order_id: orderId,
    type: payment.type,
    description: payment.description || null,
    amount: payment.amount,
    currency: payment.currency,
    scheduled_date: payment.scheduledDate || null,
    payment_method: payment.paymentMethod || null,
    is_paid: false,
  });
  if (error) throw new Error("No se pudo agregar el pago");
}

export async function togglePaymentPaid(paymentId: number, current: boolean) {
  const { error } = await supabaseAdmin
    .from("purchase_order_payments")
    .update({
      is_paid: !current,
      paid_date: !current ? new Date().toISOString().split("T")[0] : null,
    })
    .eq("id", paymentId);
  if (error) throw new Error("No se pudo actualizar el pago");
}

export async function deletePayment(paymentId: number) {
  const { error } = await supabaseAdmin
    .from("purchase_order_payments")
    .delete()
    .eq("id", paymentId);
  if (error) throw new Error("No se pudo eliminar el pago");
}

// ─── EDICIÓN DE ORDEN ─────────────────────────────────────────────────────────

export async function updatePurchaseOrder(
  id: number,
  fields: {
    supplierId?: number | null;
    importAgentId?: number | null;
    orderDate?: string | null;
    estimatedArrival?: string | null;
    currency?: string;
    exchangeRate?: number | null;
    goodsCost?: number | null;
    notes?: string | null;
  }
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.supplierId !== undefined) update.supplier_id = fields.supplierId;
  if (fields.importAgentId !== undefined) update.import_agent_id = fields.importAgentId || null;
  if (fields.orderDate !== undefined) update.order_date = fields.orderDate || null;
  if (fields.estimatedArrival !== undefined) update.estimated_arrival = fields.estimatedArrival || null;
  if (fields.currency !== undefined) update.currency = fields.currency;
  if (fields.exchangeRate !== undefined) update.exchange_rate = fields.exchangeRate;
  if (fields.goodsCost !== undefined) update.goods_cost = fields.goodsCost;
  if (fields.notes !== undefined) update.notes = fields.notes || null;

  const { error } = await supabaseAdmin
    .from("purchase_orders")
    .update(update)
    .eq("id", id);

  if (error) throw new Error("No se pudo actualizar la orden");
}
