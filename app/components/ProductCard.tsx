import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/schemas";

type ProductCardProps = {
  product: Product;
  visiblePrice: number;
  isInternalView?: boolean;
  hrefBase?: string;
};

export default function ProductCard({
  product,
  visiblePrice,
  isInternalView = false,
  hrefBase = "/products",
}: ProductCardProps) {
  return (
    <Link
      href={`${hrefBase}/${product.slug}`}
      className="block overflow-hidden border border-white/[0.08] text-white transition hover:border-white/20"
    >
      {/* Imagen */}
      <div className="h-[220px] w-full overflow-hidden bg-black">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={500}
            height={300}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-neutral-600">
            Luminarg
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h4 className="font-light text-white">{product.name}</h4>

        <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
          {product.description}
        </p>

        <p className="mt-4 text-lg font-light text-white">
          ${visiblePrice.toLocaleString("es-AR")}
        </p>

        {isInternalView && (
          <div className="mt-3 space-y-0.5 text-xs text-neutral-600">
            <p>Stock: {product.stock}</p>
            <p>Estado: {product.status}</p>
            <p>Colección: {product.collection}</p>
          </div>
        )}

        <p className="mt-4 text-xs uppercase tracking-[0.15em] text-[#d6b36a]">
          {isInternalView ? "Editar producto" : "Ver producto"} →
        </p>
      </div>
    </Link>
  );
}
