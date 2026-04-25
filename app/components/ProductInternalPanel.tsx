import { Product } from "@/data/schemas";

type ProductInternalPanelProps = {
  product: Product;
};

export default function ProductInternalPanel({
  product,
}: ProductInternalPanelProps) {
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-xl font-light">Vista interna</h2>

      <div className="mt-6 grid gap-4 text-sm text-neutral-300 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-neutral-500">Stock actual</p>
          <p className="mt-2 text-lg text-white">{product.stock}</p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-neutral-500">Estado</p>
          <p className="mt-2 text-lg text-white">{product.status}</p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-neutral-500">Precio minorista</p>
          <p className="mt-2 text-lg text-white">
            ${product.retailPrice.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-neutral-500">Precio mayorista</p>
          <p className="mt-2 text-lg text-white">
            ${product.wholesalePrice.toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </div>
  );
}