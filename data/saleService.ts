import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type SaleStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type DeliveryStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Sale = {
  id: number;
  customer_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  status: SaleStatus;
  payment_status: PaymentStatus;
  delivery_status: DeliveryStatus;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_recipient_name: string;
  shipping_recipient_phone: string | null;
  shipping_street: string;
  shipping_street_number: string;
  shipping_floor_apartment: string | null;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string | null;
  shipping_reference: string | null;
  shipping_carrier: string | null;
  shipping_tracking_id: string | null;
  shipping_tracking_url: string | null;
  shipping_notes: string | null;
  notes: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SaleItem = {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  product_slug: string | null;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};

export type SalePayment = {
  id: number;
  sale_id: number;
  method: string;
  status: string;
  amount: number;
  provider: string | null;
  external_id: string | null;
  external_reference: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SaleWithDetails = Sale & {
  items: SaleItem[];
  payments: SalePayment[];
};

function mapSale(row: any): Sale {
  return {
    id: Number(row.id),
    customer_id: row.customer_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    status: row.status,
    payment_status: row.payment_status,
    delivery_status: row.delivery_status,
    subtotal: Number(row.subtotal ?? 0),
    discount_amount: Number(row.discount_amount ?? 0),
    shipping_amount: Number(row.shipping_amount ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    shipping_recipient_name: row.shipping_recipient_name,
    shipping_recipient_phone: row.shipping_recipient_phone,
    shipping_street: row.shipping_street,
    shipping_street_number: row.shipping_street_number,
    shipping_floor_apartment: row.shipping_floor_apartment,
    shipping_city: row.shipping_city,
    shipping_province: row.shipping_province,
    shipping_postal_code: row.shipping_postal_code,
    shipping_reference: row.shipping_reference,
    shipping_carrier: row.shipping_carrier,
    shipping_tracking_id: row.shipping_tracking_id,
    shipping_tracking_url: row.shipping_tracking_url,
    shipping_notes: row.shipping_notes,
    notes: row.notes,
    paid_at: row.paid_at,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapSaleItem(row: any): SaleItem {
  return {
    id: Number(row.id),
    sale_id: Number(row.sale_id),
    product_id: Number(row.product_id),
    product_name: row.product_name,
    product_slug: row.product_slug,
    product_sku: row.product_sku,
    unit_price: Number(row.unit_price ?? 0),
    quantity: Number(row.quantity ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    created_at: row.created_at,
  };
}

function mapSalePayment(row: any): SalePayment {
  return {
    id: Number(row.id),
    sale_id: Number(row.sale_id),
    method: row.method,
    status: row.status,
    amount: Number(row.amount ?? 0),
    provider: row.provider,
    external_id: row.external_id,
    external_reference: row.external_reference,
    approved_at: row.approved_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabaseAdmin
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    return [];
  }

  return (data ?? []).map(mapSale);
}

export async function getSaleById(id: number): Promise<SaleWithDetails | null> {
  const { data: saleData, error: saleError } = await supabaseAdmin
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();

  if (saleError || !saleData) {
    console.error("Error fetching sale:", saleError);
    return null;
  }

  const [{ data: itemsData }, { data: paymentsData }] = await Promise.all([
    supabaseAdmin
      .from("sale_items")
      .select("*")
      .eq("sale_id", id)
      .order("id", { ascending: true }),
    supabaseAdmin
      .from("sale_payments")
      .select("*")
      .eq("sale_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    ...mapSale(saleData),
    items: (itemsData ?? []).map(mapSaleItem),
    payments: (paymentsData ?? []).map(mapSalePayment),
  };
}

export async function updateSaleDeliveryStatus(
  id: number,
  deliveryStatus: DeliveryStatus
) {
  const saleStatusByDelivery: Record<DeliveryStatus, SaleStatus> = {
    pending: "paid",
    preparing: "preparing",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
  };

  const { error } = await supabaseAdmin
    .from("sales")
    .update({
      delivery_status: deliveryStatus,
      status: saleStatusByDelivery[deliveryStatus],
    })
    .eq("id", id)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error updating sale delivery status:", error);
    throw new Error("No se pudo actualizar el estado de entrega");
  }
}

export async function markSaleAsShipped(
  id: number,
  shippingData: {
    carrier: string;
    trackingId: string;
    trackingUrl: string;
    shippingNotes: string;
  }
) {
  const { error } = await supabaseAdmin
    .from("sales")
    .update({
      status: "shipped",
      delivery_status: "shipped",
      shipping_carrier: shippingData.carrier || null,
      shipping_tracking_id: shippingData.trackingId || null,
      shipping_tracking_url: shippingData.trackingUrl || null,
      shipping_notes: shippingData.shippingNotes || null,
    })
    .eq("id", id)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error marking sale as shipped:", error);
    throw new Error("No se pudo marcar la venta como enviada");
  }
}

export async function markSaleAsPaid(id: number, profileId: string) {
  const sale = await getSaleById(id);

  if (!sale) throw new Error("Venta no encontrada");
  if (sale.status === "cancelled") throw new Error("No se puede cobrar una venta cancelada");
  if (sale.payment_status === "paid") return;

  for (const item of sale.items) {
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, stock")
      .eq("id", item.product_id)
      .single();

    if (productError || !product) throw new Error(`No se pudo verificar stock de ${item.product_name}`);

    const previousStock = Number(product.stock ?? 0);
    const newStock = previousStock - item.quantity;

    if (newStock < 0) throw new Error(`Stock insuficiente para ${item.product_name}`);

    const { error: updateStockError } = await supabaseAdmin
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.product_id);

    if (updateStockError) throw new Error(`No se pudo descontar stock de ${item.product_name}`);

    const { error: movementError } = await supabaseAdmin
      .from("stock_movements")
      .insert({
        product_id: item.product_id,
        sale_id: sale.id,
        movement_type: "sale",
        quantity: -item.quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        notes: `Venta #${sale.id}`,
        created_by: profileId,
      });

    if (movementError) throw new Error("No se pudo registrar el movimiento de stock");
  }

  const now = new Date().toISOString();

  const { error: saleError } = await supabaseAdmin
    .from("sales")
    .update({ status: "paid", payment_status: "paid", paid_at: now })
    .eq("id", id);

  if (saleError) throw new Error("No se pudo marcar la venta como pagada");

  const { error: paymentError } = await supabaseAdmin
    .from("sale_payments")
    .update({ status: "approved", approved_at: now })
    .eq("sale_id", id);

  if (paymentError) throw new Error("No se pudo aprobar el pago");
}

export async function updateShippingTracking(
  id: number,
  data: {
    carrier: string;
    trackingId: string;
    trackingUrl: string;
    shippingNotes: string;
  }
) {
  const { error } = await supabaseAdmin
    .from("sales")
    .update({
      shipping_carrier: data.carrier || null,
      shipping_tracking_id: data.trackingId || null,
      shipping_tracking_url: data.trackingUrl || null,
      shipping_notes: data.shippingNotes || null,
    })
    .eq("id", id);

  if (error) throw new Error("No se pudo guardar el seguimiento");
}

export async function cancelSale(id: number, profileId: string) {
  const sale = await getSaleById(id);

  if (!sale) throw new Error("Venta no encontrada");
  if (sale.status === "cancelled") return;

  const shouldRestoreStock = sale.payment_status === "paid";

  if (shouldRestoreStock) {
    for (const item of sale.items) {
      const { data: product, error: productError } = await supabaseAdmin
        .from("products")
        .select("id, stock")
        .eq("id", item.product_id)
        .single();

      if (productError || !product) throw new Error(`No se pudo verificar stock de ${item.product_name}`);

      const previousStock = Number(product.stock ?? 0);
      const newStock = previousStock + item.quantity;

      const { error: updateStockError } = await supabaseAdmin
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.product_id);

      if (updateStockError) throw new Error(`No se pudo restaurar stock de ${item.product_name}`);

      const { error: movementError } = await supabaseAdmin
        .from("stock_movements")
        .insert({
          product_id: item.product_id,
          sale_id: sale.id,
          movement_type: "sale_cancelled",
          quantity: item.quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          notes: `Cancelacion venta #${sale.id}`,
          created_by: profileId,
        });

      if (movementError) throw new Error("No se pudo registrar la devolucion de stock");
    }
  }

  const now = new Date().toISOString();

  const { error: saleError } = await supabaseAdmin
    .from("sales")
    .update({
      status: "cancelled",
      payment_status: sale.payment_status === "paid" ? "refunded" : "cancelled",
      delivery_status: "cancelled",
      cancelled_at: now,
    })
    .eq("id", id);

  if (saleError) throw new Error("No se pudo cancelar la venta");

  const { error: paymentError } = await supabaseAdmin
    .from("sale_payments")
    .update({ status: sale.payment_status === "paid" ? "refunded" : "cancelled" })
    .eq("sale_id", id);

  if (paymentError) throw new Error("No se pudo cancelar el pago");
}
