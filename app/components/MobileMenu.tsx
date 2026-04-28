"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  isInternal?: boolean;
  isLoggedIn?: boolean;
};

export default function MobileMenu({
  isInternal = false,
  isLoggedIn = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-2xl text-white"
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-5 w-72 rounded-2xl border border-white/10 bg-[#070707] p-6 shadow-2xl">
          <div className="flex flex-col gap-4 text-sm text-neutral-300">
            <Link href="/" onClick={close}>Inicio</Link>
            <Link href="/products" onClick={close}>Catálogo</Link>
            <Link href="/cart" onClick={close}>Carrito</Link>

            {isLoggedIn && !isInternal ? (
              <Link href="/account" onClick={close}>Mi cuenta</Link>
            ) : null}

            {isLoggedIn && isInternal ? (
              <>
                <div className="h-px bg-white/10" />
                <Link href="/internal/dashboard" onClick={close}>Dashboard</Link>
                <Link href="/internal/products" onClick={close}>Productos</Link>
                <Link href="/internal/expenses" onClick={close}>Gastos</Link>
                <Link href="/internal/sales" onClick={close}>Ventas</Link>
                <Link href="/internal/users" onClick={close}>Usuarios</Link>
              </>
            ) : null}

            <div className="h-px bg-white/10" />

            {isLoggedIn ? (
              <Link href="/logout" onClick={close}>Salir</Link>
            ) : (
              <Link href="/login" onClick={close}>Ingresar</Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}