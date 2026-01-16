import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { Separator } from "@/components/separator";
import { SupplierBatchCard } from "./supplier-batch-card";

interface SelectedProductProps {
  product: InventoryProductModel;
  handlePresetSelector: () => void;
}

export const SelectedProduct = ({
  product,
  handlePresetSelector,
}: SelectedProductProps) => {
  console.log(product);
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-between w-full">
        <div className="flex gap-1">
          <span className="text-sm">{product.product.product_Name}</span>
          <span className="text-sm">-</span>
          <span className="text-sm">{product.brand.brandName}</span>
          <span className="text-sm">-</span>
          <span className="text-sm">{product.variant.variant_Name}</span>
        </div>

        <span className="bg-teal-200 rounded-full py-1 px-2 items-center flex text-center justify-center text-xs text-nowrap">
          {product.category.category_Name}
        </span>
      </div>

      {/* <div className="flex gap-1">
        <label>ID: </label>
        <span>{product.product.product_Name}</span>
      </div> */}

      <div className="flex flex-col">
        <label>notes</label>
        <textarea disabled value={product.product.description} rows={2} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex w-full justify-between">
            <label>{product.restockInfo.length} batches</label>
            <span>view all</span>
          </div>
          <Separator />
        </div>

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
                <div
                  className="flex flex-col gap-2 bg-wash-gray text-sm rounded-lg cursor-default w-full"
                  key={i}
                >
                  <div className="w-full flex">
                    <div className="w-full flex gap-2 items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                    <div className="w-full flex gap-4">
                      <label>Total Batches:</label>
                      <span>{product.restockInfo.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-saltbox-gray font-semibold">
                      unit conversions
                    </label>
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
                      {product.restockInfo.map((b, idx) =>
                        b.presetPricing.map((pp, pidx) => (
                          <div
                            className="flex gap-2 items-center"
                            key={`${idx}-${pidx}`}
                          >
                            <span className="text-sm text-saltbox-gray">
                              {pp.unitName} Price:{" "}
                            </span>
                            <span className="text-sm text-saltbox-gray font-semibold">
                              ${pp.price_Per_Unit.toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
