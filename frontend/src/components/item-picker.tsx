import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { useSelectedRestockSupplier } from "@/features/restock/selected-supplier";
import {
  RestockLineItemModel,
  SupplierDataModel,
} from "@/features/suppliers/get-all-suppliers.model";
import {
  useUnitPresetRestock,
  useUnitPresetRestockItems,
} from "@/features/restock/unit-preset-restock.query";
import { useEffect, useMemo, useRef, useState } from "react";

type ItemOption = {
  item: InventoryProductModel;
  presetId: number;
  key: string;
  displayName: string;
  presetPath: string;
  mainUnitPrice: number;
};

export const ItemPicker = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedItemLabel, setSelectedItemLabel] = useState("");

  const ref = useRef<HTMLDivElement | null>(null);
  const { addProduct } = useUnitPresetRestock();
  const { data: selectedItems = [] } = useUnitPresetRestockItems();
  const { data: selectedSupplier } = useSelectedRestockSupplier();

  const supplierData = selectedSupplier as SupplierDataModel | undefined;

  const selectedSupplierId =
    (selectedSupplier as { supplier_Id?: string; id?: string } | undefined)
      ?.supplier_Id ??
    (selectedSupplier as { supplier_Id?: string; id?: string } | undefined)?.id;

  useEffect(() => {
    setSelectedItemLabel("");
    setOpen(false);
    setQuery("");
  }, [selectedSupplierId]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const mapLineItemToInventoryProduct = (
    lineItem: RestockLineItemModel,
  ): InventoryProductModel | null => {
    if (!lineItem.product || !lineItem.unit_Preset) return null;

    const presetLevels = [...(lineItem.unit_Preset.preset_Levels ?? [])]
      .sort((a, b) => a.level - b.level)
      .map((level) => ({
        conversion_Factor: level.conversion_Factor,
        created_At: "",
        level: level.level,
        level_ID: level.level_ID,
        unitOfMeasure: {
          uom_ID: level.uoM_ID,
          uom_Name: level.unit?.uom_Name ?? `UOM-${level.uoM_ID}`,
        },
        uoM_ID: level.uoM_ID,
      }));

    const presetPricing = (lineItem.preset_Pricing ?? []).map((pricing) => ({
      pricing_ID: pricing.pricing_ID,
      level:
        presetLevels.find((level) => level.uoM_ID === pricing.uoM_ID)?.level ??
        0,
      uoM_ID: pricing.uoM_ID,
      unitName: pricing.unit?.uom_Name ?? `UOM-${pricing.uoM_ID}`,
      price_Per_Unit: pricing.price_Per_Unit,
      created_At: "",
    }));

    return {
      product: {
        quantity: 0,
        product_ID: lineItem.product.product_ID,
        product_Code: lineItem.product.product_Code,
        product_Name: lineItem.product.product_Name,
        description: lineItem.product.description,
        createdAt: "",
        updatedAt: "",
      },
      brand: {
        brand_ID: lineItem.product.brand?.brand_ID ?? 0,
        brandName: lineItem.product.brand?.brandName ?? "Unknown Brand",
        createdAt: "",
        updatedAt: "",
      },
      variant: {
        variant_ID: lineItem.product.variant?.variant_ID ?? 0,
        variant_Name: lineItem.product.variant?.variant_Name ?? "No Variant",
        createdAt: "",
        updatedAt: "",
      },
      category: {
        category_ID: lineItem.product.category?.category_ID ?? 0,
        category_Name: lineItem.product.category?.category_Name ?? "",
        createdAt: "",
        updatedAt: "",
      },
      unitPresets: [
        {
          assigned_At: "",
          preset: {
            created_At: "",
            main_Unit_ID: lineItem.unit_Preset.main_Unit_ID,
            presetLevels,
            preset_ID: lineItem.unit_Preset.preset_ID,
            preset_Name: lineItem.unit_Preset.preset_Name,
            updated_At: "",
          },
          preset_ID: lineItem.unit_Preset.preset_ID,
          product_Preset_ID: lineItem.unit_Preset.preset_ID,
          low_Stock_Level: undefined,
          very_Low_Stock_Level: undefined,
          main_Unit_Quantity: lineItem.base_Unit_Quantity,
          presetPricing,
        },
      ],
      isComplete: true,
      isFavorited: false,
      isSetupComplete: true,
      restockInfo: [],
    };
  };

  const filtered = useMemo<ItemOption[]>(() => {
    if (!supplierData || !selectedSupplierId) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const allLineItems = supplierData.restocks.flatMap(
      (restock) => restock.line_Items,
    );

    const options = allLineItems
      .map((lineItem) => {
        if (!lineItem.product || !lineItem.unit_Preset) return null;

        const mappedItem = mapLineItemToInventoryProduct(lineItem);
        if (!mappedItem) return null;

        const presetLevels = [
          ...(lineItem.unit_Preset.preset_Levels ?? []),
        ].sort((a, b) => a.level - b.level);
        const presetPath = presetLevels
          .map((level) => level.unit?.uom_Name ?? `UOM-${level.uoM_ID}`)
          .join(" > ");

        const displayName = `${mappedItem.product.product_Name} - ${mappedItem.brand.brandName} - ${mappedItem.variant.variant_Name}`;
        const searchValue = `${displayName} ${presetPath}`.toLowerCase();
        if (normalizedQuery && !searchValue.includes(normalizedQuery)) {
          return null;
        }

        return {
          item: mappedItem,
          presetId: lineItem.unit_Preset.preset_ID,
          key: `${mappedItem.product.product_ID}-${lineItem.unit_Preset.preset_ID}`,
          displayName,
          presetPath,
          mainUnitPrice: lineItem.base_Unit_Price ?? 0,
        } as ItemOption;
      })
      .filter((option): option is ItemOption => option !== null);

    const distinctByProductPreset = new Map<string, ItemOption>();
    options.forEach((option) => {
      if (!distinctByProductPreset.has(option.key)) {
        distinctByProductPreset.set(option.key, option);
      }
    });

    return Array.from(distinctByProductPreset.values());
  }, [supplierData, query, selectedSupplierId]);

  const selectedIds = useMemo(
    () =>
      new Set(
        selectedItems.map((item) => {
          const selectedPresetId = (
            item as { selectedPreset?: { preset_ID: number } }
          ).selectedPreset?.preset_ID;
          return `${item.product.product_ID}-${selectedPresetId ?? "none"}`;
        }),
      ),
    [selectedItems],
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="flex flex-col w-full gap-2 relative" ref={ref}>
      <label className="text-vesper-gray">Product</label>
      <div className="flex w-full">
        <input
          className="w-full"
          placeholder={
            selectedSupplierId ? "Search Product" : "Select supplier first"
          }
          value={open ? query : selectedItemLabel}
          disabled={!selectedSupplierId}
          onFocus={() => {
            if (!selectedSupplierId) return;
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            if (!selectedSupplierId) return;
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {open && selectedSupplierId && (
        <div className="absolute w-full bg-white top-20 max-h-72 overflow-y-auto border shadow-lg rounded-lg p-3 z-20 flex flex-col gap-2">
          {filtered.length > 0 ? (
            filtered.map((option) => {
              const { item, presetId } = option;
              const isAlreadyAdded = selectedIds.has(
                `${item.product.product_ID}-${presetId}`,
              );

              return (
                <div
                  key={option.key}
                  className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    setSelectedItemLabel(option.displayName);
                    addProduct(item, presetId);
                  }}
                >
                  <div className="font-semibold">{option.displayName}</div>
                  <div className="text-xs text-vesper-gray">
                    {option.presetPath}
                  </div>
                  <div className="text-xs text-vesper-gray">
                    Main unit price: {formatPrice(option.mainUnitPrice)}
                  </div>

                  {isAlreadyAdded ? (
                    <div className="text-xs text-blue-600 mt-1">
                      Selected product
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="text-vesper-gray">No products found</div>
          )}
        </div>
      )}
    </div>
  );
};
