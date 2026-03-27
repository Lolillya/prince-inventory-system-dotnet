import { ItemPicker } from "@/components/item-picker";
import { SupplierPicker } from "@/components/supplier-picker";
import {
  useUnitPresetRestock,
  useUnitPresetRestockItems,
} from "@/features/restock/unit-preset-restock.query";
import { useSelectedRestockSupplier } from "@/features/restock/selected-supplier";
import { useSuppliersQuery } from "@/features/suppliers/supplier-get-all.query";
import { XIcon } from "@/icons";
import { useState } from "react";
import { PurchaseOrderConfirmModal } from "./purchase-order-confirm.modal";

interface PurchaseOrderModalProps {
  setIsPurchaseOrderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PurchaseOrderModal = ({
  setIsPurchaseOrderModalOpen,
}: PurchaseOrderModalProps) => {
  const { updateMainQuantity, updateLevelPricing } = useUnitPresetRestock();
  const [preferredDelivery, setPreferredDelivery] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [purchaseOrderNote, setPurchaseOrderNote] = useState("");

  const handleCloseModal = () => {
    setIsPurchaseOrderModalOpen(false);
  };
  const { data: suppliersData } = useSuppliersQuery();
  const { data: selectedItems = [] } = useUnitPresetRestockItems();
  const { data: selectedSupplier } = useSelectedRestockSupplier();

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const grandTotal = selectedItems.reduce((acc, rawItem) => {
    const item = rawItem as any;
    if (!item?.selectedPreset) return acc;

    const quantity = Number(item.selectedPreset.main_Unit_Quantity || 0);
    const selectedPreset = item.unitPresets?.find(
      (preset: any) => preset.preset_ID === item.selectedPreset.preset_ID,
    );
    const mainLevel = selectedPreset?.preset?.presetLevels?.find(
      (level: any) => level.level === 1,
    );
    const mainPrice = Number(
      item.selectedPreset.levelPricing?.find(
        (lp: any) => lp.level === (mainLevel?.level ?? 1),
      )?.price_Per_Unit || 0,
    );

    return acc + quantity * mainPrice;
  }, 0);

  const confirmationItems = selectedItems
    .map((rawItem, index) => {
      const item = rawItem as any;
      const selectedPresetId = item.selectedPreset?.preset_ID;
      const selectedPreset = item.unitPresets?.find(
        (preset: any) => preset.preset_ID === selectedPresetId,
      );

      const presetLevels = [
        ...(selectedPreset?.preset?.presetLevels || []),
      ].sort((a: any, b: any) => a.level - b.level);
      const mainLevel =
        presetLevels.find((level: any) => level.level === 1) || presetLevels[0];
      const mainLevelNumber = mainLevel?.level ?? 1;
      const mainUnitName = mainLevel?.unitOfMeasure?.uom_Name || "Main Unit";

      const quantity = Number(item.selectedPreset?.main_Unit_Quantity || 0);
      const price = Number(
        item.selectedPreset?.levelPricing?.find(
          (lp: any) => lp.level === mainLevelNumber,
        )?.price_Per_Unit || 0,
      );

      return {
        key: item.itemId || `${item.product.product_ID}-${index}`,
        product: `${item.product.product_Name} - ${item.brand.brandName} - ${item.variant.variant_Name}`,
        quantity,
        unit: mainUnitName,
        price,
        subtotal: quantity * price,
      };
    })
    .filter((row) => row.quantity > 0);

  const selectedSupplierName =
    (selectedSupplier as { company_Name?: string; companyName?: string } | null)
      ?.company_Name ??
    (selectedSupplier as { company_Name?: string; companyName?: string } | null)
      ?.companyName ??
    "";

  const handleConfirm = () => {
    if (!selectedSupplierName) {
      alert("Please select a supplier first.");
      return;
    }

    if (!preferredDelivery) {
      alert("Please set the preferred delivery date.");
      return;
    }

    if (confirmationItems.length === 0) {
      alert("Please add at least one item with quantity.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  const handleGenerate = () => {
    // Final API integration for purchase order generation can be connected here.
    setIsConfirmModalOpen(false);
    setIsPurchaseOrderModalOpen(false);
  };

  if (isConfirmModalOpen) {
    return (
      <PurchaseOrderConfirmModal
        supplierName={selectedSupplierName}
        preferredDelivery={preferredDelivery}
        items={confirmationItems}
        grandTotal={grandTotal}
        note={purchaseOrderNote}
        onNoteChange={setPurchaseOrderNote}
        onCancel={handleCancelConfirm}
        onGenerate={handleGenerate}
      />
    );
  }

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[800px] max-h-[90vh] overflow-y-auto bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div
            className="absolute top-4 right-4 cursor-pointer"
            onClick={handleCloseModal}
          >
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Create Purchase Order</h1>
            <p className="text-gray-500">
              Fill in purchase order details for supplier delivery planning.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SupplierPicker suppliersData={suppliersData} />

          <label className="text-sm font-medium">Preferred delivery</label>
          <input
            className="input-style-2"
            placeholder="Date / time / notes"
            type="date"
            value={preferredDelivery}
            onChange={(e) => setPreferredDelivery(e.target.value)}
          />
          <ItemPicker />

          <div className="border rounded-lg p-3 bg-custom-gray">
            <p className="text-sm text-gray-500">Selected item products</p>

            {selectedItems.length === 0 ? (
              <div className="mt-3 h-36 bg-white rounded border flex items-center justify-center text-xs text-gray-400">
                No selected items yet
              </div>
            ) : (
              <div className="mt-3 rounded border bg-white overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  {selectedItems.map((rawItem, index) => {
                    const item = rawItem as any;
                    const itemId = item.itemId as string;
                    const selectedPresetId = item.selectedPreset?.preset_ID;
                    const selectedPreset = item.unitPresets?.find(
                      (preset: any) => preset.preset_ID === selectedPresetId,
                    );

                    const presetLevels = [
                      ...(selectedPreset?.preset?.presetLevels || []),
                    ].sort((a: any, b: any) => a.level - b.level);

                    const presetPath = presetLevels
                      .map((level: any) => level.unitOfMeasure?.uom_Name)
                      .filter(Boolean)
                      .join(" > ");

                    const mainLevel =
                      presetLevels.find((level: any) => level.level === 1) ||
                      presetLevels[0];
                    const mainLevelNumber = mainLevel?.level ?? 1;
                    const mainUnitName =
                      mainLevel?.unitOfMeasure?.uom_Name || "Main Unit";

                    const quantity = Number(
                      item.selectedPreset?.main_Unit_Quantity || 0,
                    );
                    const mainPrice = Number(
                      item.selectedPreset?.levelPricing?.find(
                        (lp: any) => lp.level === mainLevelNumber,
                      )?.price_Per_Unit || 0,
                    );
                    const total = quantity * mainPrice;

                    return (
                      <div
                        key={itemId || `${item.product.product_ID}-${index}`}
                        className={`p-3 flex flex-col gap-2 ${
                          index !== selectedItems.length - 1
                            ? "border-b"
                            : "border-b-0"
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          {item.product.product_Name} - {item.brand.brandName} -{" "}
                          {item.variant.variant_Name}
                        </div>

                        <div className="text-xs text-vesper-gray">
                          Unit preset: {presetPath || "No preset assigned"}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-vesper-gray">
                              Quantity ({mainUnitName})
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="input-style-2"
                              value={quantity}
                              onChange={(e) =>
                                updateMainQuantity(
                                  itemId,
                                  Number(e.target.value || 0),
                                )
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-vesper-gray">
                              Price ({mainUnitName})
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="input-style-2"
                              value={mainPrice}
                              onChange={(e) =>
                                updateLevelPricing(
                                  itemId,
                                  mainLevelNumber,
                                  Number(e.target.value || 0),
                                )
                              }
                            />
                          </div>

                          <div className="text-sm md:col-span-2">
                            <span className="text-vesper-gray">Total: </span>
                            <span className="font-semibold">
                              {formatMoney(total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-3 py-2 bg-custom-gray border-t flex justify-end text-sm">
                  <span className="text-vesper-gray mr-2">Grand total:</span>
                  <span className="font-bold">{formatMoney(grandTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            className="px-4 py-2 text-sm rounded border"
            onClick={handleCloseModal}
          >
            Close
          </button>

          <button
            className="px-4 py-2 text-sm rounded hover:bg-blue-600"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
