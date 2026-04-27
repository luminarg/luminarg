import Link from "next/link";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export default async function Header() {
  const profile = await getCurrentProfile();
  const isInternal = profile && isInternalUser(profile.role);

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="text-xl font-light tracking-[0.35em]">
          LUMIN<span className="text-[#d6b36a]">A</span>RG
        </div>

        <nav className="hidden gap-8 text-sm text-neutral-400 md:flex">
          <Link href="/">Inicio</Link>
          <Link href="/products">Catálogo</Link>

          {isInternal && (
            <>
              <Link href="/internal/dashboard">Dashboard</Link>
              <Link href="/internal/products">Productos</Link>
              <Link href="/internal/expenses">Gastos</Link>
              <Link href="/internal/users">Usuarios</Link>
            </>
          )}

          {profile ? (
            <Link href="/logout">Salir</Link>
          ) : (
            <Link href="/login">Ingresar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}