import * as yup from "yup";
import { addNewBrandService } from "@/features/inventory/add-new-brand/add-new-brand.service";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  brand_Name: yup.string().required("Brand name is required"),
});

type AddBrandFormValues = {
  brand_Name: string;
};

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

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AddBrandFormValues>({
    resolver: yupResolver(schema),
  });

  const handleAddBrand = async (data: AddBrandFormValues) => {
    addNewBrandService(data.brand_Name);
    setIsBrandModalOpen(false);
    setIsAddProductModalOpen(true);
    reset();
  };

  return (
    <form
      className=" flex flex-col gap-5 overflow-y-scroll flex-1 justify-between"
      onSubmit={handleSubmit(handleAddBrand)}
    >
      <div>
        <label htmlFor="brand_Name" className="block text-sm font-medium">
          Brand Name
        </label>
        <input
          id="brand_Name"
          type="text"
          className="w-full drop-shadow-none bg-custom-gray p-2"
          {...register("brand_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {errors.brand_Name?.message}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="submit">Add Brand</button>
        <button type="button" className="input-style-3" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};
