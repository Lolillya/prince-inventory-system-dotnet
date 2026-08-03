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
import { useCreatePurchaseOrderMutation } from "@/features/purchase-order/purchase-order.query";
import { useAuth } from "@/context/use-auth";
import { toast } from "sonner";
import { PhilippinePeso, ShoppingCart, Trash, Trash2 } from "lucide-react";

interface PurchaseOrderModalProps {
  setIsPurchaseOrderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PurchaseOrderModal = ({
  setIsPurchaseOrderModalOpen,
}: PurchaseOrderModalProps) => {
  const { updateMainQuantity, removeProduct, clearAll } =
    useUnitPresetRestock();
  const { user } = useAuth();
  const { mutateAsync: createPurchaseOrder, isPending: isGenerating } =
    useCreatePurchaseOrderMutation();
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

      const presetPath = presetLevels
        .map((level: any) =>
          level.conversion_Factor && level.conversion_Factor !== 1
            ? `${level.unitOfMeasure?.uom_Name} (${level.conversion_Factor}x)`
            : level.unitOfMeasure?.uom_Name,
        )
        .filter(Boolean)
        .join(" > ");

      return {
        key: item.itemId || `${item.product.product_ID}-${index}`,
        product: `${item.product.product_Name}`,
        category: item.category?.category_Name || "",
        presetPath,
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

  const selectedSupplierId =
    (selectedSupplier as { supplier_Id?: string; id?: string } | null)
      ?.supplier_Id ??
    (selectedSupplier as { supplier_Id?: string; id?: string } | null)?.id ??
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

  const handleGenerate = async () => {
    if (!user?.user_ID) {
      alert("User not authenticated.");
      return;
    }

    if (!selectedSupplierId) {
      alert("Supplier is required.");
      return;
    }

    const lineItemsPayload = selectedItems
      .map((rawItem) => {
        const item = rawItem as any;
        const selectedPresetId = item.selectedPreset?.preset_ID;
        const selectedPreset = item.unitPresets?.find(
          (preset: any) => preset.preset_ID === selectedPresetId,
        );

        const presetLevels = [
          ...(selectedPreset?.preset?.presetLevels || []),
        ].sort((a: any, b: any) => a.level - b.level);

        const mainLevel =
          presetLevels.find((level: any) => level.level === 1) ||
          presetLevels[0];
        const mainLevelNumber = mainLevel?.level ?? 1;
        const mainUomId = mainLevel?.uoM_ID || mainLevel?.unitOfMeasure?.uom_ID;

        const quantity = Number(item.selectedPreset?.main_Unit_Quantity || 0);
        const unitPrice = Number(
          item.selectedPreset?.levelPricing?.find(
            (lp: any) => lp.level === mainLevelNumber,
          )?.price_Per_Unit || 0,
        );

        if (!quantity || !mainUomId) return null;

        return {
          product_ID: item.product.product_ID,
          preset_ID: selectedPresetId,
          uom_ID: Number(mainUomId),
          quantity,
          unit_Price: unitPrice,
        };
      })
      .filter((lineItem): lineItem is NonNullable<typeof lineItem> =>
        Boolean(lineItem),
      );

    if (lineItemsPayload.length === 0) {
      alert("Please add at least one valid line item.");
      return;
    }

    try {
      await createPurchaseOrder({
        supplier_ID: selectedSupplierId,
        purchase_Order_Clerk: user.user_ID,
        preferred_Delivery: preferredDelivery,
        notes: purchaseOrderNote,
        lineItems: lineItemsPayload,
      });

      toast.success("Purchase order generated successfully.");
      setIsConfirmModalOpen(false);
      setPreferredDelivery("");
      clearAll();
      setIsPurchaseOrderModalOpen(false);
    } catch {
      // Error handling is already centralized in the service layer.
    }
  };

  if (isConfirmModalOpen) {
    return (
      <PurchaseOrderConfirmModal
        supplierName={selectedSupplierName}
        preferredDelivery={preferredDelivery}
        items={confirmationItems}
        grandTotal={grandTotal}
        note={purchaseOrderNote}
        isGenerating={isGenerating}
        onNoteChange={setPurchaseOrderNote}
        onCancel={handleCancelConfirm}
        onGenerate={handleGenerate}
      />
    );
  }

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[1000px]  overflow-y-auto bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
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
              Select a supplier, add procuts, and prepare a purchase order for
              review.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-2 w-full">
            <div className="flex flex-col gap-1 w-full">
              <SupplierPicker suppliersData={suppliersData} />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <span className="flex gap-1">
                <label className="font-semibold">Requested Delivery Date</label>
                <label className="text-red-700">*</label>
              </span>

              <input
                className="input-style-4"
                type="date"
                value={preferredDelivery}
                onChange={(e) => setPreferredDelivery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <ItemPicker />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="font-semibold">
                Selected Products ({selectedItems.length})
              </label>

              <span
                className="flex gap-2 items-center text-red-500 hover:bg-red-50 rounded-md py-1 px-2 cursor-pointer duration-300 transition-colors"
                onClick={clearAll}
              >
                <label className="font-semibold text-red-500 text-sm cursor-pointer">
                  Clear all
                </label>
                <Trash2 />
              </span>
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-[2fr_1fr_0.5fr_0.5fr_0.2fr] border-x-2 border-t-2 border-gray-300 rounded-t-md p-2 bg-gray-100 gap-2">
                <label className="uppercase font-bold text-vesper-gray text-xs">
                  product
                </label>
                <label className="uppercase font-bold text-vesper-gray text-xs">
                  quantity
                </label>
                <label className="uppercase font-bold text-vesper-gray text-xs text-right">
                  unit price
                </label>
                <label className="uppercase font-bold text-vesper-gray text-xs text-right">
                  total
                </label>
                <label className="uppercase font-bold text-vesper-gray text-xs">
                  action
                </label>
              </div>

              {selectedItems.length === 0 ? (
                <div className="border-x-2 border-b-2 border-gray-300 rounded-b-md p-2">
                  <div className="flex flex-col text-center justify-center items-center mx-auto py-6">
                    <div className="bg-gray-200 rounded-full p-4 w-fit h-fit">
                      <ShoppingCart className="text-gray-600" size={60} />
                    </div>
                    <label className="font-bold">
                      No products selected yet.
                    </label>
                    <label className="max-w-2/5">
                      search supplier products above to add items to this
                      purchase order
                    </label>
                  </div>
                </div>
              ) : (
                selectedItems.map((rawItem, index) => {
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
                    .map((level: any) =>
                      level.conversion_Factor && level.conversion_Factor !== 1
                        ? `${level.unitOfMeasure?.uom_Name} (${level.conversion_Factor}x)`
                        : level.unitOfMeasure?.uom_Name,
                    )
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
                      className={`grid grid-cols-[2fr_1fr_0.5fr_0.5fr_0.2fr] border-x-2 border-b-2 border-gray-300 p-2 text-xs gap-2 items-center ${
                        index === selectedItems.length - 1 ? "rounded-b-md" : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex gap-1">
                          <label className="font-semibold">
                            {item.product.product_Name}
                          </label>
                          {item.category?.category_Name ? (
                            <>
                              <span>•</span>
                              <label className="font-semibold text-vesper-gray">
                                {item.category.category_Name}
                              </label>
                            </>
                          ) : null}
                        </div>
                        {presetPath ? (
                          <label className="text-vesper-gray font-semibold">
                            {presetPath}
                          </label>
                        ) : null}
                      </div>

                      <div className="flex gap-1 items-center">
                        <input
                          type="number"
                          min="0"
                          className="input-style-4 max-w-fit! w-32"
                          value={quantity}
                          onChange={(e) =>
                            updateMainQuantity(
                              itemId,
                              Number(e.target.value || 0),
                            )
                          }
                        />

                        <label className="flex items-center justify-center p-1 bg-gray-100 rounded-full min-w-10 h-fit border-2 border-gray-300">
                          {mainUnitName}
                        </label>
                      </div>

                      <div className="flex gap-1 items-center font-semibold justify-end">
                        <PhilippinePeso size={14} />
                        <label>
                          {mainPrice.toFixed(2)} / {mainUnitName}
                        </label>
                      </div>

                      <div className="flex gap-1 items-center font-semibold justify-end">
                        <PhilippinePeso size={14} />
                        <label>{total.toFixed(2)}</label>
                      </div>

                      <span
                        className="text-red-600 flex items-center cursor-pointer"
                        onClick={() => removeProduct(itemId)}
                      >
                        <Trash2 />
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-4 bg-gray-100 p-2 border-y-2 border-gray-300">
              <label className="uppercase text-xl font-bold">
                grand total:{" "}
              </label>
              <span className="flex gap-1 items-center">
                <PhilippinePeso />
                <label className="text-xl font-semibold">
                  {grandTotal.toFixed(2)}
                </label>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            className="px-4 py-2 text-sm rounded border-2 bg-white border-gray-300 text-primary"
            onClick={handleCloseModal}
          >
            Cancel
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
