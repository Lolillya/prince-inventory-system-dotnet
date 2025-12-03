import { addNewBrandService } from "@/features/inventory/add-new-brand/add-new-brand.service";
import { useState } from "react";

interface AddBrandFormProps {
  setIsBrandModalOpen: (isOpen: boolean) => void;
  setIsAddProductModalOpen: (isOpen: boolean) => void;
}

export const AddBrandForm = ({
  setIsBrandModalOpen,
  setIsAddProductModalOpen,
}: AddBrandFormProps) => {
  const handleCancel = () => {
    setIsBrandModalOpen(false);
    setIsAddProductModalOpen(true);
  };

  const [brandName, setBrandName] = useState<string>("");

  const handleAddBrand = async (event: React.FormEvent) => {
    addNewBrandService(brandName);
    setIsBrandModalOpen(false);
    setIsAddProductModalOpen(true);
    event.preventDefault();
  };

  return (
    <form className=" flex flex-col gap-5 overflow-y-scroll flex-1 justify-between">
      <div>
        <label htmlFor="brand_Name" className="block text-sm font-medium">
          Brand Name
        </label>
        <input
          id="brand_Name"
          type="text"
          className="w-full drop-shadow-none bg-custom-gray p-2"
          onChange={(e) => setBrandName(e.target.value)}
          // {...register("brand_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {/* {errors.brand_Name?.message} */}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="submit" onClick={handleAddBrand}>
          Add Brand
        </button>
        <button type="button" className="input-style-3" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
