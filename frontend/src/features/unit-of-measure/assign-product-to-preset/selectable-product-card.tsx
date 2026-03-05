import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { AlertCircle, CheckIcon } from "lucide-react";

interface SelectableProductCardProps {
  product: InventoryProductModel;
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

  const hasNoPresets = product.unitPresets.length === 0;

  return (
    <div
      className={`flex justify-between items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
        hasNoPresets
          ? "border-amber-300 bg-amber-50"
          : isSelected
            ? "bg-blue-50 border-blue-300"
            : "bg-white hover:bg-gray-50"
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
            <span className="text-saltbox-gray">{product.brand.brandName}</span>
            <span className="text-saltbox-gray">•</span>
            <span className="text-saltbox-gray">
              {product.variant.variant_Name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasNoPresets && (
              <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle size={12} /> Needs preset assignment
              </span>
            )}
            {isAlreadyAssigned && isSelected && !hasNoPresets && (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <CheckIcon size={12} /> Currently assigned
              </span>
            )}
            {!product.isComplete && !hasNoPresets && (
              <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                Incomplete Setup
              </span>
            )}
            {product.isComplete && !hasNoPresets && !isAlreadyAssigned && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckIcon size={12} />
                Complete Setup
              </span>
            )}
          </div>
        </div>
      </div>
      {/* <span className="text-xs text-saltbox-gray whitespace-nowrap">
        {product.restockInfo.length} batches
      </span> */}
    </div>
  );
};
