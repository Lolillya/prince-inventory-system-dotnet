import { InventoryBatchesModel } from "@/features/restock/models/inventory-batches.model";
import { CheckIcon } from "lucide-react";

interface SelectableProductCardProps {
  product: InventoryBatchesModel;
  isSelected: boolean;
  isAlreadyAssigned: boolean;
  onToggle: (productId: number) => void;
}

export const SelectableProductCard = ({
  product,
  isSelected,
  isAlreadyAssigned,
  onToggle,
}: SelectableProductCardProps) => {
  const handleClick = () => {
    onToggle(product.product.product_ID);
  };

  return (
    <div
      className={`flex justify-between items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
        isSelected ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 flex-1">
        <div className="relative">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-semibold">
              {product.product.product_Name}
            </span>
            <span className="text-saltbox-gray">•</span>
            <span className="text-saltbox-gray">
              {product.product.brand.brand_Name}
            </span>
            <span className="text-saltbox-gray">•</span>
            <span className="text-saltbox-gray">
              {product.product.variant.variant_Name}
            </span>
          </div>
          {isAlreadyAssigned && isSelected && (
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <CheckIcon size={12} /> Currently assigned
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-saltbox-gray whitespace-nowrap">
        {product.totalBatches} batches
      </span>
    </div>
  );
};
