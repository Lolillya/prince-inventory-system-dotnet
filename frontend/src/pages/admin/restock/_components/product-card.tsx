import { InventoryModel } from "@/features/inventory/models/inventory.model";

interface ProductCardProps {
  onClick?: () => void;
  product: InventoryModel;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex justify-between bg-gray-bg rounded-lg py-2 px-2 text-xs items-center cursor-pointer hover:bg-gray-200"
        onClick={onClick}
      >
        <div className="grid gap-3 items-center">
          <span>{product.product.productName}</span>
          <span>{product.brand.brandName}</span>
          <span>{product.variant.variantName}</span>
        </div>
        <span># batches</span>
      </div>
    </div>
  );
};
