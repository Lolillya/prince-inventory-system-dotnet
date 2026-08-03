import { Separator } from "@/components/separator";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import {
  useInvoicePayloadQuery,
  useSelectedPayloadInvoiceQuery,
} from "@/features/invoice/invoice-create-payload";
import { useAutoReplenishPreviewQuery } from "@/features/restock/auto-replenish-preview.query";
import {
  calculateAvailableStock as calcAvailableStock,
  getAvailableStockBreakdown,
} from "@/features/invoice/stock-availability";
import { XIcon } from "@/icons";
import {
  Bot,
  ChevronDown,
  CircleCheck,
  Info,
  PhilippinePeso,
  TriangleAlert,
} from "lucide-react";
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
  const isAutoReplenish = myPayload?.auto_Replenish ?? false;

  // Pure UI state — not tracked in the invoice payload, no useEffect needed
  const [isSupplierPriceSelected, setIsSupplierPriceSelected] =
    useState<boolean>(true);
  const [isInsufficientStockExpanded, setIsInsufficientStockExpanded] =
    useState<boolean>(false);
  const [manualPriceInput, setManualPriceInput] = useState<string>(
    price ? String(price) : "",
  );

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

  const getAvailableBreakdown = () =>
    getAvailableStockBreakdown(product, selectedPreset, selectedUnitLevel);

  const calculateAvailableStock = (): number =>
    calcAvailableStock(product, selectedPreset, selectedUnitLevel);

  // Info icon / tooltip should only show when a HIGHER unit (a level with
  // a smaller level number than the one selected) is contributing
  // leftover stock towards the total — not merely because the selected
  // unit itself has remaining stock.
  const hasHigherUnitContribution = (): boolean =>
    getAvailableBreakdown().some((b) => b.level < selectedUnitLevel);

  const calculateDeficit = (): number =>
    Math.max(0, quantity - calculateAvailableStock());

  const selectedUnitName =
    selectedPreset?.preset.presetLevels.find(
      (l) => l.level === selectedUnitLevel,
    )?.unitOfMeasure.uom_Name ?? "";

  const isInsufficientStock =
    !!selectedPreset &&
    quantity > 0 &&
    (calculateAvailableStock() === 0 || quantity > calculateAvailableStock());

  const getMainUnitConversion = (): {
    symbol: "=" | "≈";
    value: string;
    unitName: string;
  } | null => {
    if (!selectedPreset || quantity <= 0 || selectedUnitLevel === 1)
      return null;

    const sortedLevels = [...selectedPreset.preset.presetLevels].sort(
      (a, b) => a.level - b.level,
    );
    const mainUnit = sortedLevels.find((l) => l.level === 1);
    if (!mainUnit) return null;

    let factor = 1;
    for (const level of sortedLevels) {
      if (level.level === 1) continue;
      if (level.level > selectedUnitLevel) break;
      factor *= level.conversion_Factor;
    }

    const mainQty = quantity / factor;
    const hasRemainder = Math.abs(mainQty - Math.round(mainQty)) > 1e-9;

    return {
      symbol: hasRemainder ? "≈" : "=",
      value: hasRemainder ? mainQty.toFixed(2) : String(Math.round(mainQty)),
      unitName: mainUnit.unitOfMeasure.uom_Name,
    };
  };

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
    UPDATE_INVOICE_PAYLOAD_QUANTITY(itemKey, 0);
    UPDATE_INVOICE_PAYLOAD_AUTO_REPLENISH(itemKey, false);
    setIsInsufficientStockExpanded(false);

    const newPrice = isSupplierPriceSelected
      ? getSupplierPrice(selectedPreset, levelNumber)
      : price;
    if (isSupplierPriceSelected) {
      UPDATE_INVOICE_PAYLOAD_PRICE(itemKey, newPrice);
    }
    UPDATE_INVOICE_PAYLOAD_TOTAL(
      itemKey,
      calcTotal(0, newPrice, discountValue, discount),
    );
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
    if (!isSupplier) {
      setManualPriceInput(price ? String(price) : "");
    }
    if (isSupplier) {
      const newPrice = getSupplierPrice();
      UPDATE_INVOICE_PAYLOAD_PRICE(itemKey, newPrice);
      UPDATE_INVOICE_PAYLOAD_TOTAL(
        itemKey,
        calcTotal(quantity, newPrice, discountValue, discount),
      );
    }
  };

  const handleAutoReplenishToggle = (isChecked: boolean) => {
    UPDATE_INVOICE_PAYLOAD_AUTO_REPLENISH(itemKey, isChecked);
    if (isChecked) {
      UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS(itemKey, []);
    }
  };

  const handleToggleInsufficientStockExpanded = () => {
    setIsInsufficientStockExpanded((prev) => !prev);
  };

  const { data: autoReplenishPreview } = useAutoReplenishPreviewQuery(
    isInsufficientStock && isInsufficientStockExpanded,
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  const isCardComplete =
    selectedPresetId !== null &&
    quantity > 0 &&
    price > 0 &&
    (!isInsufficientStock || isAutoReplenish);

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
            Ready
          </div>
        ) : (
          <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-b-lg shadow-md">
            Incomplete
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center text-xs justify-between">
        <div className="flex gap-2 items-center">
          <span className="font-semibold text-base">
            {product.product.product_Name}
          </span>
          <span>•</span>
          <span className="text-vesper-gray font-semibold">
            {product.category?.category_Name}
          </span>
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
              <div className="grid grid-cols-2 gap-2">
                <label className="font-semibold capitalize">
                  quantity & unit
                </label>

                <span className="text-vesper-gray text-xs font-semibold flex gap-1 items-center relative">
                  Available:
                  <label
                    className={
                      calculateAvailableStock() === 0
                        ? "text-red-500"
                        : "text-primary"
                    }
                  >
                    {calculateAvailableStock()}
                  </label>
                  {hasHigherUnitContribution() && (
                    <span className="group relative inline-flex items-center">
                      <Info
                        size={12}
                        className="text-vesper-gray cursor-help"
                      />
                      <div className="hidden group-hover:flex flex-col absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-56 bg-white border rounded-md shadow-lg p-2 z-10">
                        <span className="text-[10px] font-semibold text-vesper-gray whitespace-nowrap">
                          From Remaining Quantity
                        </span>
                        <div className="h-px bg-gray-200 my-1" />
                        <span className="text-xs text-primary whitespace-nowrap">
                          {getAvailableBreakdown().map((b, i) => (
                            <span key={b.level}>
                              {i > 0 && " + "}
                              <span
                                className={
                                  b.level === selectedUnitLevel
                                    ? "font-bold"
                                    : ""
                                }
                              >
                                {b.remaining} {b.unitName}
                              </span>
                            </span>
                          ))}
                        </span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r rotate-45 -mt-1" />
                      </div>
                    </span>
                  )}
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex">
                  <div className="relative w-full flex items-center justify-center">
                    <input
                      className="drop-shadow-none rounded-r-none  bg-custom-gray w-full"
                      placeholder="Enter quantity..."
                      value={quantity === 0 ? "" : quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          handleQuantityChange(0);
                        } else if (
                          /^\d*\.?\d*$/.test(value) &&
                          Number(value) > 0
                        ) {
                          handleQuantityChange(Number(value));
                        }
                      }}
                      min="0"
                    />

                    {getMainUnitConversion() && (
                      <span className="absolute right-2 text-vesper-gray text-xs font-semibold flex gap-1">
                        {getMainUnitConversion()!.symbol}{" "}
                        {getMainUnitConversion()!.value}{" "}
                        {getMainUnitConversion()!.unitName}
                      </span>
                    )}
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

                {isInsufficientStock && (
                  <div
                    className={`flex items-center p-2 rounded-b-md border-2 cursor-pointer select-none ${
                      isAutoReplenish
                        ? "bg-green-100 border-green-400"
                        : "bg-red-100 border-red-400"
                    }`}
                    onClick={handleToggleInsufficientStockExpanded}
                  >
                    <div className="flex gap-2 items-center">
                      {isAutoReplenish ? (
                        <CircleCheck className="text-green-600" size={18} />
                      ) : (
                        <TriangleAlert className="text-red-600" size={18} />
                      )}
                      <label
                        className={`font-semibold cursor-pointer ${
                          isAutoReplenish ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isAutoReplenish
                          ? "Stock Deficit Resolved"
                          : isInsufficientStockExpanded
                            ? "Stock Resolution Required"
                            : "Insufficient Stock"}
                      </label>
                      {isAutoReplenish && !isInsufficientStockExpanded && (
                        <Bot className="text-indigo-600" size={14} />
                      )}
                    </div>

                    {!isInsufficientStockExpanded && (
                      <span className="flex gap-1 items-center ml-auto pr-12">
                        <label>
                          {isAutoReplenish ? "Covered:" : "Deficit:"}
                        </label>
                        <label
                          className={`font-semibold ${
                            isAutoReplenish ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {calculateDeficit()} {selectedUnitName}
                        </label>
                      </span>
                    )}

                    <ChevronDown
                      size={18}
                      className={`ml-auto transition-transform ${
                        isAutoReplenish ? "text-green-600" : "text-red-600"
                      } ${isInsufficientStockExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pricing + Total — wrapped in a relative container so the
                Stage 2 "Stock Resolution Required" panel can expand OVER
                this section (instead of pushing the card taller). */}
            <div className="relative flex flex-col gap-3">
              <div className="flex flex-col">
                <span className="font-semibold capitalize">pricing</span>
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <input
                      className="drop-shadow-none rounded-r-none  bg-custom-gray w-full"
                      disabled={isSupplierPriceSelected}
                      value={
                        isSupplierPriceSelected ? price || "" : manualPriceInput
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                          setManualPriceInput(value);
                          handlePriceChange(value === "" ? 0 : Number(value));
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
                      <option value="supplier">Standard Price</option>
                      <option value="manual">Manual Price</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* <div className="flex flex-col">
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
              </div> */}

              <Separator orientation="horizontal" />

              <div className="flex gap-2 items-center justify-between">
                <span className="font-semibold">Total:</span>
                <label className="flex gap-1 text-lg font-semibold items-center">
                  <PhilippinePeso size={18} />
                  {calcTotal(quantity, price, discountValue, discount).toFixed(
                    2,
                  )}
                </label>
              </div>

              {isInsufficientStock && isInsufficientStockExpanded && (
                <div
                  className={`absolute inset-0 z-20 bg-white border-2 rounded-md shadow-lg p-3 flex flex-col gap-3 h-fit ${
                    isAutoReplenish ? "border-green-400" : "border-red-400"
                  }`}
                >
                  <span className="text-vesper-gray">
                    The requested quantity exceeds the available stock.
                  </span>

                  <Separator orientation="horizontal" />

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-start">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={isAutoReplenish}
                        onChange={(e) =>
                          handleAutoReplenishToggle(e.target.checked)
                        }
                      />
                      <div className="flex flex-col">
                        <label className="font-semibold">
                          Auto-replenish deficit
                        </label>
                        <span className="text-vesper-gray">
                          Generates an internal replenishment order to cover the
                          remaining{" "}
                          <span className="text-red-600 font-semibold">
                            {calculateDeficit()} {selectedUnitName} deficit
                          </span>
                          .
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-between p-2 rounded-md border bg-custom-gray">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {autoReplenishPreview?.supplier_Company_Name ??
                            "Prince Educational Supplies"}
                        </span>
                        <span className="bg-indigo-100 text-indigo-600 font-semibold rounded-full text-[10px] py-0.5 px-2">
                          {autoReplenishPreview?.supplier_Label ?? "INTERNAL"}
                        </span>
                      </div>
                      <span className="text-vesper-gray font-semibold">
                        #{autoReplenishPreview?.restock_Number ?? "…"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-md bg-gray-100">
                    <Info
                      size={14}
                      className="text-vesper-gray shrink-0 mt-0.5"
                    />
                    <span className="text-[11px] text-vesper-gray">
                      This invoice cannot be completed until the stock shortage
                      is resolved. Enable Auto-replenish deficit to generate an
                      internal replenish order, or reduce the requested
                      quantity.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
