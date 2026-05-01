"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/useCart";

function money(value: number) {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CartClient() {
  const { items, removeItem, updateQuantity, total, isReady } = useCart();

  if (!isReady) {
    return (
      <div className="border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-neutral-500">
        Cargando carrito...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-white/[0.07] bg-white/[0.02] p-12 text-center">
        <p className="text-neutral-500">Tu carrito esta vacio.</p>
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
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.product_id}
            className="flex items-center gap-4 border border-white/[0.07] bg-white/[0.02] px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-light text-white">{item.name}</p>
              <p className="mt-0.5 text-xs text-neutral-600">ARS {money(item.price)} c/u</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center border border-white/[0.08] text-neutral-400 transition hover:border-white/20 hover:text-white"
              >
                &minus;
              </button>
              <span className="flex h-8 w-10 items-center justify-center border-y border-white/[0.08] text-sm text-white">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center border border-white/[0.08] text-neutral-400 transition hover:border-white/20 hover:text-white"
              >
                +
              </button>
            </div>
            <p className="w-28 text-right text-sm text-white">ARS {money(item.price * item.quantity)}</p>
            <button
              type="button"
              onClick={() => removeItem(item.product_id)}
              className="ml-2 text-neutral-600 transition hover:text-red-400"
              aria-label="Quitar del carrito"
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>

      {/* Resumen */}
      <aside className="h-fit border border-white/[0.07] bg-white/[0.02] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Resumen</p>
        <div className="mt-5 space-y-2">
          {items.map((item) => (
            <div key={item.product_id} className="flex justify-between text-xs text-neutral-500">
              <span className="truncate pr-2">{item.name} x{item.quantity}</span>
              <span className="shrink-0">ARS {money(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <span className="text-sm text-neutral-400">Total</span>
          <span className="text-lg font-light text-white">ARS {money(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block bg-white px-5 py-3 text-center text-sm font-medium text-black transition hover:bg-[#d6b36a]"
        >
          Ir a pagar
        </Link>
        <Link
          href="/products"
          className="mt-3 block border border-white/[0.07] px-5 py-2.5 text-center text-xs text-neutral-500 transition hover:border-white/20 hover:text-neutral-300"
        >
          Seguir comprando
        </Link>
      </aside>
    </div>
  );
}
