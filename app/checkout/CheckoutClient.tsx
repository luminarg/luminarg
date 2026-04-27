"use client";

import { useState } from "react";
import { checkoutAction } from "./actions";
import { useCart } from "@/lib/useCart";

function money(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CheckoutClient() {
  const { items, total, clearCart, isReady } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("cart", JSON.stringify(items));

      const res = await checkoutAction(formData);

      if (res.success) {
        clearCart();
        window.location.href = `/gracias/${res.saleId}`;
      }
    } catch (err: any) {
      setError(err?.message || "No se pudo confirmar el pedido");
    } finally {
      setLoading(false);
    }
  }

  if (!isReady) {
    return (
      <div className="border border-white/10 bg-white/[0.03] p-8 text-neutral-400">
        Cargando carrito...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-white/10 bg-white/[0.03] p-8">
        <h1 className="text-3xl font-light">Tu carrito está vacío</h1>
        <p className="mt-3 text-neutral-400">
          Agregá productos desde el catálogo para continuar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <form
        onSubmit={handleSubmit}
        className="border border-white/10 bg-white/[0.03] p-6 sm:p-8"
      >
        <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
          Checkout
        </p>

        <h1 className="mt-3 text-4xl font-light">Datos de entrega</h1>

        <p className="mt-4 text-neutral-400">
          Confirmá tus datos. Nos vamos a contactar para coordinar el pago y el envío.
        </p>

        {error && (
          <div className="mt-6 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field label="Nombre y apellido">
            <input name="name" required className="input-dark" />
          </Field>

          <Field label="Teléfono / WhatsApp">
            <input name="phone" required className="input-dark" />
          </Field>

          <Field label="Calle">
            <input name="street" required className="input-dark" />
          </Field>

          <Field label="Número">
            <input name="number" required className="input-dark" />
          </Field>

          <Field label="Piso / Depto">
            <input name="floorApartment" className="input-dark" />
          </Field>

          <Field label="Ciudad">
            <input name="city" required className="input-dark" />
          </Field>

          <Field label="Provincia">
            <input name="province" required className="input-dark" />
          </Field>

          <Field label="Código postal">
            <input name="postalCode" className="input-dark" />
          </Field>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-neutral-400">
            Referencia de entrega
          </span>
          <textarea
            name="reference"
            rows={3}
            className="input-dark resize-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 rounded-full bg-white px-7 py-3 text-sm font-medium text-black disabled:opacity-60"
        >
          {loading ? "Confirmando..." : "Confirmar pedido"}
        </button>
      </form>

      <aside className="h-fit border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-light">Resumen</h2>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.product_id} className="border-b border-white/10 pb-4">
              <div className="flex justify-between gap-4">
                <div>
                  <p>{item.name}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>

                <p className="text-neutral-300">
                  ARS {money(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between border-t border-white/10 pt-5 text-lg">
          <span>Total</span>
          <span>ARS {money(total)}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-neutral-500">
          El pago no se realiza online todavía. Luminarg se contactará para coordinar el medio de pago.
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-neutral-400">{label}</span>
      {children}
    </label>
  );
}