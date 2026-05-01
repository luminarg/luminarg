import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { getCurrentProfile } from "@/data/auth";
import { getMayoristaById } from "@/data/mayoristaService";

export default async function MayoristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "mayorista") redirect("/login");

  const mayorista = await getMayoristaById(profile.id);

  if (!mayorista || !mayorista.is_approved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707] px-4 text-white">
        <div className="max-w-md border border-white/[0.07] bg-white/[0.02] p-10 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Portal mayorista</p>
          <h1 className="mt-4 text-2xl font-light">Cuenta pendiente de aprobación</h1>
          <p className="mt-3 text-sm text-neutral-500">
            Tu cuenta mayorista está siendo revisada. Te contactaremos a la brevedad.
          </p>
        </div>
      </div>
    );
  }

  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";

  const nav = [
    { href: "/mayorista/catalogo", label: "Catálogo" },
    { href: "/mayorista/pedidos", label: "Mis pedidos" },
    { href: "/mayorista/cuenta", label: "Mi cuenta" },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.07] bg-[#070707]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/mayorista/catalogo">
              <Image src="/logo.png" alt="Luminarg" width={140} height={34} className="h-9 w-auto" priority />
            </Link>
            <span className="hidden border border-[#d6b36a]/30 bg-[#d6b36a]/10 px-2 py-0.5 text-xs text-[#d6b36a] sm:block">
              Portal Mayorista
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition ${
                  pathname.startsWith(href)
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {label}
              </Link>
            ))}
            <span className="hidden text-xs text-neutral-600 sm:block">
              {mayorista.company_name}
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}
