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
      className="block overflow-hidden rounded-2xl border border-white/10 text-white transition hover:border-white/30"
    >
      {/* IMAGEN */}
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

      {/* INFO */}
      <div className="p-6">
        <h4 className="text-lg">{product.name}</h4>

        <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
          {product.description}
        </p>

        <p className="mt-4 text-lg font-medium">
          ${visiblePrice.toLocaleString("es-AR")}
        </p>

        {isInternalView && (
          <div className="mt-4 space-y-1 text-xs text-neutral-500">
            <p>Stock: {product.stock}</p>
            <p>Estado: {product.status}</p>
            <p>Colección: {product.collection}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-[#d6b36a]">
          {isInternalView ? "Editar producto" : "Ver producto"}
        </p>
      </div>
    </Link>
  );
}