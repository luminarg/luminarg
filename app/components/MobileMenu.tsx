"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type MobileMenuProps = {
  isInternal: boolean;
  isLoggedIn: boolean;
};

export default function MobileMenu({
  isInternal,
  isLoggedIn,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-white md:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={24} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#070707] text-white md:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src="/logo.png"
                alt="Luminarg"
                width={140}
                height={40}
                className="h-auto w-[120px]"
              />
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex flex-col border-b border-white/10 px-6 py-8 text-lg font-light">
            <MobileLink href="/" onClick={() => setOpen(false)}>
              Inicio
            </MobileLink>

            <MobileLink href="/products" onClick={() => setOpen(false)}>
              Catálogo
            </MobileLink>

            <MobileLink href="/#contacto" onClick={() => setOpen(false)}>
              Contacto
            </MobileLink>

            <MobileLink href="/#automation" onClick={() => setOpen(false)}>
              Automation
            </MobileLink>
          </nav>

          {isInternal && (
            <nav className="flex flex-col border-b border-white/10 px-6 py-8 text-lg font-light">
              <p className="mb-4 text-xs uppercase tracking-[0.28em] text-neutral-600">
                Interno
              </p>

              <MobileLink
                href="/internal/dashboard"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </MobileLink>

              <MobileLink
                href="/internal/products"
                onClick={() => setOpen(false)}
              >
                Productos
              </MobileLink>

              <MobileLink
                href="/internal/expenses"
                onClick={() => setOpen(false)}
              >
                Finanzas
              </MobileLink>

              <MobileLink
                href="/internal/users"
                onClick={() => setOpen(false)}
              >
                Usuarios
              </MobileLink>
            </nav>
          )}

          <div className="px-6 py-8">
            {isLoggedIn ? (
              <Link
                href="/logout"
                onClick={() => setOpen(false)}
                className="block border border-white/30 px-6 py-4 text-center text-sm uppercase tracking-[0.18em] text-white"
              >
                Salir
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block border border-white bg-white px-6 py-4 text-center text-sm uppercase tracking-[0.18em] text-black"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="border-t border-white/10 py-5 first:border-t-0"
    >
      {children}
    </Link>
  );
}