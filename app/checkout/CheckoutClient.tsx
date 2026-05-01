"use client";

import { useState } from "react";
import Link from "next/link";
import { checkoutAction } from "./actions";
import { useCart } from "@/lib/useCart";
import { Trash2 } from "lucide-react";

function money(value: number) {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CheckoutClient({ userEmail }: { userEmail: string }) {
  const { items, total, clearCart, isReady, removeItem } = useCart();
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
      if (!res.success) {
        setError(res.error || "No se pudo confirmar el pedido");
        return;
      }
      clearCart();
      window.location.href = `/gracias/${res.saleId}`;
    } catch (err: any) {
      setError(err?.message || "No se pudo confirmar el pedido");
    } finally {
      setLoading(false);
    }
  }

  if (!isReady) {
    return (
      <div className="border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-neutral-500">
        Cargando...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-white/[0.07] bg-white/[0.02] p-12 text-center">
        <p className="text-sm text-neutral-500">Tu carrito esta vacio.</p>
        <Link
          href="/products"
          className="mt-6 inline-block border border-white/10 px-6 py-2.5 text-sm text-neutral-300 transition hover:border-white/30 hover:text-white"
        >
          Ver catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Checkout</p>
          <h1 className="mt-3 text-3xl font-light">Datos de entrega</h1>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Contacto */}
        <section className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500">Contacto</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-neutral-500">Email</label>
              <input name="email" type="email" defaultValue={userEmail} required className="input w-full" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Nombre completo</label>
              <input name="name" required className="input w-full" placeholder="Juan Garcia" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Telefono</label>
              <input name="phone" required className="input w-full" placeholder="+54 11 1234-5678" />
            </div>
          </div>
        </section>

        {/* Direccion */}
        <section className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500">Direccion de entrega</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Calle</label>
              <input name="street" required className="input w-full" placeholder="Av. Corrientes" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Numero</label>
              <input name="number" required className="input w-full" placeholder="1234" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Piso / Depto (opcional)</label>
              <input name="floorApartment" className="input w-full" placeholder="3 B" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Codigo postal</label>
              <input name="postalCode" className="input w-full" placeholder="1414" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Ciudad</label>
              <input name="city" required className="input w-full" placeholder="Buenos Aires" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">Provincia</label>
              <input name="province" required className="input w-full" placeholder="CABA" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-neutral-500">Referencia (opcional)</label>
              <input name="reference" className="input w-full" placeholder="Entre calles, color de puerta, etc." />
            </div>
          </div>
        </section>

        {/* Notas */}
        <section className="border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500">Notas del pedido</p>
          <textarea name="notes" rows={3} className="input w-full resize-none" placeholder="Instrucciones especiales, horario preferido de entrega, etc." />
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-[#d6b36a] disabled:opacity-50"
        >
          {loading ? "Confirmando pedido..." : "Confirmar pedido"}
        </button>
        <p className="text-center text-xs text-neutral-600">
          El pago se coordina directamente con Luminarg luego de confirmar.
        </p>
      </form>

      {/* Resumen */}
      <aside className="h-fit border border-white/[0.07] bg-white/[0.02] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Tu pedido</p>
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.product_id} className="flex items-start justify-between gap-2 border-b border-white/[0.05] pb-3">
              <div className="min-w-0">
                <p className="text-sm text-white">{item.name}</p>
                <p className="text-xs text-neutral-600">{item.quantity} x ARS {money(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-white">ARS {money(item.price * item.quantity)}</span>
                <button type="button" onClick={() => removeItem(item.product_id)} className="text-neutral-600 transition hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <span className="text-sm text-neutral-400">Total</span>
          <span className="text-xl font-light text-white">ARS {money(total)}</span>
        </div>
        <Link href="/cart" className="mt-4 block text-center text-xs text-neutral-600 transition hover:text-neutral-400">
          Modificar carrito
        </Link>
      </aside>
    </div>
  );
}
