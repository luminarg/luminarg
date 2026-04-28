import Link from "next/link";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import { getFeaturedProducts } from "../data/productService";
import type { Metadata } from "next";
import {
  Package,
  Truck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Luminarg | Luminarias de diseño",
  description:
    "Luminarg ofrece luminarias decorativas y funcionales para hogares, comercios y proyectos.",
};


const WHATSAPP_NUMBER = "543532468081";
const EMAIL = "info@luminarg.com.ar";

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main className="bg-[#070707] text-white">
      

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Luminaria Luminarg"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-24">
          <div className="max-w-[640px]">
            <p className="text-sm uppercase tracking-[0.38em] text-[#d6b36a]">
              Luminarias de diseño
            </p>

            <h1 className="mt-7 text-5xl font-light leading-[1.05] tracking-[-0.04em] md:text-7xl">
              Iluminación que transforma espacios.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-300">
              Diseño, calidad y tecnología aplicados a hogares, comercios y proyectos de arquitectura interior.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/products"
                className="border border-white bg-white px-8 py-4 text-sm font-medium text-black transition hover:bg-transparent hover:text-white"
              >
                Ver catálogo
              </Link>

              <a
                href={whatsappLink("Hola Luminarg, quiero asesoramiento.")}
                target="_blank"
                className="border border-white/30 px-8 py-4 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                Consultar proyecto
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="border-y border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-[#d6b36a]">
              Por qué elegirnos
            </p>

            <h2 className="mt-5 text-3xl font-light md:text-5xl">
              Soluciones para proyectos, comercios y revendedores.
            </h2>

            <p className="mt-5 text-neutral-400">
              Trabajamos con foco en calidad, disponibilidad, logística y acompañamiento comercial.
            </p>
          </div>

          <div className="grid border-t border-white/10 md:grid-cols-4">
            <BenefitLine
              icon={<Package size={28} strokeWidth={1.5} />}
              title="Mayoristas"
              text="Distribuimos luminarias a revendedores, estudios, arquitectos e interioristas."
            />

            <BenefitLine
              icon={<Truck size={28} strokeWidth={1.5} />}
              title="Envíos nacionales"
              text="Realizamos envíos a todo el país con opciones logísticas según cada pedido."
            />

            <BenefitLine
              icon={<ShieldCheck size={28} strokeWidth={1.5} />}
              title="Calidad probada"
              text="Productos seleccionados y revisados para asegurar una experiencia confiable."
            />

            <BenefitLine
              icon={<Sparkles size={28} strokeWidth={1.5} />}
              title="Asesoramiento"
              text="Acompañamos la elección de productos según ambiente y proyecto."
            />
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex justify-between border-b border-white/10 pb-8">
          <h2 className="text-3xl font-light md:text-5xl">
            Productos destacados
          </h2>

          <Link
            href="/products"
            className="border border-white/30 px-6 py-3 text-sm transition hover:bg-white hover:text-black"
          >
            Ver catálogo
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              visiblePrice={product.retailPrice}
            />
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-light md:text-5xl">
              Empezá tu proyecto con Luminarg.
            </h2>

            <p className="mt-6 text-neutral-400">
              Consultanos por productos, stock, mayorista o automatización.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <a
              href={whatsappLink("Hola Luminarg")}
              target="_blank"
              className="border border-white bg-white px-8 py-4 text-black transition hover:bg-transparent hover:text-white"
            >
              WhatsApp
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="border border-white/30 px-8 py-4 transition hover:bg-white hover:text-black"
            >
              Email
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* BENEFIT LINE PRO */
function BenefitLine({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group border-b border-white/10 py-10 md:border-b-0 md:border-r md:px-8 md:last:border-r-0">
      <div className="mb-6 text-[#d6b36a] transition-transform duration-300 group-hover:translate-y-[-3px] group-hover:scale-110">
        {icon}
      </div>

      <h3 className="text-xl font-light text-white">{title}</h3>

      <p className="mt-4 text-sm leading-7 text-neutral-400">
        {text}
      </p>
    </div>
  );
}