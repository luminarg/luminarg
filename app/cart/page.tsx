"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

export default function CartPage() {
  const { items, removeItem, total } = useCart();

  return (
    <main className="p-10 text-white">
      <h1 className="text-3xl mb-6">Carrito</h1>

      {items.length === 0 ? (
        <p>Carrito vacío</p>
      ) : (
        <>
          {items.map(i => (
            <div key={i.product_id} className="mb-4">
              {i.name} x{i.quantity} - ${i.price}
              <button onClick={() => removeItem(i.product_id)}>
                eliminar
              </button>
            </div>
          ))}

          <p>Total: ${total}</p>

          <Link href="/checkout">
            Ir a checkout
          </Link>
        </>
      )}
    </main>
  );
}