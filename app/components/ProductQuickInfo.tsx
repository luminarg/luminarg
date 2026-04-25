import { Product } from "../../data/schemas";



type ProductQuickInfoProps = {
  product: Product;
  visiblePrice: number;
  priceLabel: string;
  showInternalData?: boolean;
};

export default function ProductQuickInfo({
  product,
  visiblePrice,
  priceLabel,
  showInternalData = false,
}: ProductQuickInfoProps) {
  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <h2 className="text-xl font-light">Ficha rápida</h2>

      <div className="mt-6 grid gap-4 text-sm text-neutral-300">
        <div className="flex justify-between border-b border-white/10 pb-3">
          <span>Tipo</span>
          <span>{product.type}</span>
        </div>

        <div className="flex justify-between border-b border-white/10 pb-3">
          <span>Colección</span>
          <span>{product.collection}</span>
        </div>

        <div className="flex justify-between border-b border-white/10 pb-3">
          <span>{priceLabel}</span>
          <span>${visiblePrice.toLocaleString("es-AR")}</span>
        </div>

        {showInternalData && (
          <>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span>Stock</span>
              <span>{product.stock}</span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-3">
              <span>Estado</span>
              <span>{product.status}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}