import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

          {/* Logo */}
          <div>
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Luminarg"
                width={120}
                height={29}
                className="h-7 w-auto opacity-70 transition hover:opacity-100"
              />
            </Link>
            <p className="mt-2 text-xs text-neutral-700">
              Luminarias de diseño
            </p>
          </div>

          {/* Links */}
          <nav className="flex gap-6 text-xs text-neutral-600">
            <Link href="/" className="transition hover:text-neutral-300">
              Inicio
            </Link>
            <Link href="/products" className="transition hover:text-neutral-300">
              Catálogo
            </Link>
            <Link href="/login" className="transition hover:text-neutral-300">
              Ingresar
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-neutral-700">
            © {new Date().getFullYear()} Luminarg
          </p>

        </div>
      </div>
    </footer>
  );
}
