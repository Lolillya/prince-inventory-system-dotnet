import * as yup from "yup";
import { addNewCategoryService } from "@/features/inventory/add-new-category/add-new-category.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

const schema = yup.object().shape({
  category_Name: yup.string().required("Category name is required"),
});

type AddCategoryFormValues = {
  category_Name: string;
};

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

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AddCategoryFormValues>({
    resolver: yupResolver(schema),
  });

  const handleAddCategory = async (data: AddCategoryFormValues) => {
    addNewCategoryService(data.category_Name);
    setIsCategoryModalOpen(false);
    setIsAddProductModalOpen(true);
    reset();
  };

  return (
    <form
      className=" flex flex-col gap-5 overflow-y-scroll flex-1 justify-between"
      onSubmit={handleSubmit(handleAddCategory)}
    >
      <div>
        <label htmlFor="category_Name" className="block text-sm font-medium">
          Category Name
        </label>
        <input
          id="category_Name"
          type="text"
          className="w-full drop-shadow-none bg-custom-gray p-2"
          {...register("category_Name")}
        />
        <span className="text-red-500 text-xs normal-case">
          {errors.category_Name?.message}
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
