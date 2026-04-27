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

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-white"
      >
        ☰
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[9999] w-full bg-[#070707] border-t border-white/10">
          <div className="flex flex-col gap-4 p-6 text-sm text-neutral-300">
            <Link href="/" onClick={() => setOpen(false)}>
              Inicio
            </Link>

            <Link href="/products" onClick={() => setOpen(false)}>
              Catálogo
            </Link>

            {isLoggedIn && !isInternal && (
              <Link href="/account" onClick={() => setOpen(false)}>
                Mi cuenta
              </Link>
            )}

            {isInternal && (
              <>
                <Link href="/internal/dashboard">Dashboard</Link>
                <Link href="/internal/products">Productos</Link>
                <Link href="/internal/expenses">Gastos</Link>
                <Link href="/internal/sales">Ventas</Link>
                <Link href="/internal/users">Usuarios</Link>
              </>
            )}

            {isLoggedIn ? (
              <Link href="/logout">Salir</Link>
            ) : (
              <Link href="/login">Ingresar</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}