import { InvoiceItemsModel_2 } from "@/models/invoice-restockBatch.model";

interface ProductCardProps {
  onClick?: () => void;
  product: InvoiceItemsModel_2;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex justify-between bg-gray-bg rounded-lg py-2 px-2 text-xs items-center cursor-pointer hover:bg-gray-200"
        onClick={onClick}
      >
        <div className="grid gap-3 items-center">
          <span>{product.product.product_Name}</span>
          <span>{product.product.brand.brandName}</span>
          <span>{product.product.variant.variant_Name}</span>
        </div>
        <span>{product.restockBatch.batch_Number} batches</span>
      </div>
    </div>
  );
};
