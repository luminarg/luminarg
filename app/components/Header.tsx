import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export default async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="text-xl font-light tracking-[0.35em]">
          LUMIN<span className="text-[#d6b36a]">A</span>RG
        </div>

        <nav className="hidden gap-8 text-sm text-neutral-400 md:flex">
          <Link href="/" className="hover:text-white">
            Inicio
          </Link>

          <Link href="/products" className="hover:text-white">
            Catálogo
          </Link>

    {profile && isInternalUser(profile.role) && (
  <>
    <Link href="/internal/products" className="hover:text-white">
      Gestión
    </Link>

    <Link href="/internal/users" className="hover:text-white">
      Usuarios
    </Link>
    <Link href="/internal/expenses" className="hover:text-white">
  Finanzas
</Link>
  </>
)}

          <Link href="#" className="hover:text-white">
            Automation
          </Link>

          <Link href="#" className="hover:text-white">
            Contacto
          </Link>

          {profile ? (
            <Link href="/logout" className="hover:text-white">
              Salir
            </Link>
          ) : (
            <Link href="/login" className="hover:text-white">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}