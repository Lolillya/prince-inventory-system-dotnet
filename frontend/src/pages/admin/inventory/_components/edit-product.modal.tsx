import { XIcon } from "@/icons";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { EditProductForm } from "./forms/edit-product.form";

interface EditProductModalProps {
  setIsEditProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct: InventoryProductModel;
}

--- frontend / src / pages / admin / inventory / _components / edit - product.modal.tsx(原始)
import { XIcon } from "@/icons";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { EditProductForm } from "./forms/edit-product.form";

interface EditProductModalProps {
  setIsEditProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct: InventoryProductModel;
}

export const EditProductModal = ({
  setIsEditProductModalOpen,
  selectedProduct,
}: EditProductModalProps) => {
  const handleCloseModal = () => {
    setIsEditProductModalOpen(false);
  };
  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div className="absolute top-4 right-4" onClick={handleCloseModal}>
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-gray-500">
              Fill in the details to edit the product in the inventory.
            </p>
          </div>
        </div>

        <EditProductForm selectedProduct={selectedProduct} />
      </div>
    </div>
  );
};

+++ frontend / src / pages / admin / inventory / _components / edit - product.modal.tsx(修改后)
import { XIcon } from "@/icons";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { EditProductForm } from "./forms/edit-product.form";

interface EditProductModalProps {
  setIsEditProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct: InventoryProductModel;
}

export const EditProductModal = ({
  setIsEditProductModalOpen,
  selectedProduct,
}: EditProductModalProps) => {
  const handleCloseModal = () => {
    setIsEditProductModalOpen(false);
  };
  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div className="absolute top-4 right-4" onClick={handleCloseModal}>
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-gray-500">
              Fill in the details to edit the product in the inventory.
            </p>
          </div>
        </div>

        <EditProductForm selectedProduct={selectedProduct} setIsEditProductModalOpen={setIsEditProductModalOpen} />
      </div>
    </div>
  );
};