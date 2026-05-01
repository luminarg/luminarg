"use client";

import { useState } from "react";
import { Sparkles, Loader2, Plus, ChevronRight, Pencil, X } from "lucide-react";
import {
  updateStatusAction,
  updateOrderAction,
  addCostAction,
  addPaymentAction,
  toggleCostAction,
  togglePaymentAction,
  deleteCostAction,
  deletePaymentAction,
  distribuirCostosAction,
} from "./actions";
import type { PurchaseOrderWithDetails, PurchaseOrderStatus } from "@/data/purchaseService";
import type { DistribucionItem } from "@/data/aiService";

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  en_transito: "En transito",
  recibido: "Recibido",
};
const STATUS_BADGE: Record<string, string> = {
  pendiente: "badge badge-gold",
  en_transito: "badge badge-blue",
  recibido: "badge badge-green",
};
const NEXT_STATUS: Record<string, PurchaseOrderStatus | null> = {
  pendiente: "en_transito",
  en_transito: "recibido",
  recibido: null,
};
const NEXT_STATUS_LABEL: Record<string, string> = {
  pendiente: "Marcar en transito",
  en_transito: "Marcar como recibido",
  recibido: "",
};

const COST_TYPES = ["flete", "aduana", "seguro", "agente", "impuesto", "otros"];
const PAYMENT_TYPES = ["adelanto", "saldo", "cuota"];
const CURRENCIES = ["USD", "ARS", "CNY", "EUR"];

function money(n: number | null, currency = "USD") {
  if (n == null || n === 0) return `${currency} 0`;
  return `${currency} ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export default function PurchaseOrderDetail({ order }: { order: PurchaseOrderWithDetails }) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<DistribucionItem[] | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiError, setAiError] = useState("");
  const [exchangeRateInput, setExchangeRateInput] = useState(String(order.exchange_rate ?? ""));
  const [editOpen, setEditOpen] = useState(false);

  async function handleStatusChange() {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const msg = next === "recibido"
      ? "Confirmar recepcion? Esto actualizara el stock de todos los productos."
      : "Confirmar que el pedido esta en transito?";
    if (!confirm(msg)) return;
    setStatusLoading(true);
    setStatusError("");
    const result = await updateStatusAction(order.id, next);
    if (!result.success) {
      setStatusError(result.error ?? "Error al actualizar");
      setStatusLoading(false);
    }
  }

  async function handleDistribuirCostos() {
    const tc = order.exchange_rate ? Number(order.exchange_rate) : Number(exchangeRateInput);
    if (!tc || tc <= 0) {
      setAiError("Ingresa el tipo de cambio (podes editarlo en la seccion Editar).");
      return;
    }
    const itemsConPrecio = order.items.filter((i) => i.unit_price != null);
    if (itemsConPrecio.length === 0) {
      setAiError("Necesitas cargar el precio unitario de al menos un producto.");
      return;
    }
    if (order.costs.length === 0) {
      setAiError("No hay costos adicionales cargados para distribuir.");
      return;
    }
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    const result = await distribuirCostosAction({
      items: order.items.map((i) => ({
        product_id: i.product_id ?? 0,
        product_name: i.description ?? i.product?.name ?? `Producto ${i.id}`,
        quantity: i.quantity,
        unit_price: i.unit_price,
        currency: i.currency,
      })),
      costos_adicionales: order.costs.map((c) => ({
        type: c.type,
        description: c.description ?? "",
        amount: c.amount,
        currency: c.currency,
      })),
      tipo_de_cambio: tc,
    });
    if (result.success && result.data) {
      setAiResult(result.data.items);
      setAiSummary(result.data.summary);
    } else {
      setAiError(result.error ?? "Error en la IA");
    }
    setAiLoading(false);
  }

  const totalCosts = order.costs.reduce((a, c) => a + Number(c.amount), 0);
  const paidCosts = order.costs.filter((c) => c.is_paid).reduce((a, c) => a + Number(c.amount), 0);
  const totalPayments = order.payments.reduce((a, p) => a + Number(p.amount), 0);
  const paidPayments = order.payments.filter((p) => p.is_paid).reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="space-y-8">

      {/* ESTADO */}
      <section className="flex flex-col gap-4 border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className={STATUS_BADGE[order.status]}>{STATUS_LABEL[order.status]}</span>
          {order.order_date && <span className="text-xs text-neutral-500">Pedido: {order.order_date}</span>}
          {order.estimated_arrival && <span className="text-xs text-neutral-500">Llegada est.: {order.estimated_arrival}</span>}
          {order.actual_arrival && <span className="text-xs text-green-500">Recibido: {order.actual_arrival}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {NEXT_STATUS[order.status] && (
            <button
              onClick={handleStatusChange}
              disabled={statusLoading}
              className="flex items-center gap-2 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-[#d6b36a] disabled:opacity-60"
            >
              {statusLoading ? <Loader2 size={13} className="animate-spin" /> : <ChevronRight size={13} />}
              {NEXT_STATUS_LABEL[order.status]}
            </button>
          )}
        </div>
        {statusError && <p className="w-full text-xs text-red-400">{statusError}</p>}
      </section>

      {/* INFO GENERAL */}
      <section className="border border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center justify-between p-5">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Proveedor" value={(order.supplier as any)?.name ?? "-"} />
            <Info label="Agente" value={(order.import_agent as any)?.name ?? "-"} />
            <Info label="Moneda" value={order.currency} />
            <Info label="Tipo de cambio" value={order.exchange_rate ? `1 ${order.currency} = ${order.exchange_rate} ARS` : "-"} />
            {order.goods_cost != null && <Info label="Costo mercaderia" value={money(order.goods_cost, order.currency)} />}
            {order.notes && (
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-[10px] uppercase tracking-widest text-neutral-600">Notas</p>
                <p className="mt-1 text-sm text-neutral-400">{order.notes}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditOpen((v) => !v)}
            className="ml-4 shrink-0 flex items-center gap-1.5 border border-white/[0.08] px-3 py-1.5 text-xs text-neutral-500 transition hover:border-white/20 hover:text-white"
          >
            {editOpen ? <X size={12} /> : <Pencil size={12} />}
            {editOpen ? "Cancelar" : "Editar"}
          </button>
        </div>

        {editOpen && (
          <form
            action={async (fd) => { await updateOrderAction(fd); setEditOpen(false); }}
            className="border-t border-white/[0.07] p-5"
          >
            <input type="hidden" name="orderId" value={order.id} />
            <p className="mb-4 text-[10px] uppercase tracking-widest text-neutral-600">Editar datos de la orden</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Fecha de pedido</label>
                <input type="date" name="orderDate" defaultValue={order.order_date ?? ""} className="input-dark w-full text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Llegada estimada</label>
                <input type="date" name="estimatedArrival" defaultValue={order.estimated_arrival ?? ""} className="input-dark w-full text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Moneda</label>
                <select name="currency" defaultValue={order.currency} className="input-dark w-full text-xs">
                  {["USD", "ARS", "CNY", "EUR"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Tipo de cambio (1 USD = ? ARS)</label>
                <input
                  type="number" name="exchangeRate" step="0.01"
                  defaultValue={order.exchange_rate ?? ""}
                  onChange={(e) => setExchangeRateInput(e.target.value)}
                  className="input-dark w-full text-xs" placeholder="Ej: 1200"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Notas</label>
                <textarea name="notes" defaultValue={order.notes ?? ""} rows={2} className="input-dark w-full resize-none text-xs" placeholder="Observaciones internas..." />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button type="submit" className="bg-white px-5 py-2 text-xs font-medium text-black transition hover:bg-[#d6b36a]">
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </section>

      {/* PRODUCTOS */}
      <section className="border border-white/[0.08] bg-white/[0.02] p-5">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">Productos ({order.items.length})</h2>
        {order.items.length === 0 ? (
          <p className="text-sm text-neutral-600">Sin productos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <th className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-neutral-600">Producto</th>
                  <th className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-neutral-600">Cant.</th>
                  <th className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-neutral-600">P. Unit.</th>
                  <th className="pb-2 text-[10px] font-medium uppercase tracking-wider text-neutral-600">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-4 text-neutral-200">
                      {item.description ?? item.product?.name ?? "-"}
                      {item.product?.sku && <span className="ml-2 text-xs text-neutral-600">{item.product.sku}</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-neutral-300">{item.quantity}</td>
                    <td className="py-2.5 pr-4 text-neutral-300">
                      {item.unit_price != null ? money(item.unit_price, item.currency) : <span className="text-neutral-600">Sin precio</span>}
                    </td>
                    <td className="py-2.5 text-neutral-300">
                      {item.unit_price != null ? money(item.quantity * item.unit_price, item.currency) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* COSTOS ADICIONALES */}
      <section className="border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">Costos adicionales</h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Pagado: {money(paidCosts, "ARS")}</span>
            <span>/</span>
            <span>Total: {money(totalCosts, "ARS")}</span>
          </div>
        </div>
        {order.costs.length > 0 && (
          <div className="mb-4 space-y-2">
            {order.costs.map((cost) => (
              <div key={cost.id} className="flex flex-col gap-2 border border-white/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-neutral">{cost.type}</span>
                  <span className="text-sm text-neutral-200">{cost.description || cost.type}</span>
                  <span className="text-sm font-medium text-white">{money(cost.amount, cost.currency)}</span>
                  <span className={`badge ${cost.is_paid ? "badge-green" : "badge-neutral"}`}>{cost.is_paid ? "Pagado" : "Pendiente"}</span>
                </div>
                <div className="flex gap-2">
                  <form action={toggleCostAction.bind(null, cost.id, order.id, cost.is_paid)}>
                    <button type="submit" className={`border px-3 py-1 text-xs transition ${cost.is_paid ? "border-yellow-700 text-yellow-400 hover:bg-yellow-900/20" : "border-green-700 text-green-400 hover:bg-green-900/20"}`}>
                      {cost.is_paid ? "Desmarcar" : "Marcar pagado"}
                    </button>
                  </form>
                  <form action={deleteCostAction.bind(null, cost.id, order.id)}>
                    <button type="submit" className="border border-red-800/50 px-3 py-1 text-xs text-red-400 transition hover:bg-red-900/20">Eliminar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
        <form action={addCostAction} className="grid gap-3 border border-white/[0.05] p-3 sm:grid-cols-5">
          <input type="hidden" name="orderId" value={order.id} />
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Tipo</label>
            <select name="type" className="input-dark text-xs">{COST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Descripcion</label>
            <input name="description" className="input-dark text-xs" placeholder="Opcional" />
          </div>
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Monto</label>
            <div className="flex gap-1">
              <select name="currency" defaultValue="ARS" className="input-dark w-20 text-xs">{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
              <input name="amount" type="number" step="0.01" required className="input-dark text-xs" />
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input type="checkbox" name="isPaid" className="accent-[#d6b36a]" /> Pagado
            </label>
          </div>
          <div className="flex items-end">
            <button type="submit" className="flex items-center gap-1 border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:border-white/30">
              <Plus size={12} /> Agregar
            </button>
          </div>
        </form>
      </section>

      {/* IA DISTRIBUCION */}
      {order.items.length > 0 && order.costs.length > 0 && (
        <section className="border border-[#d6b36a]/20 bg-[#d6b36a]/[0.03] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#d6b36a]">Distribuir costos de importacion con IA</p>
              <p className="mt-0.5 text-xs text-neutral-500">Calcula el costo real por unidad distribuyendo flete, aduana y demas costos proporcionalmente.</p>
            </div>
            <div className="flex items-center gap-2">
              {!order.exchange_rate && (
                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">TC manual (1 USD = ? ARS)</label>
                  <input
                    type="number" value={exchangeRateInput}
                    onChange={(e) => setExchangeRateInput(e.target.value)}
                    className="input-dark w-32 text-xs" placeholder="Ej: 1200"
                  />
                </div>
              )}
              <button
                onClick={handleDistribuirCostos} disabled={aiLoading}
                className={`flex items-center gap-2 border border-[#d6b36a]/40 bg-[#d6b36a]/10 px-4 py-2.5 text-sm text-[#d6b36a] transition hover:bg-[#d6b36a]/20 disabled:opacity-50 ${!order.exchange_rate ? "mt-5" : ""}`}
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {aiLoading ? "Calculando..." : "Distribuir costos"}
              </button>
            </div>
          </div>
          {aiError && <p className="mt-3 text-xs text-red-400">{aiError}</p>}
          {aiResult && (
            <div className="mt-4 space-y-2">
              {aiSummary && <p className="mb-1 text-xs text-neutral-400">{aiSummary}</p>}
              <p className="mb-3 text-[10px] text-neutral-600">TC utilizado: 1 {order.currency} = {order.exchange_rate ?? exchangeRateInput} ARS</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.07] text-left">
                      <th className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-neutral-600">Producto</th>
                      <th className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-neutral-600">P. Unit. original</th>
                      <th className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-neutral-600">Costo import. / ud</th>
                      <th className="pb-2 text-[10px] font-medium uppercase tracking-wider text-[#d6b36a]">Costo real / ud (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {aiResult.map((item, i) => {
                      const originalItem = order.items.find(
                        (oi) => oi.product_id === item.product_id || oi.description === item.product_name
                      );
                      return (
                        <tr key={i}>
                          <td className="py-2.5 pr-4 text-neutral-200">{item.product_name}</td>
                          <td className="py-2.5 pr-4 text-neutral-400">
                            {originalItem?.unit_price != null ? `USD ${Number(originalItem.unit_price).toFixed(4)}` : "-"}
                          </td>
                          <td className="py-2.5 pr-4 text-neutral-400">USD {Number(item.additional_cost_per_unit).toFixed(4)}</td>
                          <td className="py-2.5 font-medium text-[#d6b36a]">USD {Number(item.total_cost_per_unit).toFixed(4)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* PAGOS */}
      <section className="border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">Pagos programados</h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Pagado: {money(paidPayments, order.currency)}</span>
            <span>/</span>
            <span>Total: {money(totalPayments, order.currency)}</span>
          </div>
        </div>
        {order.payments.length > 0 && (
          <div className="mb-4 space-y-2">
            {order.payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-2 border border-white/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-neutral">{payment.type}</span>
                  {payment.description && <span className="text-sm text-neutral-300">{payment.description}</span>}
                  <span className="text-sm font-medium text-white">{money(payment.amount, payment.currency)}</span>
                  {payment.scheduled_date && <span className="text-xs text-neutral-500">Vence: {payment.scheduled_date}</span>}
                  {payment.payment_method && <span className="text-xs text-neutral-500">{payment.payment_method}</span>}
                  <span className={`badge ${payment.is_paid ? "badge-green" : "badge-neutral"}`}>{payment.is_paid ? "Pagado" : "Pendiente"}</span>
                </div>
                <div className="flex gap-2">
                  <form action={togglePaymentAction.bind(null, payment.id, order.id, payment.is_paid)}>
                    <button type="submit" className={`border px-3 py-1 text-xs transition ${payment.is_paid ? "border-yellow-700 text-yellow-400 hover:bg-yellow-900/20" : "border-green-700 text-green-400 hover:bg-green-900/20"}`}>
                      {payment.is_paid ? "Desmarcar" : "Marcar pagado"}
                    </button>
                  </form>
                  <form action={deletePaymentAction.bind(null, payment.id, order.id)}>
                    <button type="submit" className="border border-red-800/50 px-3 py-1 text-xs text-red-400 transition hover:bg-red-900/20">Eliminar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
        <form action={addPaymentAction} className="grid gap-3 border border-white/[0.05] p-3 sm:grid-cols-2 lg:grid-cols-6">
          <input type="hidden" name="orderId" value={order.id} />
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Tipo</label>
            <select name="type" className="input-dark text-xs">{PAYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Descripcion</label>
            <input name="description" className="input-dark text-xs" placeholder="Opcional" />
          </div>
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Monto</label>
            <div className="flex gap-1">
              <select name="currency" defaultValue="USD" className="input-dark w-20 text-xs">{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
              <input name="amount" type="number" step="0.01" required className="input-dark text-xs" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Fecha prog.</label>
            <input name="scheduledDate" type="date" className="input-dark text-xs" />
          </div>
          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Medio</label>
            <input name="paymentMethod" className="input-dark text-xs" placeholder="Wire, efectivo..." />
          </div>
          <div className="flex items-end">
            <button type="submit" className="flex items-center gap-1 border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:border-white/30">
              <Plus size={12} /> Agregar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-neutral-600">{label}</p>
      <p className="mt-1 text-sm text-neutral-200">{value}</p>
    </div>
  );
}
