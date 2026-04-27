"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/useCart";

type AddToCartButtonProps = {
  productId: number;
  name: string;
  price: number;
  stock: number;
};

export default function AddToCartButton({
  productId,
  name,
  price,
  stock,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const disabled = stock <= 0;

  function handleAdd() {
    if (disabled) return;

    addItem({
      product_id: productId,
      name,
      price,
      quantity: 1,
    });

    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        {disabled ? "Sin stock" : added ? "Agregado al carrito" : "Agregar al carrito"}
      </button>

      <Link
        href="/cart"
        className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
      >
        Ver carrito
      </Link>
    </div>
  );
}