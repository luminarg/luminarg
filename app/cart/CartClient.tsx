"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

function money(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CartClient() {
  const { items, removeItem, updateQuantity, total, isReady } = useCart();

  return (
    <>
      <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
        Carrito
      </p>

      <h1 className="mt-3 text-4xl font-light">Tu selección</h1>

      {!isReady ? (
        <div className="mt-8 border border-white/10 bg-white/[0.03] p-8 text-neutral-400">
          Cargando carrito...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 border border-white/10 bg-white/[0.03] p-8">
          <p className="text-neutral-400">Tu carrito está vacío.</p>

          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.product_id}
                className="border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-light">{item.name}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      ARS {money(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.product_id, Number(e.target.value))
                      }
                      className="w-20 border border-white/10 bg-black px-3 py-2 text-center text-white"
                    />

                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      className="text-sm text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-light">Resumen</h2>

            <div className="mt-6 flex justify-between border-t border-white/10 pt-5 text-lg">
              <span>Total</span>
              <span>ARS {money(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-black"
            >
              Ir a pagar
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}