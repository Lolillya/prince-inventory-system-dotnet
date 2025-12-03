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
          // {...register("brand_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {/* {errors.brand_Name?.message} */}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="submit">Add Category</button>
        <button type="button" className="input-style-3" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
