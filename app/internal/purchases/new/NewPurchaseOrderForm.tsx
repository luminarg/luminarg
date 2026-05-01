"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Trash2, Loader2, CheckCircle } from "lucide-react";
import { createPurchaseOrderAction, getSuggestionsAction } from "./actions";
import type { SugerenciaItem } from "@/data/aiService";

// ─── Tipos locales ─────────────────────────────────────────────────────────────

type ProductOption = {
  id: number;
  name: string;
  sku: string;
  stock: number;
  stock_en_transito: number;
  stock_en_pedido: number;
};

type SupplierOption = { id: number; name: string; currency: string };
type AgentOption = { id: number; name: string };

type ProductRow = {
  productId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  currency: string;
  notes: string;
};

type CostRow = {
  type: string;
  description: string;
  amount: string;
  currency: string;
  isPaid: boolean;
};

type PaymentRow = {
  type: string;
  description: string;
  amount: string;
  currency: string;
  scheduledDate: string;
  isPaid: boolean;
  paymentMethod: string;
};

const COST_TYPES = ["flete", "aduana", "seguro", "agente", "impuesto", "otros"];
const PAYMENT_TYPES = ["adelanto", "saldo", "cuota"];
const CURRENCIES = ["USD", "ARS", "CNY", "EUR"];

function emptyProduct(): ProductRow {
  return { productId: "", description: "", quantity: "1", unitPrice: "", currency: "USD", notes: "" };
}
function emptyCost(): CostRow {
  return { type: "flete", description: "", amount: "", currency: "ARS", isPaid: false };
}
function emptyPayment(): PaymentRow {
  return { type: "adelanto", description: "", amount: "", currency: "USD", scheduledDate: "", isPaid: false, paymentMethod: "" };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function NewPurchaseOrderForm({
  orderNumber: initialOrderNumber,
  suppliers,
  agents,
  products,
}: {
  orderNumber: string;
  suppliers: SupplierOption[];
  agents: AgentOption[];
  products: ProductOption[];
}) {
  const router = useRouter();

  // Datos generales
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [supplierId, setSupplierId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("");
  const [notes, setNotes] = useState("");

  // Filas dinámicas
  const [productRows, setProductRows] = useState<ProductRow[]>([emptyProduct()]);
  const [costRows, setCostRows] = useState<CostRow[]>([]);
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([]);

  // IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SugerenciaItem[] | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiError, setAiError] = useState("");

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ─── Handlers: productos ────────────────────────────────────────────────────

  function updateProductRow(i: number, field: keyof ProductRow, value: string) {
    setProductRows((rows) => {
      const next = [...rows];
      next[i] = { ...next[i], [field]: value };

      // Auto-fill descripción al seleccionar producto
      if (field === "productId" && value) {
        const prod = products.find((p) => String(p.id) === value);
        if (prod) next[i].description = prod.name;
      }

      return next;
    });
  }

  function removeProductRow(i: number) {
    setProductRows((rows) => rows.filter((_, idx) => idx !== i));
  }

  // ─── IA: sugerencia de reposición ───────────────────────────────────────────

  async function handleAiSuggest() {
    setAiLoading(true);
    setAiError("");
    setAiSuggestions(null);

    const result = await getSuggestionsAction();

    if (!result.success || !result.data) {
      setAiError(result.error ?? "No se pudo obtener la sugerencia");
    } else {
      setAiSuggestions(result.data.items);
      setAiSummary(result.data.summary);
    }

    setAiLoading(false);
  }

  function addSuggestionToForm(item: SugerenciaItem) {
    const prod = products.find((p) => p.id === item.product_id);
    const newRow: ProductRow = {
      productId: String(item.product_id),
      description: item.product_name,
      quantity: String(item.quantity_suggested),
      unitPrice: "",
      currency: "USD",
      notes: item.reason,
    };

    // Si ya existe una fila vacía, la reemplaza; sino agrega
    setProductRows((rows) => {
      const emptyIdx = rows.findIndex((r) => !r.productId && !r.description);
      if (emptyIdx !== -1) {
        const next = [...rows];
        next[emptyIdx] = newRow;
        return next;
      }
      return [...rows, newRow];
    });
  }

  function addAllSuggestions() {
    if (!aiSuggestions) return;
    const newRows: ProductRow[] = aiSuggestions.map((item) => ({
      productId: String(item.product_id),
      description: item.product_name,
      quantity: String(item.quantity_suggested),
      unitPrice: "",
      currency: "USD",
      notes: item.reason,
    }));
    setProductRows(newRows);
  }

  // ─── Handlers: costos ───────────────────────────────────────────────────────

  function updateCostRow(i: number, field: keyof CostRow, value: string | boolean) {
    setCostRows((rows) => {
      const next = [...rows];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  // ─── Handlers: pagos ────────────────────────────────────────────────────────

  function updatePaymentRow(i: number, field: keyof PaymentRow, value: string | boolean) {
    setPaymentRows((rows) => {
      const next = [...rows];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  // ─── Cálculo de totales ─────────────────────────────────────────────────────

  const goodsCost = productRows.reduce((acc, row) => {
    const qty = parseFloat(row.quantity) || 0;
    const price = parseFloat(row.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const totalPagos = paymentRows.reduce((acc, row) => {
    return acc + (parseFloat(row.amount) || 0);
  }, 0);

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (productRows.length === 0) {
      setSubmitError("Agregá al menos un producto");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const result = await createPurchaseOrderAction({
      orderNumber,
      supplierId: supplierId ? Number(supplierId) : null,
      importAgentId: agentId ? Number(agentId) : null,
      orderDate,
      estimatedArrival,
      currency,
      exchangeRate: exchangeRate ? Number(exchangeRate) : null,
      notes,
      items: productRows
        .filter((r) => r.description || r.productId)
        .map((r) => ({
          productId: r.productId ? Number(r.productId) : null,
          description: r.description,
          quantity: Math.max(1, parseInt(r.quantity) || 1),
          unitPrice: r.unitPrice ? parseFloat(r.unitPrice) : null,
          currency: r.currency,
          notes: r.notes,
        })),
      costs: costRows
        .filter((c) => c.amount)
        .map((c) => ({
          type: c.type,
          description: c.description,
          amount: parseFloat(c.amount) || 0,
          currency: c.currency,
          isPaid: c.isPaid,
        })),
      payments: paymentRows
        .filter((p) => p.amount)
        .map((p) => ({
          type: p.type,
          description: p.description,
          amount: parseFloat(p.amount) || 0,
          currency: p.currency,
          scheduledDate: p.scheduledDate,
          isPaid: p.isPaid,
          paymentMethod: p.paymentMethod,
        })),
    });

    if (result.success && result.id) {
      router.push(`/internal/purchases/${result.id}`);
    } else {
      setSubmitError(result.error ?? "Error al crear la orden");
      setSubmitting(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── SECCIÓN IA ────────────────────────────────────────────────────── */}
      <section className="border border-[#d6b36a]/20 bg-[#d6b36a]/[0.03] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#d6b36a]">
              ✨ Sugerencia inteligente de reposición
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              La IA analiza tu stock actual y las ventas de los últimos 90 días para sugerirte qué pedir.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={aiLoading}
            className="flex shrink-0 items-center gap-2 border border-[#d6b36a]/40 bg-[#d6b36a]/10 px-4 py-2.5 text-sm text-[#d6b36a] transition hover:bg-[#d6b36a]/20 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {aiLoading ? "Analizando stock..." : "Sugerir con IA"}
          </button>
        </div>

        {aiError && (
          <p className="mt-3 text-xs text-red-400">{aiError}</p>
        )}

        {aiSuggestions && aiSuggestions.length === 0 && (
          <p className="mt-3 text-xs text-green-400">
            ✓ El stock está bien cubierto. No hay reposiciones urgentes.
          </p>
        )}

        {aiSuggestions && aiSuggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            {aiSummary && (
              <p className="text-xs text-neutral-400">{aiSummary}</p>
            )}

            <div className="divide-y divide-white/[0.06]">
              {aiSuggestions.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white">{item.product_name}</p>
                    <p className="text-xs text-neutral-500">
                      {item.days_of_stock_remaining} días de stock · {item.reason}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-[#d6b36a]">
                      {item.quantity_suggested} ud.
                    </span>
                    <button
                      type="button"
                      onClick={() => addSuggestionToForm(item)}
                      className="border border-white/10 px-3 py-1 text-xs text-neutral-300 transition hover:border-white/30"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAllSuggestions}
              className="flex items-center gap-2 border border-[#d6b36a]/30 px-4 py-2 text-xs text-[#d6b36a] transition hover:bg-[#d6b36a]/10"
            >
              <CheckCircle size={13} />
              Usar todas las sugerencias
            </button>
          </div>
        )}
      </section>

      {/* ── DATOS GENERALES ────────────────────────────────────────────────── */}
      <section className="border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">
          Datos generales
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Número OC *">
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input-dark"
              placeholder="OC-2025-001"
            />
          </Field>

          <Field label="Proveedor">
            <select
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                const s = suppliers.find((s) => String(s.id) === e.target.value);
                if (s) setCurrency(s.currency);
              }}
              className="input-dark"
            >
              <option value="">Sin proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Agente de importación">
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="input-dark"
            >
              <option value="">Sin agente</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Fecha del pedido">
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="input-dark"
            />
          </Field>

          <Field label="Llegada estimada">
            <input
              type="date"
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              className="input-dark"
            />
          </Field>

          <Field label="Moneda de la OC">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-dark"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Tipo de cambio (1 USD = ? ARS)">
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="input-dark"
              placeholder="Ej: 1200"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Notas">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-dark"
              placeholder="Condiciones pactadas, referencias, observaciones..."
            />
          </Field>
        </div>
      </section>

      {/* ── PRODUCTOS ──────────────────────────────────────────────────────── */}
      <section className="border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">
          Productos
        </h2>

        <div className="space-y-3">
          {productRows.map((row, i) => {
            const prod = products.find((p) => String(p.id) === row.productId);
            return (
              <div key={i} className="grid gap-3 border border-white/[0.06] p-4 sm:grid-cols-2 lg:grid-cols-6">
                {/* Producto del sistema */}
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">
                    Producto del sistema
                  </label>
                  <select
                    value={row.productId}
                    onChange={(e) => updateProductRow(i, "productId", e.target.value)}
                    className="input-dark text-xs"
                  >
                    <option value="">Sin vincular</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  {prod && (
                    <p className="mt-1 text-[10px] text-neutral-600">
                      Stock: {prod.stock} · Tránsito: {prod.stock_en_transito} · Pedido: {prod.stock_en_pedido}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="lg:col-span-2">
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">
                    Descripción
                  </label>
                  <input
                    value={row.description}
                    onChange={(e) => updateProductRow(i, "description", e.target.value)}
                    className="input-dark text-xs"
                    placeholder="Nombre / descripción"
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => updateProductRow(i, "quantity", e.target.value)}
                    className="input-dark text-xs"
                  />
                </div>

                {/* Precio unitario */}
                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">
                    Precio unit.
                  </label>
                  <div className="flex gap-1">
                    <select
                      value={row.currency}
                      onChange={(e) => updateProductRow(i, "currency", e.target.value)}
                      className="input-dark w-20 text-xs"
                    >
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input
                      type="number"
                      step="0.0001"
                      value={row.unitPrice}
                      onChange={(e) => updateProductRow(i, "unitPrice", e.target.value)}
                      className="input-dark text-xs"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Botón eliminar */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeProductRow(i)}
                    className="p-2 text-neutral-700 transition hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Notas del ítem */}
                {row.notes && (
                  <div className="lg:col-span-6">
                    <p className="text-[10px] text-neutral-600">Nota IA: {row.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setProductRows((r) => [...r, emptyProduct()])}
          className="mt-4 flex items-center gap-2 border border-white/10 px-4 py-2 text-xs text-neutral-400 transition hover:border-white/20 hover:text-white"
        >
          <Plus size={13} />
          Agregar producto
        </button>
      </section>

      {/* ── COSTOS ADICIONALES ─────────────────────────────────────────────── */}
      <section className="border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">
          Costos adicionales
        </h2>
        <p className="mb-5 text-xs text-neutral-600">
          Flete, aduana, seguro, agente. Se usan para calcular el costo real por unidad.
        </p>

        {costRows.length > 0 && (
          <div className="mb-3 space-y-2">
            {costRows.map((row, i) => (
              <div key={i} className="grid gap-3 border border-white/[0.06] p-3 sm:grid-cols-5">
                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Tipo</label>
                  <select
                    value={row.type}
                    onChange={(e) => updateCostRow(i, "type", e.target.value)}
                    className="input-dark text-xs"
                  >
                    {COST_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Descripción</label>
                  <input
                    value={row.description}
                    onChange={(e) => updateCostRow(i, "description", e.target.value)}
                    className="input-dark text-xs"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Monto</label>
                  <div className="flex gap-1">
                    <select
                      value={row.currency}
                      onChange={(e) => updateCostRow(i, "currency", e.target.value)}
                      className="input-dark w-20 text-xs"
                    >
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updateCostRow(i, "amount", e.target.value)}
                      className="input-dark text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-xs text-neutral-400">
                    <input
                      type="checkbox"
                      checked={row.isPaid}
                      onChange={(e) => updateCostRow(i, "isPaid", e.target.checked)}
                      className="accent-[#d6b36a]"
                    />
                    Pagado
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setCostRows((r) => r.filter((_, idx) => idx !== i))}
                    className="p-2 text-neutral-700 transition hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCostRows((r) => [...r, emptyCost()])}
          className="flex items-center gap-2 border border-white/10 px-4 py-2 text-xs text-neutral-400 transition hover:border-white/20 hover:text-white"
        >
          <Plus size={13} />
          Agregar costo
        </button>
      </section>

      {/* ── PAGOS ──────────────────────────────────────────────────────────── */}
      <section className="border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-[0.15em] text-neutral-400">
          Pagos programados
        </h2>
        <p className="mb-5 text-xs text-neutral-600">
          Adelantos, saldos o cuotas. Podés cargarlos ahora o agregarlos después.
        </p>

        {paymentRows.length > 0 && (
          <div className="mb-3 space-y-2">
            {paymentRows.map((row, i) => (
              <div key={i} className="grid gap-3 border border-white/[0.06] p-3 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Tipo</label>
                  <select
                    value={row.type}
                    onChange={(e) => updatePaymentRow(i, "type", e.target.value)}
                    className="input-dark text-xs"
                  >
                    {PAYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Descripción</label>
                  <input
                    value={row.description}
                    onChange={(e) => updatePaymentRow(i, "description", e.target.value)}
                    className="input-dark text-xs"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Monto</label>
                  <div className="flex gap-1">
                    <select
                      value={row.currency}
                      onChange={(e) => updatePaymentRow(i, "currency", e.target.value)}
                      className="input-dark w-20 text-xs"
                    >
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updatePaymentRow(i, "amount", e.target.value)}
                      className="input-dark text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Fecha prog.</label>
                  <input
                    type="date"
                    value={row.scheduledDate}
                    onChange={(e) => updatePaymentRow(i, "scheduledDate", e.target.value)}
                    className="input-dark text-xs"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-600">Medio</label>
                  <input
                    value={row.paymentMethod}
                    onChange={(e) => updatePaymentRow(i, "paymentMethod", e.target.value)}
                    className="input-dark text-xs"
                    placeholder="Wire, efectivo..."
                  />
                </div>

                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-xs text-neutral-400">
                    <input
                      type="checkbox"
                      checked={row.isPaid}
                      onChange={(e) => updatePaymentRow(i, "isPaid", e.target.checked)}
                      className="accent-[#d6b36a]"
                    />
                    Pagado
                  </label>
                  <button
                    type="button"
                    onClick={() => setPaymentRows((r) => r.filter((_, idx) => idx !== i))}
                    className="ml-auto p-2 text-neutral-700 transition hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setPaymentRows((r) => [...r, emptyPayment()])}
          className="flex items-center gap-2 border border-white/10 px-4 py-2 text-xs text-neutral-400 transition hover:border-white/20 hover:text-white"
        >
          <Plus size={13} />
          Agregar pago
        </button>
      </section>

      {/* ── RESUMEN ────────────────────────────────────────────────────────── */}
      {(goodsCost > 0 || totalPagos > 0) && (
        <section className="border border-white/[0.08] bg-white/[0.01] p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
            Resumen financiero
          </h2>
          <div className="space-y-2 text-sm">
            {goodsCost > 0 && (
              <div className="flex justify-between text-neutral-300">
                <span>Costo mercadería (con precio pactado)</span>
                <span className="font-medium text-white">
                  {currency} {goodsCost.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {totalPagos > 0 && (
              <div className="flex justify-between text-neutral-300">
                <span>Total pagos programados</span>
                <span className="font-medium text-white">
                  {currency} {totalPagos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SUBMIT ─────────────────────────────────────────────────────────── */}
      {submitError && (
        <p className="text-sm text-red-400">{submitError}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-[#d6b36a] disabled:opacity-60"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "Guardando..." : "Crear orden de compra"}
        </button>

        <a
          href="/internal/purchases"
          className="border border-white/10 px-6 py-3 text-sm text-neutral-400 transition hover:text-white"
        >
          Cancelar
        </a>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-600">
        {label}
      </span>
      {children}
    </label>
  );
}
