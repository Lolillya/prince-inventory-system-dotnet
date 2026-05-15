import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { Separator } from "@/components/separator";
import { ChevronDown, PhilippinePeso, Archive, Plus } from "lucide-react";
import { deactivateProductService } from "@/features/inventory/deactivate-product/deactivate-product.service";
import { reactivateProductService } from "@/features/inventory/deactivate-product/reactivate-product.service";
import { ProductActionConfirmModal } from "./product-action-confirm.modal";

interface SelectedProductProps {
  product: InventoryProductModel;
  handlePresetSelector: () => void;
}

export const SelectedProduct = ({
  product,
  handlePresetSelector,
}: SelectedProductProps) => {
  const queryClient = useQueryClient();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"deactivate" | "reactivate">(
    "deactivate",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Set<number>>(
    new Set(),
  );

  const openModal = (action: "deactivate" | "reactivate") => {
    setModalAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async (password: string) => {
    setIsSubmitting(true);
    try {
      if (modalAction === "deactivate") {
        await deactivateProductService(product.product.product_ID, password);
        toast.success("Product deactivated.");
      } else {
        await reactivateProductService(product.product.product_ID, password);
        toast.success("Product reactivated.");
      }
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsConfirmModalOpen(false);
    } catch {
      toast.error(
        modalAction === "deactivate"
          ? "Failed to deactivate product."
          : "Failed to reactivate product.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBreakdown = (index: number) => {
    setExpandedBreakdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col gap-2.5 p-5">
      <div className="flex flex-col gap-6 bg-white border border-gray-100 p-6 rounded-xl shadow-sm mb-2">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Item</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-slate-900">{product.product.product_Name}</span>
              {!product.product.is_Active && (
                <span className="bg-red-100 text-red-700 rounded-full py-0.5 px-2 text-[10px] font-semibold whitespace-nowrap">
                  Deactivated
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Product Code</span>
            <span className="text-lg font-semibold text-slate-900">
              {(() => {
                const code = product.product.core_Product_Code ?? product.product.product_Code;
                return code?.length === 10
                  ? `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6)}`
                  : code;
              })()}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Brand</span>
            <span className="text-base text-slate-800">{product.brand.brandName}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Variant</span>
            <span className="text-base text-slate-800">{product.variant.variant_Name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Category</span>
          <span className="w-fit bg-slate-100 text-slate-600 rounded-full py-1.5 px-3.5 text-xs font-medium">
            {product.category.category_Name}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase">Note</span>
          <span className="text-base text-slate-800">
            {product.product.description || "No note available"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* {product.unitPresets.map((r, i) => (
          <SupplierBatchCard supplierBatch={r} />
        ))} */}
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="flex items-center gap-2 font-medium">
            Associated Preset
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              {product.unitPresets.length}
            </span>
          </h3>
        </div>

        <div className="rounded-lg inset-shadow-sm p-1">
          <div
            className={`flex gap-2 rounded-lg shadow-sm flex-col overflow-y-auto max-h-112 min-h-0 ${product.unitPresets.length === 0
              ? "bg-white border border-gray-100 p-8 items-center justify-center"
              : "bg-wash-gray p-2"
              }`}
          >
            {product.unitPresets.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-8">
                <div className="bg-slate-50 h-16 w-16 flex items-center justify-center rounded-full mb-4">
                  <Archive className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                </div>
                <span className="text-sm font-semibold text-slate-900 mb-4">
                  No preset yet
                </span>
                <button
                  onClick={handlePresetSelector}
                  className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 bg-white rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  + Associate a Preset
                </button>
              </div>
            ) : (
              product.unitPresets.map((u, i) => (
                <div
                  className="flex flex-col bg-white border border-gray-100 shadow-sm rounded-lg w-full p-4 gap-4"
                  key={i}
                >
                  <div className="flex w-full items-center justify-between text-saltbox-gray text-xs font-semibold mb-2">
                    <div className="flex items-center gap-2 w-1/3">
                      {product.product.quantity === 0 ? (
                        <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                          <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" /> Out of Stock
                        </div>
                      ) : product.product.quantity <= u.very_Low_Stock_Level! ? (
                        <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-200">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Critical Stock
                        </div>
                      ) : product.product.quantity <= u.low_Stock_Level! ? (
                        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full border border-orange-200">
                          <div className="w-2.5 h-2.5 bg-orange-400 rounded-full" /> Low Stock
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-200">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Sufficient Stock
                        </div>
                      )}
                    </div>
                    <div className="w-1/3 text-center">Quantity</div>
                    <div className="w-1/3 text-right">Price</div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {u.preset.presetLevels.sort((a, b) => a.level - b.level).map((level, idx) => {
                      const qty = u.presetQuantities.find(q => q.level === level.level) || u.presetQuantities[idx];
                      const price = u.presetPricing.find(p => p.unitName === level.unitOfMeasure?.uom_Name) || u.presetPricing[idx];
                      const isMain = idx === 0;

                      return (
                        <div className="flex w-full items-center text-sm font-semibold text-gray-800" key={idx}>
                          <div className="w-1/3 flex items-center gap-2">
                            {!isMain && (
                              <div className="text-gray-400 border-l-2 border-b-2 h-3 w-3 mb-1 shrink-0 ml-1" />
                            )}
                            <span className={isMain ? "uppercase" : "uppercase text-gray-600"}>
                              {level.unitOfMeasure?.uom_Name || qty?.unitName}{!isMain && ` (${level.conversion_Factor}x)`}
                            </span>
                          </div>
                          <div className="w-1/3 text-center text-gray-600">
                            {qty?.remaining_Quantity ?? 0}
                          </div>
                          <div className="w-1/3 text-right flex items-center justify-end font-semibold">
                            {price?.price_Per_Unit ? (
                              <>
                                <span>₱</span>
                                <span>{price.price_Per_Unit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                              </>
                            ) : (
                              <span>₱0</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="w-full flex justify-end">
        {product.product.is_Active ? (
          <button
            onClick={() => openModal("deactivate")}
            disabled={product.unitPresets.length > 0}
            title={
              product.unitPresets.length > 0
                ? "Remove all packaging presets first"
                : undefined
            }
            className="w-full py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-600 border border-red-300 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Deactivate Product
          </button>
        ) : (
          <button
            onClick={() => openModal("reactivate")}
            className="w-full py-2 rounded-lg text-sm font-semibold bg-green-200 text-green-700 border border-green-400 hover:bg-green-300 transition-colors"
          >
            Reactivate Product
          </button>
        )}
      </div>

      <ProductActionConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        action={modalAction}
        isLoading={isSubmitting}
      />
    </div>
  );
};
