import Link from "next/link";
import Image from "next/image";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const profile = await getCurrentProfile();
  const isInternal = profile ? isInternalUser(profile.role) : false;
  const isLoggedIn = Boolean(profile);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070707]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Luminarg"
            width={160}
            height={44}
            priority
            className="h-auto w-[130px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
          <Link href="/" className="hover:text-white">
            Inicio
          </Link>

          <Link href="/products" className="hover:text-white">
            Catálogo
          </Link>

          <Link href="/#automation" className="hover:text-white">
            Automation
          </Link>

          <Link href="/#contacto" className="hover:text-white">
            Contacto
          </Link>

          {isInternal && (
            <>
              <Link href="/internal/dashboard" className="hover:text-white">
                Dashboard
              </Link>

              <Link href="/internal/products" className="hover:text-white">
                Productos
              </Link>
            </>
          )}

          {isLoggedIn ? (
            <Link href="/logout" className="hover:text-white">
              Salir
            </Link>
          ) : (
            <Link href="/login" className="hover:text-white">
              Ingresar
            </Link>
          )}
        </nav>

        <MobileMenu isInternal={isInternal} isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}