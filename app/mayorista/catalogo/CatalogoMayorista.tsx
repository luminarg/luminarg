"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useMayoristaCart } from "@/lib/useMayoristaCart";
import type { PriceTier } from "@/data/priceTierService";

type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  wholesalePrice: number;
  stock: number;
};

function money(n: number) {
  return `ARS ${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
}

export default function CatalogoMayorista({
  products,
  tiers,
}: {
  products: Product[];
  tiers: PriceTier[];
}) {
  const cart = useMayoristaCart(tiers);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="space-y-8">

      {/* Tramos vigentes */}
      <div className="border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Escala de precios por volumen</p>
        <div className="flex flex-wrap gap-3">
          {tiers.filter((t) => t.is_active).map((t) => (
            <div
              key={t.id}
              className={`border px-4 py-2 text-sm transition ${
                cart.activeTier?.id === t.id
                  ? "border-[#d6b36a]/50 bg-[#d6b36a]/10 text-[#d6b36a]"
                  : "border-white/[0.07] text-neutral-500"
              }`}
            >
              <span className="font-medium">
                {t.min_quantity}{t.max_quantity ? `–${t.max_quantity}` : "+"} ud.
              </span>
              <span className="ml-2">
                {t.discount_pct > 0 ? `-${t.discount_pct}%` : "Precio base"}
              </span>
            </div>
          ))}
        </div>
        {cart.unitsToNextTier && (
          <p className="mt-3 text-xs text-[#d6b36a]">
            Agregá {cart.unitsToNextTier} {cart.unitsToNextTier === 1 ? "unidad más" : "unidades más"} para desbloquear el siguiente tramo
            {cart.nextTier ? ` (-${cart.nextTier.discount_pct}%)` : ""}.
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

        {/* Productos */}
        <div className="space-y-3">
          {products.map((product) => {
            const inCart = cart.items.find((i) => i.product_id === product.id);
            const finalPrice = product.wholesalePrice * (1 - cart.discountPct / 100);

            return (
              <div
                key={product.id}
                className={`flex gap-4 border bg-white/[0.02] p-4 transition ${
                  inCart ? "border-[#d6b36a]/20" : "border-white/[0.07]"
                }`}
              >
                {/* Imagen */}
                <div className="h-16 w-16 shrink-0 overflow-hidden border border-white/[0.05] bg-black">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[8px] text-neutral-700">IMG</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-light text-white">{product.name}</p>
                  {product.sku && <p className="text-xs text-neutral-600">SKU: {product.sku}</p>}
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm text-white">{money(finalPrice)}</span>
                    {cart.discountPct > 0 && (
                      <>
                        <span className="text-xs text-neutral-600 line-through">{money(product.wholesalePrice)}</span>
                        <span className="text-xs text-[#d6b36a]">-{cart.discountPct}%</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600">Stock: {product.stock}</p>
                </div>

                {/* Agregar / cantidad */}
                <div className="flex shrink-0 items-center gap-2">
                  {inCart ? (
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(product.id, inCart.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center border border-white/[0.08] text-neutral-400 hover:text-white"
                      >−</button>
                      <span className="flex h-8 w-10 items-center justify-center border-y border-white/[0.08] text-sm">
                        {inCart.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(product.id, inCart.quantity + 1)}
                        disabled={inCart.quantity >= product.stock}
                        className="flex h-8 w-8 items-center justify-center border border-white/[0.08] text-neutral-400 hover:text-white disabled:opacity-30"
                      >+</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={() => cart.addItem({ product_id: product.id, name: product.name, base_price: product.wholesalePrice, quantity: 1 })}
                      className="border border-white/10 px-4 py-2 text-xs text-neutral-300 transition hover:border-white/30 hover:text-white disabled:opacity-30"
                    >
                      {product.stock <= 0 ? "Sin stock" : "Agregar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Carrito */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Tu pedido</p>
              <span className="text-xs text-neutral-600">{cart.totalQty} unidades</span>
            </div>

            {cart.items.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-600">Todavía no agregaste productos.</p>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex items-start justify-between gap-2 border-b border-white/[0.05] pb-3">
                      <div className="min-w-0">
                        <p className="text-xs text-white truncate">{item.name}</p>
                        <p className="text-xs text-neutral-600">{item.quantity} × {money(item.final_price)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-white">{money(item.subtotal)}</span>
                        <button type="button" onClick={() => cart.removeItem(item.product_id)} className="text-neutral-600 hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tramo activo */}
                {cart.activeTier && cart.discountPct > 0 && (
                  <div className="mt-3 border border-[#d6b36a]/20 bg-[#d6b36a]/[0.04] px-3 py-2 text-xs text-[#d6b36a]">
                    Tramo activo: {cart.activeTier.name} — {cart.discountPct}% de descuento
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                  <span className="text-sm text-neutral-400">Total</span>
                  <span className="text-lg font-light text-white">{money(cart.subtotal)}</span>
                </div>

                <a
                  href="/mayorista/checkout"
                  className="mt-4 block bg-white px-5 py-3 text-center text-sm font-medium text-black transition hover:bg-[#d6b36a]"
                >
                  Confirmar pedido
                </a>
              </>
            )}
          </div>

          {cart.unitsToNextTier && (
            <div className="border border-white/[0.05] p-3 text-xs text-neutral-500">
              Con {cart.unitsToNextTier} unidad{cart.unitsToNextTier !== 1 ? "es" : ""} más, pasás al tramo <span className="text-[#d6b36a]">{cart.nextTier?.name}</span> ({cart.nextTier?.discount_pct}% off).
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
