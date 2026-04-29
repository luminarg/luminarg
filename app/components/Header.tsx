import { headers } from "next/headers";
import Link from "next/link";
import CartDropdown from "./CartDropdown";
import MobileMenu from "./MobileMenu";
import { isInternalUser, type UserRole } from "@/data/roles";

export default async function Header() {
  const h = await headers();
  const userId = h.get("x-user-id");
  const role = h.get("x-user-role") as UserRole | null;

  const isLoggedIn = !!userId;
  const isInternal = role ? isInternalUser(role) : false;

  return (
    <header className="relative z-[9998] border-b border-white/10 bg-[#070707]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xl font-light tracking-[0.35em] text-white"
        >
          LUMIN<span className="text-[#d6b36a]">A</span>RG
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-neutral-400 lg:flex">
          <Link href="/">Inicio</Link>
          <Link href="/products">Catálogo</Link>
          <Link href="/cart">Carrito</Link>

          {isInternal ? (
            <>
              <Link href="/internal/dashboard">Dashboard</Link>
              <Link href="/internal/products">Productos</Link>
              <Link href="/internal/expenses">Gastos</Link>
              <Link href="/internal/sales">Ventas</Link>
              <Link href="/internal/users">Usuarios</Link>
            </>
          ) : null}

          {isLoggedIn && !isInternal ? (
            <Link href="/account" className="text-white">
              Mi cuenta
            </Link>
          ) : null}

          {isLoggedIn ? (
            <Link href="/logout" className="text-white">
              Salir
            </Link>
          ) : (
            <Link href="/login" className="text-white">
              Ingresar
            </Link>
          )}

          <CartDropdown />
        </nav>

        <div className="lg:hidden">
          <MobileMenu isLoggedIn={isLoggedIn} isInternal={isInternal} />
        </div>
      </div>
    </header>
  );
}