"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { useCart } from "@/lib/useCart";

function money(value: number) {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CartDropdown() {
  const [open, setOpen] = useState(false);
  const { items, total, count, removeItem, isReady } = useCart();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition"
      >
        <ShoppingCart size={18} strokeWidth={1.6} />
        <span>Carrito</span>
        {isReady && count > 0 && (
          <span className="absolute -right-3 -top-3 flex h-4 w-4 items-center justify-center bg-[#d6b36a] text-[10px] font-semibold text-black">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-[320px] border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Tu carrito</p>
            <button type="button" onClick={() => setOpen(false)} className="text-neutral-600 transition hover:text-white">
              <X size={16} />
            </button>
          </div>

          {!isReady ? (
            <p className="text-sm text-neutral-600">Cargando...</p>
          ) : items.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-neutral-600">Tu carrito esta vacio.</p>
              <Link href="/products" onClick={() => setOpen(false)} className="mt-3 inline-block text-xs text-neutral-500 underline underline-offset-2 transition hover:text-neutral-300">
                Ver catalogo
              </Link>
            </div>
          ) : (
            <>
              <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-start justify-between gap-2 border-b border-white/[0.05] pb-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-600">{item.quantity} x ARS {money(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-neutral-300">ARS {money(item.price * item.quantity)}</span>
                      <button type="button" onClick={() => removeItem(item.product_id)} className="text-neutral-600 transition hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                <span className="text-xs text-neutral-500">Total</span>
                <span className="text-sm font-light text-white">ARS {money(total)}</span>
              </div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="mt-4 block bg-white px-5 py-2.5 text-center text-sm font-medium text-black transition hover:bg-[#d6b36a]">
                Ir a pagar
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="mt-2 block border border-white/[0.07] px-5 py-2 text-center text-xs text-neutral-500 transition hover:border-white/20 hover:text-neutral-300">
                Ver carrito completo
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
