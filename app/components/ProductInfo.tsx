import Link from "next/link";
import { Product } from "@/data/schemas";

type ProductInfoProps = {
  product: Product;
  visiblePrice: number;
  buttonLabel: string;
  buttonHref?: string;
};

const WHATSAPP_NUMBER = "543532468081";

export default function ProductInfo({
  product,
  visiblePrice,
  buttonLabel,
  buttonHref,
}: ProductInfoProps) {
  const whatsappMessage = encodeURIComponent(
    `Hola Luminarg, quiero consultar por el producto ${product.name} (${product.sku}).`
  );

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">
        {product.collection} · {product.type}
      </p>

      <h1 className="mt-4 text-4xl font-light md:text-5xl">
        {product.name}
      </h1>

      <p className="mt-6 text-lg leading-8 text-neutral-400">
        {product.longDescription}
      </p>

      <p className="mt-8 text-3xl font-medium">
        ${visiblePrice.toLocaleString("es-AR")}
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        {buttonHref ? (
          <Link
            href={buttonHref}
            className="rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-black"
          >
            {buttonLabel}
          </Link>
        ) : (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Comprar / Consultar
          </a>
        )}

        <a
          href={`mailto:info@luminarg.com.ar?subject=Consulta%20Luminarg`}
          className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
        >
          Enviar email
        </a>
      </div>
    </div>
  );
}