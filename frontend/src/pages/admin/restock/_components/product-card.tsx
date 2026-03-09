import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { InventoryBatchesModel } from "@/features/restock/models/inventory-batches.model";

interface ProductCardProps {
  onClick?: () => void;
  product: InventoryProductModel;
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
          <span>{product.brand.brandName}</span>
          <span>{product.variant.variant_Name}</span>
        </div>
        <HoverCard>
          <HoverCardTrigger>
            {product.unitPresets.length} Preset(s)
          </HoverCardTrigger>
          <HoverCardContent className="flex flex-col gap-2 w-fit ">
            {product.unitPresets.map((u, presetIdx) => (
              <div
                key={presetIdx}
                className="flex items-center gap-1 rounded-lg  p-2"
              >
                {product.product.quantity === 0 ? (
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                ) : product.product.quantity <= u.very_Low_Stock_Level! ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                ) : product.product.quantity <= u.low_Stock_Level! ? (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
                {u.preset.presetLevels.map((l, idx) => (
                  <div key={idx} className="flex gap-1 items-center">
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {l.unitOfMeasure.uom_Name} ({l.conversion_Factor}x)
                    </span>
                    {idx < u.preset.presetLevels.length - 1 && (
                      <span className="text-xs font-semibold whitespace-nowrap">
                        &gt;
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};
