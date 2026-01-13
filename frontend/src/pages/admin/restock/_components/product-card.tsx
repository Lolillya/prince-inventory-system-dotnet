import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InventoryBatchesModel } from "@/features/restock/models/inventory-batches.model";

interface ProductCardProps {
  onClick?: () => void;
  product: InventoryBatchesModel;
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
          <HoverCardContent className="flex items-center gap-1">
            {product.unitPresets.map((u) =>
              u.preset.presetLevels.map((l, idx) => (
                <div key={idx} className="flex gap-1 items-center">
                  <span className="text-xs font-semibold">
                    {l.conversion_Factor} {l.unitOfMeasure.uom_Name}
                  </span>
                  {idx < u.preset.presetLevels.length - 1 && (
                    <span className="text-xs font-semibold">&gt;</span>
                  )}
                </div>
              ))
            )}
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};
