import AddProductForm from "./forms/AddProductForm";
import { XIcon } from "@/icons";
import { Separator } from "@/components/separator";
import { useState } from "react";
import { AddBrandForm } from "./forms/AddBrandForm";
import { AddCategoryForm } from "./forms/AddCategoryForm";
import { AddVariantForm } from "./forms/AddVariantForm";

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
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(true);

  const addProductHeader = "Add New Product";
  const addBrandHeader = "Add New Brand";
  const addCategoryHeader = "Add New Category";
  const addVariantHeader = "Add New Variant";

  const addProductInstructions =
    "Fill in the details to add a new product to the inventory.";
  const addBrandInstructions =
    "Fill in the details to add a new brand to the inventory.";
  const addCategoryInstructions =
    "Fill in the details to add a new category to the inventory.";
  const addVariantInstructions =
    "Fill in the details to add a new variant to the inventory.";

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
              {isAddProductModalOpen && addProductHeader}
              {isBrandModalOpen && addBrandHeader}
              {isCategoryModalOpen && addCategoryHeader}
              {isVariantModalOpen && addVariantHeader}
            </h1>
            <p className="text-gray-500">
              {isAddProductModalOpen && addProductInstructions}
              {isBrandModalOpen && addBrandInstructions}
              {isCategoryModalOpen && addCategoryInstructions}
              {isVariantModalOpen && addVariantInstructions}
            </p>
          </div>
        </div>

        <Separator />
        {isAddProductModalOpen && (
          <AddProductForm
            // BOOLEAN
            isBrandModalOpen={isBrandModalOpen}
            isCategoryModalOpen={isCategoryModalOpen}
            isVariantModalOpen={isVariantModalOpen}
            isAddProductModalOpen={isAddProductModalOpen}
            // SETTER FUNCTIONS
            setIsBrandModalOpen={setIsBrandModalOpen}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            setIsVariantModalOpen={setIsVariantModalOpen}
            setIsAddProductModalOpen={setIsAddProductModalOpen}
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
      </div>
    </div>
  );
};
