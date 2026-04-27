"use client";

import { useEffect, useState } from "react";

export type CartItem = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
};

const STORAGE_KEY = "luminarg_cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Error leyendo carrito:", error);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error guardando carrito:", error);
    }
  }, [items, isReady]);

  function addItem(item: CartItem) {
    setItems((prev) => {
      const existing = prev.find(
        (cartItem) => cartItem.product_id === item.product_id
      );

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.product_id === item.product_id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + item.quantity,
              }
            : cartItem
        );
      }

      return [...prev, item];
    });
  }

  function removeItem(productId: number) {
    setItems((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const count = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    count,
    isReady,
  };
}