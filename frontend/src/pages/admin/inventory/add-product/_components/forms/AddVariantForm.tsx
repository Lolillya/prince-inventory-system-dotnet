interface AddVariantFormProps {
  setIsVariantModalOpen: (isOpen: boolean) => void;
  setIsAddProductModalOpen: (isOpen: boolean) => void;
}

export const AddVariantForm = ({
  setIsVariantModalOpen,
  setIsAddProductModalOpen,
}: AddVariantFormProps) => {
  const handleCancel = () => {
    setIsVariantModalOpen(false);
    setIsAddProductModalOpen(true);
  };

  return (
    <form className=" flex flex-col gap-5 overflow-y-scroll flex-1 justify-between">
      <div>
        <label htmlFor="variant_Name" className="block text-sm font-medium">
          Variant Name
        </label>
        <input
          id="variant_Name"
          type="text"
          className="w-full drop-shadow-none bg-custom-gray p-2"
          // {...register("brand_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {/* {errors.brand_Name?.message} */}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="submit">Add Variant</button>
        <button type="button" className="input-style-3" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
