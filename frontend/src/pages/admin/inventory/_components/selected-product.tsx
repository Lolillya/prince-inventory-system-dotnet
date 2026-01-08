import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { Separator } from "@/components/separator";
import { SupplierBatchCard } from "./supplier-batch-card";

export const SelectedProduct = (product: InventoryProductModel) => {
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

      <div>
        <div className="flex justify-between items-center">
          <h3>Assocciated Preset</h3>
          <span className="text-sm hover:underline cursor-pointer">
            Add Unit Preset
          </span>
        </div>
        <Separator orientation="horizontal" />
        <div className="rounded-lg border inset-shadow-sm p-1">
          <div className="flex items-center gap-2 border bg-wash-gray p-2 rounded-lg cursor-default">
            <span>Box</span>
            <span> &gt;</span>
            <span>Cases</span>
            <span> &gt;</span>
            <span>Pieces</span>
          </div>
        </div>

        <div className="rounded-lg border inset-shadow-sm p-1">
          <div className="flex items-center gap-2 border bg-wash-gray p-2 rounded-lg">
            <span className="text-sm font-semibold">
              No associated unit preset.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
