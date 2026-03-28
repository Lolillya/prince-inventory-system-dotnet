import { Separator } from "@/components/separator";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { useInvoicePayloadQuery } from "@/features/invoice/invoice-create-payload";

import { XIcon } from "@/icons";
import { useEffect, useState } from "react";

interface InvoiceCardProp {
  onClick?: () => void;
  product: InventoryProductModel;
  itemId: string;
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
  const [discount, setDiscount] = useState<DiscountEnum>(DiscountEnum.MANUAL);
  const [isSupplierPriceSelected, setIsSupplierPriceSelected] =
    useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [selectedUnitLevel, setSelectedUnitLevel] = useState<number>(1);

  // Initialize state from product if it has selectedPreset
  useEffect(() => {
    const typedProduct = product as any;
    if (typedProduct.selectedPreset) {
      setSelectedPresetId(typedProduct.selectedPreset.preset_ID);
      setQuantity(typedProduct.selectedPreset.main_Unit_Quantity || 0);
    }
  }, [product]);

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

  // Update price when preset changes, unit level changes, or when switching to supplier price mode
  useEffect(() => {
    if (selectedPreset && isSupplierPriceSelected) {
      const supplierPrice = getSupplierPrice();
      setPrice(supplierPrice);
    }
  }, [selectedPreset, selectedUnitLevel, isSupplierPriceSelected]);

  const getStockIndicator = (preset: (typeof product.unitPresets)[0]) => {
    if (product.product.quantity === 0) {
      return "⚫"; // Gray indicator (no stock)
    } else if (product.product.quantity <= preset.very_Low_Stock_Level!) {
      return "🔴"; // Red indicator (very low stock)
    } else if (product.product.quantity <= preset.low_Stock_Level!) {
      return "🟡"; // Yellow indicator (low stock)
    } else {
      return "🟢"; // Green indicator (adequate stock)
    }
  };
  // const {
  //   UPDATE_INVOICE_PAYLOAD_UNIT,
  //   UPDATE_INVOICE_PAYLOAD_PRICE,
  //   UPDATE_INVOICE_PAYLOAD_DISCOUNT,
  //   UPDATE_INVOICE_PAYLOAD_QUANTITY,
  //   UPDATE_INVOICE_PAYLOAD_TOTAL,
  //   UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE,
  // } = useInvoicePayloadQuery();

  const handlePresetChange = (presetId: number) => {
    setSelectedPresetId(presetId);
    setQuantity(0);
    setSelectedUnitLevel(1); // Reset to first unit level
    // Price will update via useEffect
  };

  const handleUnitLevelChange = (levelNumber: number) => {
    setSelectedUnitLevel(levelNumber);
    // Price will update via useEffect when supplier price is selected
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

  console.log(product);

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
                <select
                  className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
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
            </div>
          </>
        )}

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
                onChange={(e) => setDiscount(e.target.value as DiscountEnum)}
              >
                <option value={DiscountEnum.PERCENTAGE}>Percentage (%)</option>
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
      </div>
    </div>
  );
};
