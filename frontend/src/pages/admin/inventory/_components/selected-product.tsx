import { useState } from "react";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { Separator } from "@/components/separator";
import { SupplierBatchCard } from "./supplier-batch-card";
import { ChevronDown, PhilippinePeso } from "lucide-react";

interface SelectedProductProps {
  product: InventoryProductModel;
  handlePresetSelector: () => void;
}

export const SelectedProduct = ({
  product,
  handlePresetSelector,
}: SelectedProductProps) => {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
  console.log(product);
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-between w-full">
        <div className="flex flex-col gap-1 ">
          <span className="text-sm">{product.variant.variant_Name}</span>
          <span className="text-sm">{product.product.product_Code}</span>
        </div>

        <span className="bg-teal-200 rounded-full py-1 px-2 items-center flex text-center justify-center text-xs text-nowrap h-fit">
          {product.category.category_Name}
        </span>
      </div>

      {/* <div className="flex gap-1">
        <label>ID: </label>
        <span>{product.product.product_Name}</span>
      </div> */}

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
        {/* <div className="flex flex-col gap-2">
          <div className="flex w-full justify-between">
            <label>{product.restockInfo.length} batches</label>
            <span>view all</span>
          </div>
          <Separator />
        </div> */}

        {product.restockInfo.map((r, i) => (
          <SupplierBatchCard supplierBatch={r} />
        ))}
      </div>

      <div className="flex flex-col h-full">
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

        <div className="rounded-lg border inset-shadow-sm p-1 h-full">
          <div className="flex gap-2 bg-wash-gray p-2 rounded-lg shadow-sm flex-col">
            {product.unitPresets.length === 0 ? (
              <span className="text-sm font-semibold">
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
                      <div className="w-full flex gap-2 h-fit items-center">
                        {product.product.quantity === 0 && (
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        )}
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
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
                      {/* <div className="w-full flex gap-4">
                      <label>Total Batches:</label>
                      <span>{product.restockInfo.length}</span>
                    </div> */}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-saltbox-gray font-semibold text-nowrap">
                        unit conversions
                      </label>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <label>100</label>
                          <label>Box</label>
                          <span>•</span>
                          <div className="flex gap-1 items-center w-full justify-end">
                            <PhilippinePeso width={12} />
                            <span>100.00</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label>0</label>
                          <label>Packs</label>
                          <span>•</span>
                          <div className="flex gap-1 items-center w-full justify-end">
                            <PhilippinePeso width={12} />
                            <span>70.00</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label>0</label>
                          <label>Piece</label>
                          <span>•</span>
                          <div className="flex gap-1 items-center w-full justify-end">
                            <PhilippinePeso width={12} />
                            <span>30.00</span>
                          </div>
                        </div>
                      </div>
                      {/* <div className="flex flex-col">
                      {u.preset.presetLevels.map((l, idx) => (
                        <>
                          <div className="flex gap-2 items-center" key={idx}>
                            <span className="text-sm text-saltbox-gray">
                              {l.unitOfMeasure.uom_Name}:{" "}
                            </span>
                            <span className="text-sm text-saltbox-gray font-semibold">
                              {l.conversion_Factor}
                            </span>
                          </div>
                        </>
                      ))}
                    </div> */}

                      <div className="flex flex-col">
                        {product.restockInfo.map(
                          (b, idx) => (
                            <div>
                              <span>Batch #{b.batchNumber}</span>
                              <div>
                                {b.presetPricing.map((pp, pidx) => (
                                  <div>
                                    {pp.unitName}{" "}
                                    {pidx == 0 ? b.base_Unit_Quantity : "0"}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                          // b.presetPricing.map((pp, pidx) => (
                          //   <div
                          //     className="flex gap-2 items-center"
                          //     key={`${idx}-${pidx}`}
                          //   >
                          //     <span className="text-sm text-saltbox-gray">
                          //       {pp.unitName} Price:{" "}
                          //     </span>
                          //     <span className="text-sm text-saltbox-gray font-semibold flex gap-1">
                          //       <PhilippinePeso width={12} />{" "}
                          //       {pp.price_Per_Unit.toFixed(2)}
                          //     </span>
                          //   </div>
                          // ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col border-t pt-3 mt-3">
                    <div
                      className="flex gap-2 items-center justify-center mb-3 cursor-pointer hover:bg-gray-50 rounded py-1"
                      onClick={() =>
                        setIsBreakdownExpanded(!isBreakdownExpanded)
                      }
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isBreakdownExpanded ? "rotate-180" : ""}`}
                      />
                      <span className="text-sm font-semibold">Breakdown</span>
                    </div>

                    {isBreakdownExpanded && (
                      <div className="flex w-full justify-between px-2">
                        {/* Column 1: Restock Info */}
                        <div className="flex flex-col gap-3 min-w-[100px]">
                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 font-semibold">
                              Restock No.
                            </label>
                            <span className="text-sm font-semibold">
                              #00123
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <label className="text-xs text-gray-500 font-semibold">
                              PO Ref.
                            </label>
                            <span className="text-sm font-semibold">
                              #PO-456
                            </span>
                          </div>
                        </div>

                        {/* Column 2: Original Quantities */}
                        <div className="flex flex-col gap-1 min-w-[100px]">
                          <label className="text-xs text-gray-500 font-semibold mb-1">
                            Original
                          </label>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">100</span>
                              <span className="text-sm text-gray-600">Box</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">0</span>
                              <span className="text-sm text-gray-600">
                                Pack
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">0</span>
                              <span className="text-sm text-gray-600">
                                Piece
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Remaining Quantities */}
                        <div className="flex flex-col gap-1 min-w-fit">
                          <label className="text-xs text-gray-500 font-semibold mb-1">
                            Remaining
                          </label>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-green-600">
                                85
                              </span>
                              <span className="text-sm text-gray-600">Box</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-green-600">
                                12
                              </span>
                              <span className="text-sm text-gray-600">
                                Pack
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-green-600">
                                45
                              </span>
                              <span className="text-sm text-gray-600">
                                Piece
                              </span>
                            </div>
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
    </div>
  );
};
