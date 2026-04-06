import { Separator } from "@/components/separator";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import {
  useInvoicePayloadQuery,
  useSelectedPayloadInvoiceQuery,
} from "@/features/invoice/invoice-create-payload";
import { XIcon } from "@/icons";
import { CircleAlert } from "lucide-react";
import { useState } from "react";

interface InvoiceCardProp {
  onClick?: () => void;
  product: InventoryProductModel;
  itemKey: string;
  excludePresetIds?: number[];
  onRemove?: () => void;
}

enum DiscountEnum {
  MANUAL = "",
  PERCENTAGE = "%",
}

export const InvoiceCard = ({
  product,
  itemKey,
  excludePresetIds = [],
  onRemove,
}: InvoiceCardProp) => {
  // ─── Single source of truth: read this card's state from the global store ──
  const { data: payloadData = [] } = useSelectedPayloadInvoiceQuery();
  const myPayload = payloadData.find(
    (p) => p.invoice.itemKey === itemKey,
  )?.invoice;

  // Derived values — no useState for anything tracked in the payload
  const selectedPresetId = myPayload?.preset_ID ?? null;
  const price = myPayload?.unit_price ?? 0;
  const quantity = myPayload?.unit_quantity ?? 0;
  const discountValue = myPayload?.discount ?? 0;
  const discount =
    (myPayload?.isDiscountPercentage ?? false)
      ? DiscountEnum.PERCENTAGE
      : DiscountEnum.MANUAL;
  const selectedSupplementPresetIds = myPayload?.supplement_Preset_IDs ?? [];
  const isAutoReplenish = myPayload?.auto_Replenish ?? false;

  // Pure UI state — not tracked in the invoice payload, no useEffect needed
  const [isSupplierPriceSelected, setIsSupplierPriceSelected] =
    useState<boolean>(true);
  const [isSupplementPresetChecked, setIsSupplementPresetChecked] =
    useState<boolean>(false);

  const {
    UPDATE_INVOICE_PAYLOAD_PRESET,
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS,
    UPDATE_INVOICE_PAYLOAD_UNIT,
    UPDATE_INVOICE_PAYLOAD_PRICE,
    UPDATE_INVOICE_PAYLOAD_DISCOUNT,
    UPDATE_INVOICE_PAYLOAD_QUANTITY,
    UPDATE_INVOICE_PAYLOAD_TOTAL,
    UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE,
    UPDATE_INVOICE_PAYLOAD_AUTO_REPLENISH,
  } = useInvoicePayloadQuery();

  const selectedPreset = product.unitPresets?.find(
    (p) => p.preset_ID === selectedPresetId,
  );

  // Derive the active unit level from the stored uom_ID
  const selectedUnitLevel =
    (myPayload?.uom_ID
      ? selectedPreset?.preset.presetLevels.find(
          (l) => l.uoM_ID === myPayload.uom_ID,
        )?.level
      : undefined) ?? 1;

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const getSupplierPrice = (
    preset = selectedPreset,
    level = selectedUnitLevel,
  ): number => {
    if (!preset) return 0;
    const presetPricing = (preset as any).presetPricing;
    if (!presetPricing) return 0;
    return (
      presetPricing.find((p: any) => p.level === level)?.price_Per_Unit ?? 0
    );
  };

  const calcTotal = (
    qty: number,
    p: number,
    dv: number,
    dt: DiscountEnum,
  ): number => {
    const subtotal = qty * p;
    if (dt === DiscountEnum.PERCENTAGE) return subtotal - subtotal * (dv / 100);
    return Math.max(0, subtotal - dv);
  };

  const getStockIndicator = (preset: (typeof product.unitPresets)[0]) => {
    const presetQuantity = preset.main_Unit_Quantity ?? 0;
    if (presetQuantity === 0) return "⚫";
    if (presetQuantity <= preset.very_Low_Stock_Level!) return "🔴";
    if (presetQuantity <= preset.low_Stock_Level!) return "🟡";
    return "🟢";
  };

  const calculateAvailableStock = (): number => {
    if (!selectedPreset) return 0;

    const presetQuantities = (selectedPreset as any).presetQuantities as
      | Array<{ level: number; remaining_Quantity?: number }>
      | undefined;

    const presetLevels = [...selectedPreset.preset.presetLevels].sort(
      (a, b) => a.level - b.level,
    );

    let stock = presetQuantities?.length
      ? (presetQuantities.find((q) => q.level === 1)?.remaining_Quantity ?? 0)
      : (product.product.quantity ?? 0);

    for (const level of presetLevels) {
      if (level.level === 1) continue;
      if (level.level > selectedUnitLevel) break;
      stock *= level.conversion_Factor;
    }
    return Math.floor(stock);
  };

  const calculateDeficit = (): number =>
    Math.max(0, quantity - calculateAvailableStock());

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

        let available = levelOneQuantity;
        for (const level of sortedLevels) {
          if (level.level === 1) continue;
          if (level.level > targetLevel.level) break;
          available *= level.conversion_Factor;
        }

        return {
          presetId: otherPreset.preset_ID,
          path: sortedLevels
            .map((level) => level.unitOfMeasure.uom_Name)
            .join(" > "),
          unitName: targetLevel.unitOfMeasure.uom_Name,
          availableStock: Math.floor(available),
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
  const findAvailablePreset = () => compatiblePresetsWithStock.length;

  // ─── Event handlers — direct payload updates, no useEffect ────────────────

  const handlePresetChange = (presetId: number) => {
    const newPreset = product.unitPresets?.find(
      (p) => p.preset_ID === presetId,
    );
    const level1 = newPreset?.preset.presetLevels.find((l) => l.level === 1);

    UPDATE_INVOICE_PAYLOAD_PRESET(itemKey, presetId);
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(itemKey, []);
    UPDATE_INVOICE_PAYLOAD_QUANTITY(itemKey, 0);

    if (level1) {
      UPDATE_INVOICE_PAYLOAD_UNIT(
        itemKey,
        level1.unitOfMeasure.uom_Name,
        level1.uoM_ID,
      );
    }

    const newPrice = isSupplierPriceSelected
      ? getSupplierPrice(newPreset, 1)
      : price;
    UPDATE_INVOICE_PAYLOAD_PRICE(itemKey, newPrice);
    UPDATE_INVOICE_PAYLOAD_TOTAL(
      itemKey,
      calcTotal(0, newPrice, discountValue, discount),
    );
    setIsSupplementPresetChecked(false);
  };

  const handleUnitLevelChange = (levelNumber: number) => {
    if (!selectedPreset) return;
    const levelMeta = selectedPreset.preset.presetLevels.find(
      (l) => l.level === levelNumber,
    );
    if (!levelMeta) return;

    UPDATE_INVOICE_PAYLOAD_UNIT(
      itemKey,
      levelMeta.unitOfMeasure.uom_Name,
      levelMeta.uoM_ID,
    );
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(itemKey, []);
    setIsSupplementPresetChecked(false);

    if (isSupplierPriceSelected) {
      const newPrice = getSupplierPrice(selectedPreset, levelNumber);
      UPDATE_INVOICE_PAYLOAD_PRICE(itemKey, newPrice);
      UPDATE_INVOICE_PAYLOAD_TOTAL(
        itemKey,
        calcTotal(quantity, newPrice, discountValue, discount),
      );
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    UPDATE_INVOICE_PAYLOAD_QUANTITY(itemKey, newQuantity);
    UPDATE_INVOICE_PAYLOAD_TOTAL(
      itemKey,
      calcTotal(newQuantity, price, discountValue, discount),
    );
  };

  const handlePriceChange = (newPrice: number) => {
    UPDATE_INVOICE_PAYLOAD_PRICE(itemKey, newPrice);
    UPDATE_INVOICE_PAYLOAD_TOTAL(
      itemKey,
      calcTotal(quantity, newPrice, discountValue, discount),
    );
  };

  const handleDiscountValueChange = (newDiscount: number) => {
    UPDATE_INVOICE_PAYLOAD_DISCOUNT(itemKey, newDiscount);
    UPDATE_INVOICE_PAYLOAD_TOTAL(
      itemKey,
      calcTotal(quantity, price, newDiscount, discount),
    );
  };

  const handleDiscountTypeChange = (newType: DiscountEnum) => {
    UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE(newType === DiscountEnum.PERCENTAGE);
    UPDATE_INVOICE_PAYLOAD_TOTAL(
      itemKey,
      calcTotal(quantity, price, discountValue, newType),
    );
  };

  const handlePriceModeChange = (isSupplier: boolean) => {
    setIsSupplierPriceSelected(isSupplier);
    if (isSupplier) {
      const newPrice = getSupplierPrice();
      UPDATE_INVOICE_PAYLOAD_PRICE(itemKey, newPrice);
      UPDATE_INVOICE_PAYLOAD_TOTAL(
        itemKey,
        calcTotal(quantity, newPrice, discountValue, discount),
      );
    }
  };

  const handleSupplementToggle = (isChecked: boolean) => {
    setIsSupplementPresetChecked(isChecked);
    if (isChecked) {
      UPDATE_INVOICE_PAYLOAD_AUTO_REPLENISH(itemKey, false);
    } else {
      UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(itemKey, []);
    }
  };

  const handleSupplementPresetToggle = (
    presetId: number,
    isChecked: boolean,
  ) => {
    const newIds = isChecked
      ? selectedSupplementPresetIds.includes(presetId)
        ? selectedSupplementPresetIds
        : [...selectedSupplementPresetIds, presetId]
      : selectedSupplementPresetIds.filter((id) => id !== presetId);
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(itemKey, newIds);
  };

  const handleAutoReplenishToggle = (isChecked: boolean) => {
    UPDATE_INVOICE_PAYLOAD_AUTO_REPLENISH(itemKey, isChecked);
    if (isChecked) {
      setIsSupplementPresetChecked(false);
      UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(itemKey, []);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const isCardComplete = selectedPresetId !== null && quantity > 0 && price > 0;

  return (
    <div
      className={`p-5 border shadow-lg rounded-lg h-fit w-full max-w-120 text-xs relative ${
        isCardComplete ? "border-green-500" : "border-gray-300"
      }`}
    >
      {/* Completion Badge */}
      <div className="absolute -top-1">
        {isCardComplete ? (
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-b-lg shadow-md">
            Complete
          </div>
        ) : (
          <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-b-lg shadow-md">
            Incomplete
          </div>
        )}
      </div>

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
                    className="drop-shadow-none rounded-r-none  bg-custom-gray w-full"
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        handleQuantityChange(Number(value));
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

              {(calculateAvailableStock() === 0 ||
                quantity > calculateAvailableStock()) && (
                <div className="flex flex-col text-red-400">
                  <div className="flex gap-2 items-center">
                    <CircleAlert className="text-red-400" size={18} />
                    <label className="text-red-400 font-semibold">
                      Insufficient Stock
                    </label>
                  </div>

                  {findAvailablePreset() > 0 && (
                    <div className="flex flex-col">
                      <div className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={isSupplementPresetChecked}
                          onChange={(e) =>
                            handleSupplementToggle(e.target.checked)
                          }
                          disabled={isAutoReplenish}
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
                                onChange={(e) =>
                                  handleSupplementPresetToggle(
                                    preset.presetId,
                                    e.target.checked,
                                  )
                                }
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
                  )}

                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={isAutoReplenish}
                      onChange={(e) =>
                        handleAutoReplenishToggle(e.target.checked)
                      }
                    />
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
                        handlePriceChange(Number(value));
                      }
                    }}
                  />
                  <select
                    className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                    value={isSupplierPriceSelected ? "supplier" : "manual"}
                    onChange={(e) =>
                      handlePriceModeChange(e.target.value === "supplier")
                    }
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
                        handleDiscountValueChange(Number(value));
                      }
                    }}
                  />
                  <select
                    className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                    value={discount}
                    onChange={(e) =>
                      handleDiscountTypeChange(e.target.value as DiscountEnum)
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
                value={calcTotal(
                  quantity,
                  price,
                  discountValue,
                  discount,
                ).toFixed(2)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
