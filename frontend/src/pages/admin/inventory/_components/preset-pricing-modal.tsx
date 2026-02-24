import { XIcon, PhilippinePeso } from "lucide-react";
import { useState, useEffect } from "react";
import { UnitPresetLevel } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.model";
import { InventoryBatchesModel } from "@/features/restock/models/inventory-batches.model";

interface PresetPricingModalProps {
  isOpen: boolean;
  preset: UnitPresetLevel | null;
  selectedProducts: InventoryBatchesModel[];
  onClose: () => void;
  onSubmit: (pricingData: ProductPricingData[]) => void;
}

export interface ProductPricingData {
  product_ID: number;
  unitPrices: {
    unitName: string;
    price: number;
  }[];
}

export const PresetPricingModal = ({
  isOpen,
  preset,
  selectedProducts,
  onClose,
  onSubmit,
}: PresetPricingModalProps) => {
  const [pricingData, setPricingData] = useState<
    Map<number, Map<string, string>>
  >(new Map());

  useEffect(() => {
    if (isOpen && preset && selectedProducts.length > 0) {
      // Initialize pricing data for all selected products
      const initialData = new Map<number, Map<string, string>>();
      selectedProducts.forEach((product) => {
        const productPrices = new Map<string, string>();
        preset.levels.forEach((level) => {
          productPrices.set(level.uoM_Name, "");
        });
        initialData.set(product.product.product_ID, productPrices);
      });
      setPricingData(initialData);
    }
  }, [isOpen, preset, selectedProducts]);

  const handlePriceChange = (
    productId: number,
    unitName: string,
    value: string,
  ) => {
    // Allow only numbers and decimal point
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setPricingData((prev) => {
      const newData = new Map(prev);
      const productPrices = new Map(newData.get(productId) || new Map());
      productPrices.set(unitName, value);
      newData.set(productId, productPrices);
      return newData;
    });
  };

  const handleSubmit = () => {
    const formattedData: ProductPricingData[] = [];

    pricingData.forEach((unitPrices, productId) => {
      const unitPricesArray: { unitName: string; price: number }[] = [];
      unitPrices.forEach((priceStr, unitName) => {
        const price = parseFloat(priceStr) || 0;
        unitPricesArray.push({ unitName, price });
      });
      formattedData.push({
        product_ID: productId,
        unitPrices: unitPricesArray,
      });
    });

    onSubmit(formattedData);
  };

  const isFormValid = () => {
    // Check if at least one price is entered for each product
    for (const [_, unitPrices] of pricingData) {
      let hasAtLeastOnePrice = false;
      for (const [_, price] of unitPrices) {
        if (price !== "" && parseFloat(price) > 0) {
          hasAtLeastOnePrice = true;
          break;
        }
      }
      if (!hasAtLeastOnePrice) return false;
    }
    return true;
  };

  if (!isOpen || !preset) return null;

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg border shadow-lg py-8 px-6 flex flex-col gap-5 max-h-[80vh] w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Set Unit Prices</h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <XIcon size={20} />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Set the price for each unit level in the preset:{" "}
          <span className="font-semibold">
            {preset.levels.map((l) => l.uoM_Name).join(" > ")}
          </span>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto flex-1 pr-2">
          {selectedProducts.map((product) => (
            <div
              key={product.product.product_ID}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-sm">
                  {product.product.product_Name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{product.brand.brandName}</span>
                  <span>•</span>
                  <span>{product.variant.variant_Name}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {preset.levels.map((level, levelIdx) => (
                  <div
                    key={levelIdx}
                    className="flex items-center justify-between gap-3"
                  >
                    <label className="text-sm font-medium min-w-20">
                      {level.uoM_Name}
                      <span className="text-xs text-gray-500 ml-1">
                        ({level.conversion_Factor}x)
                      </span>
                    </label>
                    <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                      <div className="flex items-center border rounded-md overflow-hidden bg-white flex-1">
                        <div className="px-2 py-1.5 bg-gray-100 border-r">
                          <PhilippinePeso
                            width={14}
                            className="text-gray-600"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="0.00"
                          className="px-3 py-1.5 w-full outline-none text-sm"
                          value={
                            pricingData
                              .get(product.product.product_ID)
                              ?.get(level.uoM_Name) || ""
                          }
                          onChange={(e) =>
                            handlePriceChange(
                              product.product.product_ID,
                              level.uoM_Name,
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            className="w-full max-w-full"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Confirm & Assign
          </button>
          <button
            className="w-full max-w-full bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
