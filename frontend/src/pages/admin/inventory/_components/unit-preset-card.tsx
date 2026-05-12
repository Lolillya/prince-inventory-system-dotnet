import { Separator } from "@/components/separator";
import { UnitPresetLevel } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.model";
import { useState } from "react";

interface UnitPresetCardProps {
  unitPreset: UnitPresetLevel;
  handleAddProductsToPreset: (presetId?: number) => void;
  isAddProductsToPresetOpen: boolean;
  selectedPresetId: number | null;
}

export const UnitPresetCard = ({
  unitPreset,
  handleAddProductsToPreset,
  isAddProductsToPresetOpen,
  selectedPresetId,
}: UnitPresetCardProps) => {
  const [isProductsShown, setIsProductsShown] = useState(false);

  const handleShowAssociatedProducts = () => {
    setIsProductsShown(!isProductsShown);
  };

  const isThisPresetSelected =
    isAddProductsToPresetOpen && selectedPresetId === unitPreset.preset_ID;
  return (
    <div className="flex items-center justify-between p-3 bg-custom-gray rounded-lg flex-col gap-2">
      <div className="flex items-center justify-between w-full">
        <div className="w-2/12">
          <span className="text-sm rounded-md border-2 border-river-green font-semibold px-2 py-1 text-river-green">
            {unitPreset.preset_Code}
          </span>
        </div>
        <span className="text-sm font-semibold text-saltbox-gray w-2/12">
          {unitPreset.main_Unit_Name}
        </span>
        <div className="w-6/12 flex items-center gap-2 flex-wrap">
          {unitPreset.levels.map((l, idx) => (
            <span className="text-sm font-semibold text-saltbox-gray whitespace-nowrap" key={idx}>
              {idx > 0 && <span className="mx-1">&gt;</span>}
              {l.uoM_Name}
              {idx > 0 && (
                <span className="text-sm font-semibold text-saltbox-gray ml-1">
                  ({l.conversion_Factor}x)
                </span>
              )}
            </span>
          ))}
        </div>
        <span
          className="text-sm font-semibold text-saltbox-gray cursor-pointer hover:underline w-2/12 text-right"
          onClick={handleShowAssociatedProducts}
        >
          {unitPreset.product_Count} Products
        </span>
      </div>

      {isProductsShown &&
        (unitPreset.product_Count === 0 ? (
          <div className="w-full flex flex-col gap-2 p-2 border inset-shadow-sm rounded-lg">
            <span className="text-sm text-saltbox-gray">
              No products found.
            </span>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2 p-2">
            <Separator orientation="horizontal" />
            {unitPreset.products.map((p, i) => (
              <div
                className="flex gap-2 w-full text-sm text-saltbox-gray p-2 border rounded-lg inset-shadow-sm"
                key={i}
              >
                <span>{p.product_Name}</span>
                <span>-</span>
                <span>{p.brand_Name}</span>
                <span>-</span>
                <span>{p.variant_Name}</span>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};
