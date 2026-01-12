import { InventoryProductModel } from "@/features/inventory/models/inventory.model";

interface EditProductUnitCardProps {
  selectedProduct: InventoryProductModel;
}

export const EditProductUnitCard = ({
  selectedProduct,
}: EditProductUnitCardProps) => {
  console.log(selectedProduct);

  return (
    <div className="p-2 rounded-lg shadow-sm border flex items-center">
      <div className="flex gap-1 w-[30%]">
        <span>Box</span>
        <span>&gt;</span>
        <span>Cases</span>
        <span>&gt;</span>s<span>Pieces</span>
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="bg-bellflower-gray rounded-lg flex items-center px-3 gap-2 w-40">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-300 shrink-0"></div>

          <input
            className="w-full bg-bellflower-gray shadow-none drop-shadow-none text-xs font-semibold placeholder:font-semibold text-saltbox-gray "
            placeholder="Low Stock"
          />
        </div>

        <div className="bg-bellflower-gray rounded-lg flex items-center px-3 gap-2 w-40">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300 shrink-0"></div>

          <input
            className="w-full bg-bellflower-gray shadow-none drop-shadow-none text-xs font-semibold placeholder:font-semibold text-saltbox-gray "
            placeholder="Very Low Stock"
          />
        </div>
      </div>
    </div>
  );
};
