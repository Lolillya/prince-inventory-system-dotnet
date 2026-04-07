import { Activity, useState } from "react";
import { XIcon } from "@/icons";
import { CheckIcon, PhilippinePeso } from "lucide-react";
import { UseInventoryQuery } from "@/features/inventory/get-inventory.query";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { updatePresetPricing } from "@/features/unit-of-measure/update-preset-pricing/update-preset-pricing.service";
import { toast } from "sonner";
import {
  ProductPackagingPricingModal,
  ProductPackagingPricingData,
} from "./product-packaging-pricing.modal";

type UnitPreset = InventoryProductModel["unitPresets"][number];

interface ProductPackagingModalProps {
  onClose: () => void;
}

export const ProductPackagingModal = ({
  onClose,
}: ProductPackagingModalProps) => {
  const { data: inventory, refetch } = UseInventoryQuery();
  const [viewingProduct, setViewingProduct] =
    useState<InventoryProductModel | null>(null);
  const [selectedPresetIds, setSelectedPresetIds] = useState<number[]>([]);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleView = (product: InventoryProductModel) => {
    setViewingProduct(product);
    setSelectedPresetIds([]);
  };

  const togglePreset = (presetId: number) => {
    setSelectedPresetIds((prev) =>
      prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId],
    );
  };

  const handleContinue = () => {
    if (selectedPresetIds.length === 0) return;
    setIsPricingModalOpen(true);
  };

  const handlePricingSubmit = async (
    pricingData: ProductPackagingPricingData[],
  ) => {
    if (!viewingProduct) return;
    setIsSubmitting(true);
    try {
      for (const data of pricingData) {
        await updatePresetPricing({
          preset_ID: data.preset_ID,
          product_ID: viewingProduct.product.product_ID,
          unitPrices: data.unitPrices,
        });
      }
      toast.success("Pricing updated successfully");
      setIsPricingModalOpen(false);
      setSelectedPresetIds([]);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data || "Failed to update pricing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const productsWithPresets =
    inventory?.filter((p) => p.unitPresets.length > 0) ?? [];

  const selectedPresets: UnitPreset[] =
    viewingProduct?.unitPresets.filter((up) =>
      selectedPresetIds.includes(up.preset_ID),
    ) ?? [];

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
      {/* ── MAIN LIST MODAL ── */}
      <Activity mode={isPricingModalOpen ? "hidden" : "visible"}>
        <div className="w-5/12 h-4/5 bg-white px-5 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
          <div
            className="absolute top-4 right-4 cursor-pointer"
            onClick={onClose}
          >
            <XIcon />
          </div>
          <h1 className="text-xl font-bold">Product Packaging</h1>

          {/* Table header */}
          <div className="flex items-center px-2 py-1.5 border-b bg-gray-50 rounded-t-lg">
            <span className="text-xs font-semibold text-gray-500 w-1/2">
              Product
            </span>
            <span className="text-xs font-semibold text-gray-500 w-1/3">
              Packaging Presets
            </span>
            <span className="text-xs font-semibold text-gray-500 w-1/6 text-right">
              Action
            </span>
          </div>

          {/* Table rows */}
          <div className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0">
            {productsWithPresets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-8">
                No products with packaging presets found.
              </p>
            ) : (
              productsWithPresets.map((product) => (
                <div
                  key={product.product.product_ID}
                  className={`flex items-center px-2 py-2 rounded-lg transition-all border ${
                    viewingProduct?.product.product_ID ===
                    product.product.product_ID
                      ? "bg-blue-50 border-blue-200"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="w-1/2">
                    <p className="text-sm font-semibold">
                      {product.product.product_Name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.product.product_Code} &middot;{" "}
                      {product.brand.brandName} &middot;{" "}
                      {product.variant.variant_Name}
                    </p>
                  </div>

                  <div className="w-1/3">
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                      {product.unitPresets.length} packaging preset
                      {product.unitPresets.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="w-1/6 flex justify-end">
                    <button
                      className="text-xs px-3 py-1 rounded-lg  transition-all"
                      onClick={() => handleView(product)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Activity>

      {/* ── VIEW / PRESET PICKER PANEL ── */}
      <Activity
        mode={
          viewingProduct !== null && !isPricingModalOpen ? "visible" : "hidden"
        }
      >
        {viewingProduct && (
          <div className="bg-white rounded-lg border shadow-lg py-6 px-5 flex flex-col gap-4 max-h-[80vh] w-92 h-full">
            {/* Product info */}
            <div className="flex flex-col gap-0.5">
              <h3 className="font-bold text-sm">
                {viewingProduct.product.product_Name}
              </h3>
              <p className="text-xs text-gray-500">
                {viewingProduct.unitPresets.length} preset
                {viewingProduct.unitPresets.length !== 1 ? "s" : ""} assigned
              </p>
            </div>

            {/* Preset checkboxes */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 rounded-lg">
              {viewingProduct.unitPresets.map((up) => {
                const isSelected = selectedPresetIds.includes(up.preset_ID);
                return (
                  <div
                    key={up.preset_ID}
                    onClick={() => togglePreset(up.preset_ID)}
                    className={`flex flex-col gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox row */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-semibold">
                        {up.preset.preset_Name}
                      </span>
                    </div>

                    {/* Hierarchy levels top-to-bottom */}
                        {/* <div className="flex flex-col gap-0.5 pl-6">
                        {up.preset.presetLevels.map((level, idx) => (
                            <div
                            key={level.level_ID}
                            className="flex items-center gap-1 text-xs text-gray-600"
                            >
                            {idx > 0 && (
                                <span className="text-gray-400 shrink-0">└</span>
                            )}
                            <span>{level.unitOfMeasure.uom_Name}</span>
                            <span className="text-gray-400">
                                ({level.conversion_Factor}x)
                            </span>
                            </div>
                        ))}
                        </div> */}

                    {/* Pricing summary */}
                    {up.presetPricing.length > 0 && (
                      <div className="flex flex-col gap-1 pl-6 border-t pt-2 mt-0.5">
                        {up.presetPricing.map((pp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex gap-2">
                              {idx > 0 && (
                                <span className="text-gray-400 shrink-0">
                                  └
                                </span>
                              )}
                              <span className="text-gray-600">
                                {pp.unitName}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5 font-semibold">
                              <PhilippinePeso className="w-3 h-3" />
                              <span>
                                {pp.price_Per_Unit?.toFixed(2) ?? "0.00"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                className="w-full max-w-full"
                onClick={handleContinue}
                disabled={selectedPresetIds.length === 0}
              >
                Continue with {selectedPresetIds.length} selected
              </button>
              <button
                className="w-full max-w-full"
                onClick={() => setViewingProduct(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Activity>

      {/* ── PRICING MODAL ── */}
      <ProductPackagingPricingModal
        isOpen={isPricingModalOpen}
        product={viewingProduct}
        selectedPresets={selectedPresets}
        isSubmitting={isSubmitting}
        onClose={() => setIsPricingModalOpen(false)}
        onSubmit={handlePricingSubmit}
      />
    </div>
  );
};
