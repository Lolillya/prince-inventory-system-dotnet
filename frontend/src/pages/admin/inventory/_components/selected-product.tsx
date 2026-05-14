import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { Separator } from "@/components/separator";
import { ChevronDown, PhilippinePeso } from "lucide-react";
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
      <div className="flex justify-between w-full">
        <div className="flex flex-col gap-1 ">
          <span className="text-sm">{product.variant.variant_Name}</span>
          <span className="text-sm">
            {(() => {
              const code =
                product.product.core_Product_Code ??
                product.product.product_Code;
              return code?.length === 10
                ? `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6)}`
                : code;
            })()}
          </span>
        </div>

        <div className="flex gap-2 items-center flex-wrap justify-end">
          {!product.product.is_Active && (
            <span className="bg-gray-200 text-gray-600 rounded-full py-1 px-2 text-xs font-semibold text-nowrap">
              Deactivated
            </span>
          )}
          <span className="bg-teal-200 rounded-full py-1 px-2 items-center flex text-center justify-center text-xs text-nowrap h-fit">
            {product.category.category_Name}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col">
        <label>{product.product.product_Name}</label>
        <label>{product.brand.brandName}</label>
        <label>{product.category.category_Name}</label>
      </div>

      <div className="flex flex-col">
        <label>notes</label>
        <textarea disabled value={product.product.description} rows={2} />
      </div>

      <div className="flex flex-col gap-3">
        {/* {product.unitPresets.map((r, i) => (
          <SupplierBatchCard supplierBatch={r} />
        ))} */}
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <h3>Assocciated Preset</h3>
          <span
            className="text-sm hover:underline cursor-pointer"
            onClick={handlePresetSelector}
          >
            Add Unit Preset
          </span>
        </div>
        <Separator orientation="horizontal" />

        <div className="rounded-lg inset-shadow-sm p-1">
          <div className="flex gap-2 bg-wash-gray p-2 rounded-lg shadow-sm flex-col overflow-y-auto max-h-112 min-h-0">
            {product.unitPresets.length === 0 ? (
              <span className="text-xs font-semibold">
                No associated unit preset.
              </span>
            ) : (
              product.unitPresets.map((u, i) => (
                <>
                  <div
                    className="flex gap-2 bg-wash-gray text-sm rounded-lg cursor-default w-full"
                    key={i}
                  >
                    <div className="w-full flex">
                      <div className="w-full flex gap-2 h-fit items-center text-xs">
                        {product.product.quantity === 0 ? (
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        ) : product.product.quantity <=
                          u.very_Low_Stock_Level! ? (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        ) : product.product.quantity <= u.low_Stock_Level! ? (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {u.preset.presetLevels.map((level, idx) => (
                          <>
                            <span>
                              {level.unitOfMeasure.uom_Name} (
                              {level.conversion_Factor}x)
                            </span>
                            {idx < u.preset.presetLevels.length - 1 && (
                              <span>&gt;</span>
                            )}
                          </>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex flex-col gap-3">
                        <label className="text-xs text-saltbox-gray font-semibold border-b pb-1 text-nowrap">
                          Batch Pricing
                        </label>
                        <div className="flex flex-col gap-1 rounded-lg overflow-y-hidden">
                          <div className="flex flex-col">
                            {u.presetPricing.map((pp, pidx) => (
                              <div
                                className="flex items-center gap-2 text-xs"
                                key={pidx}
                              >
                                {/* {pp.uoM_ID === u.preset.main_Unit_ID && (
                                  <label>{u.main_Unit_Quantity}</label>
                                )} */}
                                <span className="text-gray-600">
                                  {pp.unitName}
                                </span>
                                <div className="flex items-center gap-1">
                                  {pp.price_Per_Unit ? (
                                    <>
                                      <PhilippinePeso width={12} />
                                      <span className="font-semibold">
                                        {pp.price_Per_Unit.toFixed(2)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-gray-400">0.00</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col border-t pt-3 mt-3">
                    <div
                      className="flex gap-2 items-center justify-center mb-3 cursor-pointer hover:bg-gray-50 rounded py-1"
                      onClick={() => toggleBreakdown(i)}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${expandedBreakdowns.has(i) ? "rotate-180" : ""}`}
                      />
                      <span className="text-xs font-semibold">Breakdown</span>
                    </div>

                    {expandedBreakdowns.has(i) && (
                      <div className="flex w-full justify-between px-2">
                        {/* Column 1: Restock Info */}
                        <div className="flex flex-col gap-3 min-w-[100px]">
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 font-semibold">
                              Restock No.
                            </label>
                            <span className="text-xs font-semibold">
                              {u.restock_Number ?? "N/A"}
                            </span>
                          </div>

                          {/* <div className="flex flex-col">
                            <label className="text-xs text-gray-500 font-semibold">
                              PO Ref.
                            </label>
                            <span className="text-xs font-semibold">
                              #PO-456
                            </span>
                          </div> */}
                        </div>

                        {/* Column 2: Original Quantities */}
                        <div className="flex flex-col gap-1 min-w-[100px]">
                          <label className="text-xs text-gray-500 font-semibold mb-1">
                            Original
                          </label>
                          <div className="flex flex-col gap-1">
                            {(() => {
                              const mainLevel = u.preset.presetLevels.find(
                                (l) => l.level === 1,
                              );
                              const mainQty = u.presetQuantities.find(
                                (q) => q.level === 1,
                              );
                              if (!mainLevel) return null;
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold">
                                    {mainQty?.original_Quantity ?? 0}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {mainLevel.unitOfMeasure.uom_Name}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Column 3: Remaining Quantities */}
                        <div className="flex flex-col gap-1 min-w-fit">
                          <label className="text-xs text-gray-500 font-semibold mb-1">
                            Remaining
                          </label>
                          <div className="flex flex-col gap-1">
                            {u.presetQuantities.map((qty, idx) => (
                              <div
                                className="flex items-center gap-2"
                                key={idx}
                              >
                                <span className="text-sm font-semibold text-green-600">
                                  {qty.remaining_Quantity}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {qty.unitName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
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
