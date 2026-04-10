import { PhilippinePeso, XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";

type UnitPreset = InventoryProductModel["unitPresets"][number];

export interface ProductPackagingPricingData {
  preset_ID: number;
  unitPrices: { unitName: string; price: number }[];
}

interface ProductPackagingPricingModalProps {
  isOpen: boolean;
  product: InventoryProductModel | null;
  selectedPresets: UnitPreset[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: ProductPackagingPricingData[]) => void;
}

export const ProductPackagingPricingModal = ({
  isOpen,
  product,
  selectedPresets,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductPackagingPricingModalProps) => {
  const [pricingData, setPricingData] = useState<
    Map<number, Map<string, string>>
  >(new Map());

  useEffect(() => {
    if (!isOpen || selectedPresets.length === 0) return;

    const initialData = new Map<number, Map<string, string>>();
    selectedPresets.forEach((up) => {
      const unitPrices = new Map<string, string>();
      up.preset.presetLevels.forEach((level) => {
        const existing = up.presetPricing.find(
          (pp) =>
            pp.unitName.toLowerCase() ===
            level.unitOfMeasure.uom_Name.toLowerCase(),
        );
        unitPrices.set(
          level.unitOfMeasure.uom_Name,
          existing?.price_Per_Unit != null
            ? existing.price_Per_Unit.toString()
            : "",
        );
      });
      initialData.set(up.preset_ID, unitPrices);
    });
    setPricingData(initialData);
  }, [isOpen, selectedPresets]);

  const handlePriceChange = (
    presetId: number,
    unitName: string,
    value: string,
  ) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setPricingData((prev) => {
      const next = new Map(prev);
      const prices = new Map(next.get(presetId) ?? new Map());
      prices.set(unitName, value);
      next.set(presetId, prices);
      return next;
    });
  };

  const isFormValid = () => {
    if (pricingData.size === 0) return false;
    for (const [, unitPrices] of pricingData) {
      for (const [, price] of unitPrices) {
        if (price === "") return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    const result: ProductPackagingPricingData[] = [];
    pricingData.forEach((unitPrices, presetId) => {
      const unitPricesArray: { unitName: string; price: number }[] = [];
      unitPrices.forEach((priceStr, unitName) => {
        unitPricesArray.push({ unitName, price: parseFloat(priceStr) || 0 });
      });
      result.push({ preset_ID: presetId, unitPrices: unitPricesArray });
    });
    onSubmit(result);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg border shadow-lg py-8 px-6 flex flex-col gap-5 max-h-[80vh] w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Set Unit Prices</h2>
            <p className="text-sm text-gray-600">
              {product.product.product_Name} &middot; {product.brand.brandName}{" "}
              &middot; {product.variant.variant_Name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-1 rounded"
            disabled={isSubmitting}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Preset pricing cards */}
        <div className="flex flex-col gap-6 overflow-y-auto flex-1 pr-2">
          {selectedPresets.map((up) => (
            <div
              key={up.preset_ID}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-sm">
                  {up.preset.preset_Name}
                </h3>
                <p className="text-xs text-gray-500">
                  {up.preset.presetLevels
                    .map((l) => l.unitOfMeasure.uom_Name)
                    .join(" → ")}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {up.preset.presetLevels.map((level, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3"
                  >
                    <label className="text-sm font-medium min-w-24">
                      {level.unitOfMeasure.uom_Name}
                      <span className="text-xs text-gray-500 ml-1">
                        ({level.conversion_Factor}x)
                      </span>
                    </label>
                    <div className="flex items-center border rounded-md overflow-hidden bg-white flex-1 max-w-48">
                      <div className="px-2 py-1.5 bg-gray-100 border-r">
                        <PhilippinePeso width={14} className="text-gray-600" />
                      </div>
                      <input
                        type="text"
                        placeholder="0.00"
                        className="px-3 py-1.5 w-full outline-none text-sm"
                        value={
                          pricingData
                            .get(up.preset_ID)
                            ?.get(level.unitOfMeasure.uom_Name) ?? ""
                        }
                        onChange={(e) =>
                          handlePriceChange(
                            up.preset_ID,
                            level.unitOfMeasure.uom_Name,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            className="w-full max-w-full"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Confirm & Save"}
          </button>
          <button
            className="w-full max-w-full"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
