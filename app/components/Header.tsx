import Link from "next/link";
import { getCurrentProfile, getCurrentUser } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import CartDropdown from "./CartDropdown";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  const isLoggedIn = Boolean(user);
  const isInternal = Boolean(profile && isInternalUser(profile.role));

  return (
    <header className="relative z-[9998] border-b border-white/10 bg-[#070707]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-xl font-light tracking-[0.35em]">
          LUMIN<span className="text-[#d6b36a]">A</span>RG
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
          <Link href="/">Inicio</Link>
          <Link href="/products">Catálogo</Link>

          {isLoggedIn && !isInternal && <Link href="/account">Mi cuenta</Link>}

          {isInternal && (
            <>
              <Link href="/internal/dashboard">Dashboard</Link>
              <Link href="/internal/products">Productos</Link>
              <Link href="/internal/expenses">Gastos</Link>
              <Link href="/internal/sales">Ventas</Link>
              <Link href="/internal/users">Usuarios</Link>
            </>
          )}

          <CartDropdown />

          {isLoggedIn ? (
            <Link href="/logout">Salir</Link>
          ) : (
            <Link href="/login">Ingresar</Link>
          )}
        </nav>

        <MobileMenu isInternal={isInternal} isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}