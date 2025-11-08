import { Separator } from "../../../../components/separator";
import { ChevronUpIcon } from "../../../../icons";
import { InventoryProductModel } from "../../../../models/inventory.model";

export const SelectedProduct = (product: InventoryProductModel) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-between w-full">
        <div className="flex gap-3">
          <span>{product.product.productName}</span>
          <span>-</span>
          <span>{product.brand.brandName}</span>
          <span>-</span>
          <span>{product.variant.variantName}</span>
        </div>

        <span className="bg-teal-200 rounded-full py-1 px-2 items-center flex text-center justify-center text-xs">
          category
        </span>
      </div>

      <div className="flex gap-1">
        <label>ID: </label>
        <span>{product.product.productName}</span>
      </div>

      <div className="flex flex-col gap-3">
        <label>notes</label>
        <textarea placeholder="some description" rows={4} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex w-full justify-between">
            <label># batches</label>
            <span>view all</span>
          </div>
          <Separator />
        </div>

        <div className="flex rounded-lg border">
          <span className="p-5 bg-red-300 rounded-l-lg">1</span>
          <div className="w-full p-5 bg-white rounded-r-lg">
            <div className="flex w-full justify-between items-center">
              <span>from SupplierName</span>
              <ChevronUpIcon />
            </div>
          </div>
        </div>

        <div className="flex rounded-lg border">
          <span className="p-5 bg-red-300 rounded-l-lg">1</span>
          <div className="w-full p-5 bg-white rounded-r-lg">
            <div className="flex w-full justify-between items-center">
              <span>from SupplierName</span>
              <ChevronUpIcon />
            </div>
          </div>
        </div>

        <div className="flex rounded-lg border">
          <span className="p-5 bg-red-300 rounded-l-lg">1</span>
          <div className="w-full p-5 bg-white rounded-r-lg">
            <div className="flex w-full justify-between items-center">
              <span>from SupplierName</span>
              <ChevronUpIcon />
            </div>
          </div>
        </div>

        <div className="flex rounded-lg border">
          <span className="p-5 bg-red-300 rounded-l-lg">1</span>
          <div className="w-full p-5 bg-white rounded-r-lg">
            <div className="flex w-full justify-between items-center">
              <span>from SupplierName</span>
              <ChevronUpIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
