import Link from "next/link";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#050505] px-5 py-6 lg:block">
          <div className="mb-10">
            <Link
              href="/internal/dashboard"
              className="block text-xl font-semibold tracking-tight"
            >
              Luminarg Admin
            </Link>
            <p className="mt-1 text-xs text-neutral-500">
              Gestión interna
            </p>
          </div>

          <nav className="space-y-6 text-sm">
            <div>
              <p className="mb-2 px-3 text-xs uppercase tracking-[0.2em] text-neutral-600">
                Inicio
              </p>

              <div className="space-y-1">
                <NavItem href="/internal/dashboard">
                  Dashboard
                </NavItem>
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-xs uppercase tracking-[0.2em] text-neutral-600">
                Productos
              </p>

              <div className="space-y-1">
                <NavItem href="/internal/products">
                  Listado productos
                </NavItem>

                <NavItem href="/internal/products/new">
                  Nuevo producto
                </NavItem>
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-xs uppercase tracking-[0.2em] text-neutral-600">
                Finanzas
              </p>

              <div className="space-y-1">
                <NavItem href="/internal/expenses">
                  Gastos
                </NavItem>

                <NavItem href="/internal/sales">
                  Ventas
                </NavItem>
              </div>
            </div>

            <div>
              <p className="mb-2 px-3 text-xs uppercase tracking-[0.2em] text-neutral-600">
                Usuarios
              </p>

              <div className="space-y-1">
                <NavItem href="/internal/users">
                  Gestión usuarios
                </NavItem>
              </div>
            </div>
          </nav>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#050505]/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/internal/dashboard"
              className="text-sm font-semibold"
            >
              Luminarg Admin
            </Link>

            <div className="flex gap-2 overflow-x-auto text-xs">
              <Link
                href="/internal/dashboard"
                className="rounded-full border border-white/10 px-3 py-1 text-neutral-300"
              >
                Dash
              </Link>

              <Link
                href="/internal/products"
                className="rounded-full border border-white/10 px-3 py-1 text-neutral-300"
              >
                Prod.
              </Link>

              <Link
                href="/internal/expenses"
                className="rounded-full border border-white/10 px-3 py-1 text-neutral-300"
              >
                Gastos
              </Link>

              <Link
                href="/internal/sales"
                className="rounded-full border border-white/10 px-3 py-1 text-neutral-300"
              >
                Ventas
              </Link>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-10 lg:pt-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2 text-neutral-300 transition hover:bg-white/[0.06] hover:text-white"
    >
      {children}
    </Link>
  );
}