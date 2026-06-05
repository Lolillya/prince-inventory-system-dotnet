import { XIcon } from "@/icons";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { EditProductForm } from "./forms/edit-product.form";
import { AddCategoryForm } from "./forms/_components/AddCategoryForm";
import { useState } from "react";

interface EditProductModalProps {
  setIsEditProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct: InventoryProductModel;
  handleAddPackagingPreset: () => void;
  isEditProductModalOpen: boolean;
}

export const EditProductModal = ({
  handleAddPackagingPreset,
  setIsEditProductModalOpen,
  isEditProductModalOpen,
  selectedProduct,
}: EditProductModalProps) => {
  const handleCloseModal = () => {
    setIsEditProductModalOpen(false);
  };

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditProductFormOpen, setIsEditProductFormOpen] = useState(true);

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

        {isEditProductFormOpen && (
          <EditProductForm
            selectedProduct={selectedProduct}
            handleAddPackagingPreset={handleAddPackagingPreset}
            onEditSuccess={handleCloseModal}
            isEditProductModalOpen={isEditProductModalOpen}
            setIsEditProductModalOpen={setIsEditProductModalOpen}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            isCategoryModalOpen={isCategoryModalOpen}
            setIsEditProductFormOpen={setIsEditProductFormOpen}
            isEditProductFormOpen={isEditProductFormOpen}
          />
        )}

        {isCategoryModalOpen && (
          <AddCategoryForm
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            isCategoryModalOpen={isCategoryModalOpen}
            isEditProductFormOpen={isEditProductFormOpen}
            setIsEditProductFormOpen={setIsEditProductFormOpen}
          />
        )}
      </div>
    </div>
  );
};
