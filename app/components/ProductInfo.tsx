import Link from "next/link";
import { Product } from "@/data/schemas";
import AddToCartButton from "@/app/components/AddToCartButton";

type ProductInfoProps = {
  product: Product;
  visiblePrice: number;
  buttonLabel: string;
  buttonHref?: string;
};

export default function ProductInfo({
  product,
  visiblePrice,
  buttonLabel,
  buttonHref,
}: ProductInfoProps) {
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

      <div className="mt-10">
        {buttonHref ? (
          <Link
            href={buttonHref}
            className="rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-black"
          >
            {buttonLabel}
          </Link>
        ) : (
          <AddToCartButton
            productId={product.id}
            name={product.name}
            price={visiblePrice}
            stock={product.stock}
          />
        )}
      </div>
    </div>
  );
}