import { Separator } from "@/components/separator";
import { useUnitPresetRestock } from "@/features/restock/unit-preset-restock.query";
import { XIcon } from "@/icons";
import { useState } from "react";

interface RestockCardProp {
  onClick?: () => void;
  product: {
    product: {
      product_ID: number;
      product_Code: string;
      product_Name: string;
      desc: string;
      brand_ID: number;
      category_ID: number;
      created_At: string;
      updated_At: string;
    };
    variant: {
      variant_Name: string;
      created_At: string;
      updated_At: string;
    };
    brand: {
      brand_Name: string;
      created_At: string;
      updated_At: string;
    };
    unitPresets?: UnitPresets[];
  };
  onRemove?: () => void;
}

type UnitPresets = {
  assigned_At: string;
  preset: Preset;
  preset_ID: number;
  product_Preset_ID: number;
  low_Stock_Level?: number;
  very_Low_Stock_Level?: number;
};

type Preset = {
  created_At: string;
  main_Unit_ID: number;
  mainUnit: {
    uom_ID: number;
    unit_Name: string;
    abbreviation: string;
  };
  presetLevels: PresetLevel[];
  preset_ID: number;
  preset_Name: string;
  updated_At: string;
};

type PresetLevel = {
  conversion_Factor: number;
  created_At: string;
  level: number;
  level_ID: number;
  unitOfMeasure: UnitOfMeasure;
  uom_ID: number;
};

type UnitOfMeasure = {
  uom_ID: number;
  uom_Name: string;
  abbreviation: string;
};

export const RestockCard2 = ({ product, onRemove }: RestockCardProp) => {
  const { selectPreset, updateMainQuantity, updateLevelPricing } =
    useUnitPresetRestock();

  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [mainQuantity, setMainQuantity] = useState<number>(0);
  const [levelPrices, setLevelPrices] = useState<{ [level: number]: number }>(
    {}
  );

  console.log(product);

  const selectedPreset = product.unitPresets?.find(
    (p) => p.preset_ID === selectedPresetId
  );

  const handlePresetChange = (presetId: number) => {
    setSelectedPresetId(presetId);
    setMainQuantity(0);
    setLevelPrices({});
    selectPreset(product.product.product_ID, presetId);
  };

  const handleQuantityChange = (quantity: number) => {
    setMainQuantity(quantity);
    updateMainQuantity(product.product.product_ID, quantity);
  };

  const handlePriceChange = (level: number, price: number) => {
    setLevelPrices((prev) => ({ ...prev, [level]: price }));
    updateLevelPricing(product.product.product_ID, level, price);
  };

  return (
    <div className="p-5 border shadow-lg rounded-lg h-fit w-full max-w-120 text-xs">
      <div className="flex gap-2 items-center text-xs justify-between">
        <div>
          <span>{product.product.product_Name}</span>
          <span> - </span>
          <span>{product.brand.brand_Name}</span>
          <span> - </span>
          <span>{product.variant.variant_Name}</span>
        </div>

        <div
          className="cursor-pointer hover:bg-gray-200 rounded p-1"
          onClick={onRemove}
        >
          <XIcon />
        </div>
      </div>

      <Separator orientation="horizontal" />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Packaging Presets</label>
          <select
            className="input-style-3"
            value={selectedPresetId || ""}
            onChange={(e) => handlePresetChange(Number(e.target.value))}
          >
            <option value="">Select a preset</option>
            {product.unitPresets?.map((p) => (
              <option key={p.preset_ID} value={p.preset_ID}>
                {p.preset.presetLevels
                  .map((l) => l.unitOfMeasure.uom_Name)
                  .join(" → ")}
              </option>
            ))}
          </select>
        </div>

        {selectedPreset && (
          <>
            <Separator orientation="horizontal" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="text-nowrap font-semibold">
                  Add stock (
                  {selectedPreset.preset.presetLevels[0].unitOfMeasure.uom_Name}
                  )
                </label>
                <input
                  type="number"
                  className="input-style-3 w-full"
                  value={mainQuantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  min="0"
                />
              </div>

              <Separator orientation="horizontal" />

              <div className="flex flex-col gap-2">
                <label className="font-semibold">Pricing (per unit)</label>
                <div className="flex flex-col gap-1">
                  {selectedPreset.preset.presetLevels
                    .sort((a, b) => a.level - b.level)
                    .map((level) => (
                      <div
                        key={level.level_ID}
                        className="flex items-center gap-2"
                      >
                        <label className="w-20 text-xs uppercase">
                          {level.unitOfMeasure.uom_Name}
                        </label>
                        <input
                          type="number"
                          className="input-style-3 w-full"
                          value={levelPrices[level.level] || ""}
                          onChange={(e) =>
                            handlePriceChange(
                              level.level,
                              Number(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Separator orientation="horizontal" />
    </div>
  );
};
