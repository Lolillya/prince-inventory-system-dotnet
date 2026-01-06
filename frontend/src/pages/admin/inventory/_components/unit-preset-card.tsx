import { UnitPresetLevel } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.model";
import { useState } from "react";

interface UnitPresetCardProps {
  unitPreset: UnitPresetLevel;
  handleAddProductsToPreset: () => void;
  isAddProductsToPresetOpen: boolean;
}

export const UnitPresetCard = ({
  unitPreset,
  handleAddProductsToPreset,
  isAddProductsToPresetOpen,
}: UnitPresetCardProps) => {
  const [isProductsShown, setIsProductsShown] = useState(false);

  const handleShowAssociatedProducts = () => {
    setIsProductsShown(!isProductsShown);
  };
  return (
    <div className="flex items-center justify-between p-2 bg-custom-gray rounded-lg flex-col gap-2">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-semibold text-saltbox-gray w-full">
          {unitPreset.main_Unit_Name}
        </span>
        <div className="w-full flex items-center gap-2">
          {unitPreset.levels.map((l, idx) => (
            <span className="text-sm font-semibold text-saltbox-gray" key={idx}>
              {l.uoM_Name} {idx < unitPreset.levels.length - 1 ? ">" : ""}
            </span>
          ))}
        </div>
        <span
          className="text-sm font-semibold text-saltbox-gray cursor-pointer hover:underline w-full"
          onClick={handleShowAssociatedProducts}
        >
          {unitPreset.product_Count} Products
        </span>

        <span
          className="text-sm font-semibold hover:underline cursor-pointer w-full"
          onClick={handleAddProductsToPreset}
        >
          {isAddProductsToPresetOpen ? "Close" : "Add"}
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
            <div className="flex gap-2 w-full text-sm text-saltbox-gray p-2 border rounded-lg inset-shadow-sm">
              <span>Product Name</span>
              <span>-</span>
              <span>Brand Name</span>
              <span>-</span>
              <span>Variant Name</span>
            </div>

            <div className="flex gap-2 w-full text-sm text-saltbox-gray p-2 border rounded-lg inset-shadow-sm">
              <span>Product Name</span>
              <span>-</span>
              <span>Brand Name</span>
              <span>-</span>
              <span>Variant Name</span>
            </div>

            <div className="flex gap-2 w-full text-sm text-saltbox-gray p-2 border rounded-lg inset-shadow-sm">
              <span>Product Name</span>
              <span>-</span>
              <span>Brand Name</span>
              <span>-</span>
              <span>Variant Name</span>
            </div>
          </div>
        ))}
    </div>
  );
};
