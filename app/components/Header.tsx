import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import CartDropdown from "./CartDropdown";
import MobileMenu from "./MobileMenu";
import { isInternalUser, type UserRole } from "@/data/roles";
import { logoutAction } from "@/app/logout/actions";

export default async function Header() {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  // En páginas internas no mostramos el Header público
  if (pathname.startsWith("/internal")) {
    return null;
  }

  const userId = h.get("x-user-id");
  const role = h.get("x-user-role") as UserRole | null;

  const isLoggedIn = !!userId;
  const isInternal = role ? isInternalUser(role) : false;

  return (
    <header className="relative z-[9998] border-b border-white/10 bg-[#070707]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Luminarg"
            width={182}
            height={44}
            className="h-11 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-neutral-400 lg:flex">
          <Link href="/" className="transition hover:text-white">
            Inicio
          </Link>
          <Link href="/products" className="transition hover:text-white">
            Catálogo
          </Link>
          <Link href="/cart" className="transition hover:text-white">
            Carrito
          </Link>

          {isInternal && (
            <>
              <Link href="/internal/dashboard" className="transition hover:text-white">
                Dashboard
              </Link>
              <Link href="/internal/products" className="transition hover:text-white">
                Productos
              </Link>
              <Link href="/internal/expenses" className="transition hover:text-white">
                Gastos
              </Link>
              <Link href="/internal/sales" className="transition hover:text-white">
                Ventas
              </Link>
            </>
          )}

          {isLoggedIn && !isInternal && (
            <Link href="/account" className="text-white transition hover:text-neutral-300">
              Mi cuenta
            </Link>
          )}

          {isLoggedIn ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-white transition hover:text-neutral-300"
              >
                Salir
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="border border-white/20 px-4 py-2 text-white transition hover:border-white/50 hover:bg-white/5"
            >
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
