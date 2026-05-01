"use client";

import { useEffect, useState } from "react";
import type { PriceTier } from "@/data/priceTierService";

export type MayoristaCartItem = {
  product_id: number;
  name: string;
  base_price: number; // precio mayorista base SIN descuento
  quantity: number;
};

export type MayoristaCartItemResolved = MayoristaCartItem & {
  discount_pct: number;
  final_price: number;
  subtotal: number;
};

const STORAGE_KEY = "luminarg_mayorista_cart";

export function useMayoristaCart(tiers: PriceTier[]) {
  const [items, setItems] = useState<MayoristaCartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    finally { setIsReady(true); }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch {}
  }, [items, isReady]);

  // ─── Calcular tramo activo ────────────────────────────────────────────────
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  const activeTier = tiers
    .filter((t) => t.is_active && totalQty >= t.min_quantity)
    .sort((a, b) => b.min_quantity - a.min_quantity)[0] ?? null;

  const discountPct = activeTier?.discount_pct ?? 0;

  const resolvedItems: MayoristaCartItemResolved[] = items.map((item) => {
    const final_price = item.base_price * (1 - discountPct / 100);
    return {
      ...item,
      discount_pct: discountPct,
      final_price,
      subtotal: final_price * item.quantity,
    };
  });

  const subtotal = resolvedItems.reduce((s, i) => s + i.subtotal, 0);

  // Cuántas unidades faltan para el próximo tramo
  const nextTier = tiers
    .filter((t) => t.is_active && t.min_quantity > totalQty)
    .sort((a, b) => a.min_quantity - b.min_quantity)[0] ?? null;

  const unitsToNextTier = nextTier ? nextTier.min_quantity - totalQty : null;

  // ─── Acciones ─────────────────────────────────────────────────────────────

  function addItem(item: MayoristaCartItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }

  function removeItem(productId: number) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  }

  function clearCart() { setItems([]); }

  return {
    items: resolvedItems,
    rawItems: items,
    totalQty,
    activeTier,
    discountPct,
    subtotal,
    nextTier,
    unitsToNextTier,
    count: totalQty,
    isReady,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
