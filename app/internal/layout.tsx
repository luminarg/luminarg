import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Building2,
  UserCheck,
  Settings,
  Users,
  Store,
} from "lucide-react";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.07] bg-[#050505] lg:flex">
          <div className="border-b border-white/[0.07] px-5 py-5">
            <Link href="/internal/dashboard" className="block">
              <Image src="/logo.png" alt="Luminarg" width={130} height={32} className="h-7 w-auto" priority />
            </Link>
            <p className="mt-2.5 text-[9px] font-medium uppercase tracking-[0.3em] text-neutral-700">Panel interno</p>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
            <NavSection label="Inicio">
              <NavItem href="/internal/dashboard" icon={<LayoutDashboard size={14} />} pathname={pathname}>Dashboard</NavItem>
            </NavSection>

            <NavSection label="Productos">
              <NavItem href="/internal/products" icon={<Package size={14} />} pathname={pathname}>Listado</NavItem>
              <NavItem href="/internal/products/new" icon={<PackagePlus size={14} />} pathname={pathname}>Nuevo producto</NavItem>
            </NavSection>

            <NavSection label="Finanzas">
              <NavItem href="/internal/expenses" icon={<Receipt size={14} />} pathname={pathname}>Gastos</NavItem>
              <NavItem href="/internal/sales" icon={<ShoppingBag size={14} />} pathname={pathname}>Ventas</NavItem>
            </NavSection>

            <NavSection label="Compras">
              <NavItem href="/internal/purchases" icon={<ShoppingCart size={14} />} pathname={pathname}>Ordenes de compra</NavItem>
              <NavItem href="/internal/suppliers" icon={<Building2 size={14} />} pathname={pathname}>Proveedores</NavItem>
              <NavItem href="/internal/import-agents" icon={<UserCheck size={14} />} pathname={pathname}>Agentes</NavItem>
              <NavItem href="/internal/settings" icon={<Settings size={14} />} pathname={pathname}>Configuracion</NavItem>
            </NavSection>

            <NavSection label="Mayoristas">
              <NavItem href="/internal/mayoristas" icon={<Store size={14} />} pathname={pathname}>Clientes mayoristas</NavItem>
              <NavItem href="/internal/mayoristas/tiers" icon={<Receipt size={14} />} pathname={pathname}>Tramos de precio</NavItem>
            </NavSection>

            <NavSection label="Usuarios">
              <NavItem href="/internal/users" icon={<Users size={14} />} pathname={pathname}>Gestion usuarios</NavItem>
            </NavSection>
          </nav>

          <div className="border-t border-white/[0.07] px-3 py-3">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-neutral-700 transition hover:text-neutral-400">
              ← Volver al sitio
            </Link>
          </div>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.07] bg-[#050505]/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/internal/dashboard">
              <Image src="/logo.png" alt="Luminarg" width={90} height={22} className="h-5 w-auto" />
            </Link>
            <div className="flex gap-1.5 overflow-x-auto">
              {[
                { href: "/internal/dashboard", label: "Dash" },
                { href: "/internal/products", label: "Productos" },
                { href: "/internal/expenses", label: "Gastos" },
                { href: "/internal/sales", label: "Ventas" },
                { href: "/internal/purchases", label: "Compras" },
                { href: "/internal/mayoristas", label: "Mayoristas" },
                { href: "/internal/users", label: "Usuarios" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 border px-3 py-1 text-[11px] transition ${
                    pathname === href || pathname.startsWith(href + "/")
                      ? "border-[#d6b36a]/40 bg-[#d6b36a]/10 text-[#d6b36a]"
                      : "border-white/[0.08] text-neutral-500"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <main className="flex-1 overflow-x-hidden px-4 pb-10 pt-20 sm:px-6 lg:px-10 lg:pt-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-neutral-700">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavItem({
  href, icon, children, pathname,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  pathname: string;
}) {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
        isActive ? "bg-[#d6b36a]/[0.08] text-[#d6b36a]" : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200"
      }`}
    >
      {icon && <span className={`shrink-0 ${isActive ? "text-[#d6b36a]" : "text-neutral-700"}`}>{icon}</span>}
      <span className="truncate">{children}</span>
    </Link>
  );
}
