import { InvoiceRestockBatchModel } from "@/features/invoice/models/invoice-restock-batch.model";

interface ProductCardProps {
  onClick?: () => void;
  data: InvoiceRestockBatchModel;
}

export const ProductCard = ({
  data,

  onClick,
}: ProductCardProps) => {
  // console.log("data", data);
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex justify-between bg-gray-bg rounded-lg py-2 px-2 text-xs items-center cursor-pointer hover:bg-gray-200"
        onClick={onClick}
      >
        <div className="grid gap-3 items-center">
          <span>{data.product.product_Name}</span>
          <span>{data.product.brand.brandName}</span>
          <span>{data.product.variant.variant_Name}</span>
        </div>
        <span>{data.batches.length} batches</span>
      </div>
    </div>
  );
};
