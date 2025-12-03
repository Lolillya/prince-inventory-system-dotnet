import { addNewVariantService } from "@/features/inventory/add-new-variant/add-new-variant.service";
import { useState } from "react";
import { set } from "react-hook-form";

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

  const [variantName, setVariantName] = useState<string>("");

  const handleAddVariant = async (event: React.FormEvent) => {
    addNewVariantService(variantName);
    setIsVariantModalOpen(false);
    setIsAddProductModalOpen(true);
    event.preventDefault();
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
          onChange={(e) => setVariantName(e.target.value)}
          // {...register("brand_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {/* {errors.brand_Name?.message} */}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="submit" onClick={handleAddVariant}>
          Add Variant
        </button>
        <button type="button" className="input-style-3" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
