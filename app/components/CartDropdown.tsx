"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/useCart";

function money(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CartDropdown() {
  const [open, setOpen] = useState(false);
  const { items, total, count, removeItem, isReady } = useCart();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex items-center gap-2 text-sm text-neutral-300 hover:text-white"
      >
        <ShoppingCart size={18} strokeWidth={1.6} />
        <span>Carrito</span>

        {isReady && count > 0 && (
          <span className="absolute -right-3 -top-3 rounded-full bg-[#d6b36a] px-1.5 py-0.5 text-[10px] font-semibold text-black">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-[340px] border border-white/10 bg-[#080808] p-4 text-white shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
              Tu carrito
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-neutral-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {!isReady ? (
            <p className="text-sm text-neutral-500">Cargando...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-neutral-500">Tu carrito está vacío.</p>
          ) : (
            <>
              <div className="max-h-[280px] space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="border-b border-white/10 pb-3"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm text-neutral-300">
                        ARS {money(item.price * item.quantity)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      className="mt-2 text-xs text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-neutral-400">Total</span>
                <span>ARS {money(total)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-black"
              >
                Ir a pagar
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}