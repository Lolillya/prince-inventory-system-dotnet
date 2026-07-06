import AddProductForm from "./forms/AddProductForm";
import { XIcon } from "@/icons";
import { Separator } from "@/components/separator";
import { useState, useEffect } from "react";
import { AddBrandForm } from "./forms/AddBrandForm";
import { AddCategoryForm } from "./forms/AddCategoryForm";
import { AddVariantForm } from "./forms/AddVariantForm";
import { AddItemForm } from "./forms/AddItemForm";

interface AddProductModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const AddProductModal = ({
  isModalOpen,
  setIsModalOpen,
}: AddProductModalProps) => {
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(true);

  useEffect(() => {
    if (isModalOpen) {
      setIsBrandModalOpen(false);
      setIsCategoryModalOpen(false);
      setIsVariantModalOpen(false);
      setIsItemModalOpen(false);
      setIsAddProductModalOpen(true);
    }
  }, [isModalOpen]);

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div
            className="absolute top-4 right-4"
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">
              {isAddProductModalOpen && "Add New Product"}
              {isBrandModalOpen && "Add New Brand"}
              {isCategoryModalOpen && "Add New Category"}
              {isVariantModalOpen && "Add New Variant"}
              {isItemModalOpen && "Add New Item"}
            </h1>
            <p className="text-gray-500">
              {isAddProductModalOpen &&
                "Fill in the details to add a new product to the inventory."}
              {isBrandModalOpen &&
                "Fill in the details to add a new brand to the inventory."}
              {isCategoryModalOpen &&
                "Fill in the details to add a new category to the inventory."}
              {isVariantModalOpen &&
                "Fill in the details to add a new variant to the inventory."}
              {isItemModalOpen &&
                "Fill in the details to add a new item to the inventory."}
            </p>
          </div>
        </div>

        <Separator />
        {isAddProductModalOpen && (
          <AddProductForm
            isBrandModalOpen={isBrandModalOpen}
            isCategoryModalOpen={isCategoryModalOpen}
            isVariantModalOpen={isVariantModalOpen}
            isItemModalOpen={isItemModalOpen}
            isAddProductModalOpen={isAddProductModalOpen}
            setIsBrandModalOpen={setIsBrandModalOpen}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            setIsVariantModalOpen={setIsVariantModalOpen}
            setIsItemModalOpen={setIsItemModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        )}

        {isBrandModalOpen && (
          <AddBrandForm
            setIsBrandModalOpen={setIsBrandModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
          />
        )}

        {isCategoryModalOpen && (
          <AddCategoryForm
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
          />
        )}

        {isVariantModalOpen && (
          <AddVariantForm
            setIsVariantModalOpen={setIsVariantModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
          />
        )}

        {isItemModalOpen && (
          <AddItemForm
            setIsItemModalOpen={setIsItemModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
          />
        )}
      </div>
    </div>
  );
};
