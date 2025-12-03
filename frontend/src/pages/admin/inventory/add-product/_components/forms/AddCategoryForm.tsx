import { addNewCategoryService } from "@/features/inventory/add-new-category/add-new-category.service";
import { useState } from "react";

interface AddCategoryFormProps {
  setIsCategoryModalOpen: (isOpen: boolean) => void;
  setIsAddProductModalOpen: (isOpen: boolean) => void;
}

export const AddCategoryForm = ({
  setIsCategoryModalOpen,
  setIsAddProductModalOpen,
}: AddCategoryFormProps) => {
  const handleCancel = () => {
    setIsCategoryModalOpen(false);
    setIsAddProductModalOpen(true);
  };

  const [categoryName, setCategoryName] = useState<string>("");

  const handleAddCategory = async (event: React.FormEvent) => {
    addNewCategoryService(categoryName);
    setIsCategoryModalOpen(false);
    setIsAddProductModalOpen(true);
    event.preventDefault();
  };

  return (
    <form className=" flex flex-col gap-5 overflow-y-scroll flex-1 justify-between">
      <div>
        <label htmlFor="category_Name" className="block text-sm font-medium">
          Category Name
        </label>
        <input
          id="category_Name"
          type="text"
          className="w-full drop-shadow-none bg-custom-gray p-2"
          onChange={(e) => setCategoryName(e.target.value)}
          // {...register("brand_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {/* {errors.brand_Name?.message} */}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="submit" onClick={handleAddCategory}>
          Add Category
        </button>
        <button type="button" className="input-style-3" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
