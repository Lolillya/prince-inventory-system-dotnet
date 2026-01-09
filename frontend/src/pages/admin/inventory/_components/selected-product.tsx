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
        <div className="flex gap-3">
          <span>{product.product.product_Name}</span>
          <span>-</span>
          <span>{product.brand.brandName}</span>
          <span>-</span>
          <span>{product.variant.variant_Name}</span>
        </div>

        <span className="bg-teal-200 rounded-full py-1 px-2 items-center flex text-center justify-center text-xs">
          category
        </span>
      </div>

      <div className="flex gap-1">
        <label>ID: </label>
        <span>{product.product.product_Name}</span>
      </div>

      <div className="flex flex-col">
        <label>notes</label>
        <textarea disabled value={product.product.description} rows={2} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex w-full justify-between">
            <label># batches</label>
            <span>view all</span>
          </div>
          <Separator />
        </div>

        <SupplierBatchCard />
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

        <div className="rounded-lg border inset-shadow-sm p-1">
          <div className="flex items-center gap-2 border bg-wash-gray p-2 rounded-lg">
            {product.unitPresets.length === 0 ? (
              <span className="text-sm font-semibold">
                No associated unit preset.
              </span>
            ) : (
              product.unitPresets.map((u, i) => (
                <div
                  className="flex items-center gap-2 border bg-wash-gray p-2 rounded-lg cursor-default"
                  key={i}
                >
                  {u.preset.presetLevels.map((level, idx) => (
                    <>
                      <span>{level.unitOfMeasure.uom_Name}</span>
                      {idx < u.preset.presetLevels.length - 1 && (
                        <span>&gt;</span>
                      )}
                    </>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
