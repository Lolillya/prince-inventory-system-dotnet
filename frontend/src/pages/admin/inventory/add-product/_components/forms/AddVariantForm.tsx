import * as yup from "yup";
import { addNewVariantService } from "@/features/inventory/add-new-variant/add-new-variant.service";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

const schema = yup.object().shape({
  variant_Name: yup.string().required("Variant name is required"),
});

type AddVariantFormValues = {
  variant_Name: string;
};

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

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AddVariantFormValues>({
    resolver: yupResolver(schema),
  });

  const handleAddVariant = async (data: AddVariantFormValues) => {
    addNewVariantService(data.variant_Name);
    setIsVariantModalOpen(false);
    setIsAddProductModalOpen(true);
    reset();
  };

  return (
    <form
      className=" flex flex-col gap-5 overflow-y-scroll flex-1 justify-between"
      onSubmit={handleSubmit(handleAddVariant)}
    >
      <div>
        <label htmlFor="variant_Name" className="block text-sm font-medium">
          Variant Name
        </label>
        <input
          id="variant_Name"
          type="text"
          className="w-full drop-shadow-none bg-custom-gray p-2"
          {...register("variant_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {errors.variant_Name?.message}
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
