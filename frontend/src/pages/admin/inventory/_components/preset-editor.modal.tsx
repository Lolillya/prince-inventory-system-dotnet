import { PlusIcon } from "@/icons";
import { XIcon } from "lucide-react";
import { Activity, useState } from "react";
import { PresetEditorForm } from "./forms/preset-editor.form";
import { UseInventoryQuery } from "@/features/restock/inventory-batch";
import { useUnitPresetQuery } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.state";
import { UnitPresetCard } from "./unit-preset-card";
import { SelectableProductCard } from "@/features/unit-of-measure/assign-product-to-preset/selectable-product-card";
import {
  useAssignProductToPresetState,
  useSetAssignProductToPresetState,
  useToggleProductSelection,
  useClearProductSelection,
} from "@/features/unit-of-measure/assign-product-to-preset/assign-protuct.state";
import { assignProductsToPreset } from "@/features/unit-of-measure/assign-product-to-preset/assign-product.service";
import { toast } from "sonner";
import { PresetPricingModal, ProductPricingData } from "./preset-pricing-modal";

interface ProductUnitPresetModalProp {
  handlePresetEditor: () => void;
}

export const ProductUnitPresetModal = ({
  handlePresetEditor,
}: ProductUnitPresetModalProp) => {
  const [isAddPresetOpen, setIsAddPresetOpen] = useState(false);
  const [isAddProductsToPresetOpen, setIsAddProductsToPresetOpen] =
    useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products } = UseInventoryQuery();
  const { data: unitPresets, refetch: refetchUnitPresets } =
    useUnitPresetQuery();
  const { data: selectedState } = useAssignProductToPresetState();
  const setSelectedState = useSetAssignProductToPresetState();
  const toggleProductSelection = useToggleProductSelection();
  const clearProductSelection = useClearProductSelection();

  console.log("unitPresets: ", unitPresets);

  const handleAddPreset = () => {
    setIsAddPresetOpen(!isAddPresetOpen);
    setIsAddProductsToPresetOpen(false);
  };

  const handleCloseModal = () => {
    setIsAddPresetOpen(false);
    handlePresetEditor();
  };

  const handleCancelAddPreset = () => {
    setIsAddPresetOpen(false);
  };

  const handleAddProductsToPreset = (presetId?: number) => {
    if (presetId && !isAddProductsToPresetOpen) {
      // Opening the product selector for a specific preset
      // Pre-populate with already assigned products for editing
      const preset = unitPresets?.find((p) => p.preset_ID === presetId);
      const alreadyAssignedIds =
        preset?.products.map((p) => p.product_ID) || [];

      setSelectedState({
        selectedPresetId: presetId,
        selectedProductIds: alreadyAssignedIds,
      });
    } else if (!isAddProductsToPresetOpen) {
      // Clear selection when closing
      clearProductSelection();
    }
    setIsAddProductsToPresetOpen(!isAddProductsToPresetOpen);
  };

  const handleOpenPricingModal = () => {
    if (!selectedState?.selectedPresetId) {
      toast.error("No preset selected");
      return;
    }

    if (selectedState.selectedProductIds.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setIsPricingModalOpen(true);
  };

  const handleSubmitProductAssignment = async (
    pricingData: ProductPricingData[],
  ) => {
    if (!selectedState?.selectedPresetId) {
      toast.error("No preset selected");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await assignProductsToPreset({
        preset_ID: selectedState.selectedPresetId,
        product_IDs: selectedState.selectedProductIds,
        pricingData: pricingData,
      });

      const message = hasExistingAssignments
        ? "Product assignments updated successfully"
        : `${response.assigned_count} product(s) assigned successfully` +
          (response.skipped_count > 0
            ? `, ${response.skipped_count} already assigned`
            : "");

      toast.success(message);

      clearProductSelection();
      setIsAddProductsToPresetOpen(false);
      setIsPricingModalOpen(false);
      await refetchUnitPresets();
    } catch (error: any) {
      console.error("Error assigning products:", error);
      toast.error(
        error?.response?.data || "Failed to assign products to preset",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAlreadyAssignedProductIds = (): number[] => {
    if (!selectedState?.selectedPresetId || !unitPresets) return [];

    const preset = unitPresets.find(
      (p) => p.preset_ID === selectedState.selectedPresetId,
    );
    return preset?.products.map((p) => p.product_ID) || [];
  };

  const alreadyAssignedProductIds = getAlreadyAssignedProductIds();
  const selectedCount = selectedState?.selectedProductIds.length || 0;
  const hasExistingAssignments = alreadyAssignedProductIds.length > 0;

  const getSelectedProducts = () => {
    if (!products || !selectedState) return [];
    return products.filter((p) =>
      selectedState.selectedProductIds.includes(p.product.product_ID),
    );
  };

  const getSelectedPreset = () => {
    if (!unitPresets || !selectedState?.selectedPresetId) return null;
    return (
      unitPresets.find((p) => p.preset_ID === selectedState.selectedPresetId) ||
      null
    );
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
      {/* MAIN PACKAGING PRESET MODAL */}
      <Activity mode={isPricingModalOpen ? "hidden" : "visible"}>
        <div
          className={`w-5/12 ${isAddPresetOpen ? "h-fit" : "h-4/5"} bg-white px-5 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4 transition-all duration-200`}
        >
          <div className="absolute top-4 right-4" onClick={handleCloseModal}>
            <XIcon />
          </div>

          <div className="w-full">
            <h1>Packaging Presets</h1>
          </div>

          <Activity mode={isAddPresetOpen ? "visible" : "hidden"}>
            <PresetEditorForm handleCancelAddPreset={handleCancelAddPreset} />
          </Activity>

          {!isAddPresetOpen && (
            <div className="flex flex-col gap-2 flex-1">
              {/* TABLE HEADER */}
              <div className="flex items-center justify-between p-2 border-b">
                <label className="text-sm font-semibold text-saltbox-gray w-1/3">
                  Main Unit
                </label>
                <label className="text-sm font-semibold text-saltbox-gray w-full">
                  Conversion
                </label>
                <label className="text-sm font-semibold text-saltbox-gray w-1/2">
                  Used by
                </label>
                <label className="text-sm font-semibold text-saltbox-gray w-1/3"></label>
              </div>

              {/* TABLE BODY */}

              <div className="flex flex-col gap-2 flex-1">
                {unitPresets?.map((p, i) => (
                  <UnitPresetCard
                    key={i}
                    unitPreset={p}
                    handleAddProductsToPreset={handleAddProductsToPreset}
                    isAddProductsToPresetOpen={isAddProductsToPresetOpen}
                    selectedPresetId={selectedState?.selectedPresetId || null}
                  />
                ))}
              </div>

              <div className="flex justify-center w-full">
                <button
                  className="w-full max-w-full text-sm font-semibold"
                  onClick={handleAddPreset}
                >
                  Add Packaging Preset <PlusIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </Activity>

      {/*   PRODUCT SELECTOR */}
      <Activity
        mode={
          isAddProductsToPresetOpen && !isPricingModalOpen
            ? "visible"
            : "hidden"
        }
      >
        <div className="bg-white rounded-lg border shadow-lg py-10 px-5 flex flex-col gap-5 max-h-4/5 max-w-3/12 w-full">
          <div className="flex flex-col gap-5 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Select Product/s</h3>

              <label className="text-saltbox-gray text-sm ">
                {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
              </label>
            </div>

            <div className="flex flex-col overflow-y-scroll gap-3 border p-3 rounded-lg inset-shadow-sm flex-1 min-h-0">
              {/* PRODUCT SELECTOR FORM */}
              {products?.map((data, index) => {
                const isAlreadyAssigned = alreadyAssignedProductIds.includes(
                  data.product.product_ID,
                );
                const isSelected =
                  selectedState?.selectedProductIds.includes(
                    data.product.product_ID,
                  ) || false;

                return (
                  <SelectableProductCard
                    key={index}
                    product={data}
                    isSelected={isSelected}
                    isAlreadyAssigned={isAlreadyAssigned}
                    onToggle={toggleProductSelection}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex w-full gap-3">
            <button
              className="w-full max-w-full"
              onClick={handleOpenPricingModal}
              disabled={isSubmitting || selectedCount === 0}
            >
              {hasExistingAssignments
                ? `Continue with ${selectedCount} selected`
                : `Continue with ${selectedCount > 0 ? selectedCount : ""} Product${selectedCount !== 1 ? "s" : ""}`}
            </button>
            <button
              className="w-full max-w-full"
              onClick={() => handleAddProductsToPreset()}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </Activity>

      {/* PRICING MODAL */}
      <PresetPricingModal
        isOpen={isPricingModalOpen}
        preset={getSelectedPreset()}
        selectedProducts={getSelectedProducts()}
        onClose={() => setIsPricingModalOpen(false)}
        onSubmit={handleSubmitProductAssignment}
      />
    </div>
  );
};
