import { Separator } from "@/components/separator";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { useInvoicePayloadQuery } from "@/features/invoice/invoice-create-payload";
import { XIcon } from "@/icons";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface InvoiceCardProp {
  onClick?: () => void;
  product: InventoryProductModel;
  excludePresetIds?: number[];
  onRemove?: () => void;
}

enum DiscountEnum {
  MANUAL = "",
  PERCENTAGE = "%",
}

export const InvoiceCard = ({
  product,
  excludePresetIds = [],
  onRemove,
}: InvoiceCardProp) => {
  const productId = product.product.product_ID;
  const variantName = product.variant.variant_Name;
  const [discount, setDiscount] = useState<DiscountEnum>(DiscountEnum.MANUAL);
  const [isSupplierPriceSelected, setIsSupplierPriceSelected] =
    useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isSupplementPresetChecked, setIsSupplementPresetChecked] =
    useState<boolean>(false);
  const [selectedSupplementPresetIds, setSelectedSupplementPresetIds] =
    useState<number[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [selectedUnitLevel, setSelectedUnitLevel] = useState<number>(1);
  const {
    UPDATE_INVOICE_PAYLOAD_PRESET,
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS,
    UPDATE_INVOICE_PAYLOAD_UNIT,
    UPDATE_INVOICE_PAYLOAD_PRICE,
    UPDATE_INVOICE_PAYLOAD_DISCOUNT,
    UPDATE_INVOICE_PAYLOAD_QUANTITY,
    UPDATE_INVOICE_PAYLOAD_TOTAL,
    UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE,
  } = useInvoicePayloadQuery();

  console.log(product);

  const selectedPreset = product.unitPresets?.find(
    (p) => p.preset_ID === selectedPresetId,
  );

  // Helper function to get supplier price from presetPricing based on unit level
  const getSupplierPrice = (): number => {
    if (!selectedPreset) return 0;
    const presetPricing = (selectedPreset as any).presetPricing;
    if (!presetPricing) return 0;

    const pricingForLevel = presetPricing.find(
      (p: any) => p.level === selectedUnitLevel,
    );
    return pricingForLevel?.price_Per_Unit || 0;
  };

  const getStockIndicator = (preset: (typeof product.unitPresets)[0]) => {
    const presetQuantity = preset.main_Unit_Quantity ?? 0;

    if (presetQuantity === 0) {
      return "⚫"; // Gray indicator (no stock)
    } else if (presetQuantity <= preset.very_Low_Stock_Level!) {
      return "🔴"; // Red indicator (very low stock)
    } else if (presetQuantity <= preset.low_Stock_Level!) {
      return "🟡"; // Yellow indicator (low stock)
    } else {
      return "🟢"; // Green indicator (adequate stock)
    }
  };

  const handlePresetChange = (presetId: number) => {
    setSelectedPresetId(presetId);
    UPDATE_INVOICE_PAYLOAD_PRESET(productId, variantName, presetId);
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(productId, variantName, []);
    setQuantity(0);
    setIsSupplementPresetChecked(false);
    setSelectedSupplementPresetIds([]);
    setSelectedUnitLevel(1); // Reset to first unit level
    // Price will update via useEffect
  };

  const handleUnitLevelChange = (levelNumber: number) => {
    setSelectedUnitLevel(levelNumber);
    setIsSupplementPresetChecked(false);
    setSelectedSupplementPresetIds([]);
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(productId, variantName, []);
  };

  // Calculate subtotal and apply discount
  const calculateTotal = (): number => {
    const subtotal = quantity * price;

    if (discount === DiscountEnum.PERCENTAGE) {
      // Apply percentage discount
      const discountAmount = subtotal * (discountValue / 100);
      return subtotal - discountAmount;
    } else {
      // Apply manual discount
      return Math.max(0, subtotal - discountValue);
    }
  };

  const calculateDeficit = (): number => {
    const availableStockInSelectedUnit = calculateAvailableStock();
    return Math.max(0, quantity - availableStockInSelectedUnit);
  };

  const calculateAvailableStock = () => {
    if (!selectedPreset) return 0;

    const presetQuantities = (selectedPreset as any).presetQuantities as
      | Array<{ level: number; remaining_Quantity?: number }>
      | undefined;

    if (presetQuantities?.length) {
      const levelOneQuantity =
        presetQuantities.find((q) => q.level === 1)?.remaining_Quantity ?? 0;

      const presetLevels = [...selectedPreset.preset.presetLevels].sort(
        (a, b) => a.level - b.level,
      );

      let availableStock = levelOneQuantity;

      for (const level of presetLevels) {
        if (level.level === 1) continue;
        if (level.level > selectedUnitLevel) break;

        availableStock *= level.conversion_Factor;
      }

      return Math.floor(availableStock);
    }

    const presetLevels = [...selectedPreset.preset.presetLevels].sort(
      (a, b) => a.level - b.level,
    );

    let availableStock = product.product.quantity ?? 0;

    for (const level of presetLevels) {
      if (level.level === 1) continue;
      if (level.level > selectedUnitLevel) break;

      availableStock *= level.conversion_Factor;
    }

    return Math.floor(availableStock);
  };

  const getCompatiblePresetsWithStock = () => {
    if (!selectedPreset) return [];

    const selectedLevelMeta = selectedPreset.preset.presetLevels.find(
      (level) => level.level === selectedUnitLevel,
    );

    if (!selectedLevelMeta) return [];

    const targetUomId = selectedLevelMeta.uoM_ID;

    return (product.unitPresets ?? [])
      .filter(
        (otherPreset) => otherPreset.preset_ID !== selectedPreset.preset_ID,
      )
      .map((otherPreset) => {
        const sortedLevels = [...otherPreset.preset.presetLevels].sort(
          (a, b) => a.level - b.level,
        );

        const targetLevel = sortedLevels.find(
          (level) => level.uoM_ID === targetUomId,
        );

        if (!targetLevel) return null;

        const presetQuantities = (otherPreset as any).presetQuantities as
          | Array<{ level: number; remaining_Quantity?: number }>
          | undefined;

        const levelOneQuantity =
          presetQuantities?.find((q) => q.level === 1)?.remaining_Quantity ?? 0;

        if (levelOneQuantity <= 0) return null;

        let availableInTargetUnit = levelOneQuantity;

        for (const level of sortedLevels) {
          if (level.level === 1) continue;
          if (level.level > targetLevel.level) break;

          availableInTargetUnit *= level.conversion_Factor;
        }

        return {
          presetId: otherPreset.preset_ID,
          path: sortedLevels
            .map((level) => level.unitOfMeasure.uom_Name)
            .join(" > "),
          unitName: targetLevel.unitOfMeasure.uom_Name,
          availableStock: Math.floor(availableInTargetUnit),
        };
      })
      .filter(
        (
          preset,
        ): preset is {
          presetId: number;
          path: string;
          unitName: string;
          availableStock: number;
        } => preset !== null,
      );
  };

  const compatiblePresetsWithStock = getCompatiblePresetsWithStock();

  // const findAvailablePresetQuantity = () => {
  //   if (!selectedPreset) return 0;

  //   const selectedLevelMeta = selectedPreset.preset.presetLevels.find(
  //     (level) => level.level === selectedUnitLevel,
  //   );

  //   if (!selectedLevelMeta) return 0;

  //   const targetUomId = selectedLevelMeta.uoM_ID;
  //   let totalAvailable = 0;

  //   for (const otherPreset of product.unitPresets ?? []) {
  //     if (otherPreset.preset_ID === selectedPreset.preset_ID) continue;

  //     const sortedLevels = [...otherPreset.preset.presetLevels].sort(
  //       (a, b) => a.level - b.level,
  //     );

  //     const targetLevel = sortedLevels.find(
  //       (level) => level.uoM_ID === targetUomId,
  //     );

  //     if (!targetLevel) continue;

  //     const presetQuantities = (otherPreset as any).presetQuantities as
  //       | Array<{ level: number; remaining_Quantity?: number }>
  //       | undefined;

  //     if (!presetQuantities?.length) continue;

  //     const levelOneQuantity =
  //       presetQuantities.find((q) => q.level === 1)?.remaining_Quantity ?? 0;

  //     if (levelOneQuantity <= 0) continue;

  //     let availableInTargetUnit = levelOneQuantity;

  //     for (const level of sortedLevels) {
  //       if (level.level === 1) continue;
  //       if (level.level > targetLevel.level) break;

  //       availableInTargetUnit *= level.conversion_Factor;
  //     }

  //     totalAvailable += Math.floor(availableInTargetUnit);
  //   }

  //   return totalAvailable;
  // };

  const findAvailablePreset = () => {
    return compatiblePresetsWithStock.length;
  };

  // Initialize state from product if it has selectedPreset
  useEffect(() => {
    const typedProduct = product as any;
    if (typedProduct.selectedPreset) {
      setSelectedPresetId(typedProduct.selectedPreset.preset_ID);
      UPDATE_INVOICE_PAYLOAD_PRESET(
        productId,
        variantName,
        typedProduct.selectedPreset.preset_ID,
      );
      UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(productId, variantName, []);
      setQuantity(typedProduct.selectedPreset.main_Unit_Quantity || 0);
    }
  }, [
    product,
    productId,
    variantName,
    UPDATE_INVOICE_PAYLOAD_PRESET,
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS,
  ]);

  useEffect(() => {
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(
      productId,
      variantName,
      selectedSupplementPresetIds,
    );
  }, [
    productId,
    variantName,
    selectedSupplementPresetIds,
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS,
  ]);

  // Update price when preset changes, unit level changes, or when switching to supplier price mode
  useEffect(() => {
    if (selectedPreset && isSupplierPriceSelected) {
      const supplierPrice = getSupplierPrice();
      setPrice(supplierPrice);
    }
  }, [selectedPreset, selectedUnitLevel, isSupplierPriceSelected]);

  useEffect(() => {
    if (!selectedPreset) return;

    const unitLevel = selectedPreset.preset.presetLevels.find(
      (level) => level.level === selectedUnitLevel,
    );

    if (!unitLevel) return;

    UPDATE_INVOICE_PAYLOAD_UNIT(
      productId,
      variantName,
      unitLevel.unitOfMeasure.uom_Name,
      unitLevel.uoM_ID,
    );
  }, [
    productId,
    variantName,
    selectedPreset,
    selectedUnitLevel,
    UPDATE_INVOICE_PAYLOAD_UNIT,
  ]);

  useEffect(() => {
    UPDATE_INVOICE_PAYLOAD_QUANTITY(productId, variantName, quantity);
  }, [productId, variantName, quantity, UPDATE_INVOICE_PAYLOAD_QUANTITY]);

  useEffect(() => {
    UPDATE_INVOICE_PAYLOAD_PRICE(productId, variantName, price);
  }, [productId, variantName, price, UPDATE_INVOICE_PAYLOAD_PRICE]);

  useEffect(() => {
    UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE(discount === DiscountEnum.PERCENTAGE);
  }, [discount, UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE]);

  useEffect(() => {
    UPDATE_INVOICE_PAYLOAD_DISCOUNT(productId, variantName, discountValue);
  }, [productId, variantName, discountValue, UPDATE_INVOICE_PAYLOAD_DISCOUNT]);

  useEffect(() => {
    UPDATE_INVOICE_PAYLOAD_TOTAL(productId, variantName, calculateTotal());
  }, [
    productId,
    variantName,
    quantity,
    price,
    discount,
    discountValue,
    UPDATE_INVOICE_PAYLOAD_TOTAL,
  ]);

  return (
    <div className="p-5 border shadow-lg rounded-lg h-fit w-full max-w-120 text-xs">
      <div className="flex gap-2 items-center text-xs justify-between">
        <div className="flex gap-2 items-center">
          <div>
            <span>{product.product.product_Name}</span>
            <span> - </span>
            <span>{product.brand.brandName}</span>
            <span> - </span>
            <span>{product.variant.variant_Name}</span>
          </div>
        </div>
        <div
          onClick={onRemove}
          className="cursor-pointer hover:bg-gray-200 rounded p-1"
        >
          <XIcon />
        </div>
      </div>

      <Separator orientation="horizontal" />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Packaging Presets</label>
          <select
            value={selectedPresetId || ""}
            onChange={(e) => handlePresetChange(Number(e.target.value))}
          >
            <option value="">Select a preset</option>
            {product.unitPresets
              ?.filter((p) => !excludePresetIds.includes(p.preset_ID))
              .map((p) => (
                <option key={p.preset_ID} value={p.preset_ID}>
                  {getStockIndicator(p)}{" "}
                  {p.preset.presetLevels
                    .map(
                      (l) =>
                        l.unitOfMeasure.uom_Name +
                        " (" +
                        l.conversion_Factor +
                        "x)",
                    )
                    .join(" → ")}
                </option>
              ))}
          </select>
        </div>

        {selectedPreset && (
          <>
            <Separator orientation="horizontal" />

            <div className="flex flex-col w-full gap-2">
              <label>quantity & unit</label>
              <div className="flex">
                <div className="relative w-full flex items-center justify-center">
                  <input
                    // type="number"
                    className="drop-shadow-none rounded-r-none  bg-custom-gray w-full"
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        const newQuantity = Number(value);
                        setQuantity(newQuantity);
                      }
                    }}
                    min="0"
                  />
                  <label className="absolute right-2 text-vesper-gray text-xs">
                    Available: {calculateAvailableStock()}{" "}
                  </label>
                </div>
                <select
                  className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6 outline:none"
                  value={selectedUnitLevel}
                  onChange={(e) =>
                    handleUnitLevelChange(Number(e.target.value))
                  }
                >
                  {selectedPreset.preset.presetLevels.map((level) => (
                    <option key={level.level_ID} value={level.level}>
                      {level.unitOfMeasure.uom_Name}
                    </option>
                  ))}
                </select>
              </div>

              {quantity > calculateAvailableStock() && (
                <div className="flex flex-col text-red-400">
                  <div className="flex gap-2 items-center">
                    <CircleAlert className="text-red-400" size={18} />
                    <label className="text-red-400 font-semibold">
                      Insufficient Stock
                    </label>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={isSupplementPresetChecked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setIsSupplementPresetChecked(isChecked);
                          if (!isChecked) {
                            setSelectedSupplementPresetIds([]);
                          }
                        }}
                        disabled={findAvailablePreset() === 0}
                      />
                      <label className="text-red-400">
                        Supplement from compatible packaging preset (
                        {findAvailablePreset()} available)
                      </label>
                    </div>

                    {isSupplementPresetChecked && (
                      <div className="pl-6 flex flex-col gap-1">
                        {compatiblePresetsWithStock.map((preset) => (
                          <div
                            key={preset.presetId}
                            className="flex gap-2 items-center"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSupplementPresetIds.includes(
                                preset.presetId,
                              )}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedSupplementPresetIds((prev) => {
                                  if (isChecked) {
                                    return prev.includes(preset.presetId)
                                      ? prev
                                      : [...prev, preset.presetId];
                                  }

                                  return prev.filter(
                                    (id) => id !== preset.presetId,
                                  );
                                });
                              }}
                            />
                            <div className="flex gap-2 items-center">
                              <span>{preset.path}</span>
                              <span>-</span>
                              <span>
                                {preset.availableStock} {preset.unitName}{" "}
                                available
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input type="checkbox" />
                    <label className="text-red-400">
                      Automatically replenish deficit
                    </label>
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="text-red-400">Deficit: </label>
                    <span className="text-red-400">
                      {calculateDeficit()}{" "}
                      {
                        selectedPreset?.preset.presetLevels.find(
                          (l) => l.level === selectedUnitLevel,
                        )?.unitOfMeasure.uom_Name
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span>pricing</span>
              <div className="flex flex-col gap-2">
                <div className="flex">
                  <input
                    className="drop-shadow-none rounded-r-none  bg-custom-gray w-full"
                    disabled={isSupplierPriceSelected}
                    value={price || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        const newPrice = Number(value);
                        setPrice(newPrice);
                      }
                    }}
                  />
                  <select
                    className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                    value={isSupplierPriceSelected ? "supplier" : "manual"}
                    onChange={(e) => {
                      const isSupplier = e.target.value === "supplier";
                      setIsSupplierPriceSelected(isSupplier);
                    }}
                  >
                    <option value="supplier">Supplier Price</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span>discount</span>
              <div className="flex flex-col gap-2">
                <div className="flex">
                  <input
                    className="drop-shadow-none rounded-r-none bg-custom-gray w-full"
                    value={discountValue || 0}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setDiscountValue(Number(value));
                      }
                    }}
                  />
                  <select
                    className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(e.target.value as DiscountEnum)
                    }
                  >
                    <option value={DiscountEnum.PERCENTAGE}>
                      Percentage (%)
                    </option>
                    <option value={DiscountEnum.MANUAL}>Manual</option>
                  </select>
                </div>
              </div>
            </div>

            <Separator orientation="horizontal" />

            <div className="flex gap-2 items-center">
              <span>total:</span>
              <input
                className="shadow-none drop-shadow-none bg-custom-gray w-full"
                disabled
                value={calculateTotal().toFixed(2)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
