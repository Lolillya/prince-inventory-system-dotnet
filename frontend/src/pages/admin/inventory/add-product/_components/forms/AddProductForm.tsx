import * as yup from "yup";
import { useAuth } from "@/context/use-auth";
import { updateAddProductPayload } from "@/features/inventory/add-product.query";
import { UseProductFieldsQuery } from "@/features/inventory/get-product-fields.query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { addProductService } from "@/features/inventory/add-product.service";
import { Info } from "lucide-react";
import { toast } from "sonner";

const schema = yup.object().shape({
  item_Id: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value,
    )
    .required("Item is required"),
  description: yup.string(),
  brand_ID: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value,
    )
    .required("Brand is required"),
  category_Id: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value,
    )
    .required("Category is required"),
  variant_Id: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value,
    )
    .required("Variant is required"),
});

type AddProductFormValues = {
  item_Id: number;
  description?: string;
  brand_ID: number;
  category_Id: number;
  variant_Id: number;
};

interface AddProductFormProps {
  isBrandModalOpen: boolean;
  isCategoryModalOpen: boolean;
  isVariantModalOpen: boolean;
  isItemModalOpen: boolean;
  isAddProductModalOpen: boolean;

  setIsBrandModalOpen: (isOpen: boolean) => void;
  setIsCategoryModalOpen: (isOpen: boolean) => void;
  setIsVariantModalOpen: (isOpen: boolean) => void;
  setIsItemModalOpen: (isOpen: boolean) => void;
  setIsAddProductModalOpen: (isOpen: boolean) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

const AddProductForm = ({
  isBrandModalOpen,
  isCategoryModalOpen,
  isVariantModalOpen,
  isItemModalOpen,
  isAddProductModalOpen,
  setIsBrandModalOpen,
  setIsCategoryModalOpen,
  setIsVariantModalOpen,
  setIsItemModalOpen,
  setIsAddProductModalOpen,
  setIsModalOpen,
}: AddProductFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    resolver: yupResolver(schema),
  });

  const { user } = useAuth();
  const { data: productFields, isLoading: productFieldsLoading } =
    UseProductFieldsQuery();

  const { UPDATE_ADD_PRODUCT_PAYLOAD } = updateAddProductPayload();

  const [generatedProductCode, setGeneratedProductCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch form fields for auto-generation
  const watchedItemId = watch("item_Id");
  const watchedBrandId = watch("brand_ID");
  const watchedVariantId = watch("variant_Id");

  // Function to generate product code
  const generateProductCode = () => {
    if (!watchedItemId || !watchedBrandId || !watchedVariantId) {
      setGeneratedProductCode("");
      return;
    }

    const itemCode = String(watchedItemId).padStart(3, "0");
    const brandCode = String(watchedBrandId).padStart(3, "0");
    const variantCode = String(watchedVariantId).padStart(4, "0");

    setGeneratedProductCode(`${itemCode}-${brandCode}-${variantCode}`);
  };

  const handleReset = () => {
    reset();

    setIsModalOpen(false);
  };

  // Auto-generate code when dependencies change
  useEffect(() => {
    generateProductCode();
  }, [watchedItemId, watchedBrandId, watchedVariantId]);

  const onSubmit = async (data: AddProductFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        productCode: generatedProductCode || "",
        inventory_Clerk: user?.user_ID || "",
      };

      UPDATE_ADD_PRODUCT_PAYLOAD(payload);

      await addProductService(payload);

      toast.success("Product added successfully!");

      reset();
      setGeneratedProductCode("");
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(
        error?.response?.data || "Failed to add product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenNewBrandModal = () => {
    setIsAddProductModalOpen(!isAddProductModalOpen);
    setIsBrandModalOpen(!isBrandModalOpen);
  };

  const handleOpenNewCategoryModal = () => {
    setIsAddProductModalOpen(!isAddProductModalOpen);
    setIsCategoryModalOpen(!isCategoryModalOpen);
  };

  const handleOpenNewVariantModal = () => {
    setIsAddProductModalOpen(!isAddProductModalOpen);
    setIsVariantModalOpen(!isVariantModalOpen);
  };

  const handleOpenNewItemModal = () => {
    setIsAddProductModalOpen(!isAddProductModalOpen);
    setIsItemModalOpen(!isItemModalOpen);
  };

  return (
    <form
      className=" flex flex-col gap-5 overflow-y-scroll flex-1"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col space-y-4 mb-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <label className="text-nowrap text-sm font-semibold">
              Product Code: (Auto-generated)
            </label>
            <div className="relative inline-flex items-center group">
              <Info className="w-4 h-4 text-gray-400" />
              <span className="invisible absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:visible">
                Product Code = Item - Brand - Variant
              </span>
            </div>
          </div>
          <span className="text-lg font-semibold" style={{ color: "#00b69b" }}>
            {generatedProductCode || "xxx-xxx-xxxx"}
          </span>
          <span className="text-green-600 text-xs normal-case">
            Fill in the fields below to generate
          </span>
        </div>
        <div>
          <label htmlFor="item_Id" className="block text-sm font-medium">
            Item
          </label>
          <div className="flex items-center gap-2">
            <select
              id="item_Id"
              className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
              disabled={productFieldsLoading}
              {...register("item_Id")}
            >
              <option value="">Select an item...</option>
              {productFields?.items?.map((item) => (
                <option key={item.item_ID} value={item.item_ID}>
                  {item.itemName}
                </option>
              ))}
            </select>
            <button
              className="input-style-3"
              onClick={handleOpenNewItemModal}
              type="button"
            >
              Add Item +
            </button>
          </div>
          <span className="text-red-500 text-xs normal-case">
            {errors.item_Id?.message}
          </span>
        </div>

        {/* PRODUCT CODE */}

        {/* BRANDS */}
        <div className="flex gap-2 items-center w-full">
          <div className="w-full">
            <label htmlFor="Brand_ID" className="block text-sm font-medium">
              Brand
            </label>
            <div className="flex items-center gap-2">
              <select
                id="Brand_ID"
                className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
                disabled={productFieldsLoading}
                {...register("brand_ID")}
              >
                <option value="">Select a brand...</option>
                {productFields?.brands.map((b) => (
                  <option key={b.brand_ID} value={b.brand_ID}>
                    {b.brandName}
                  </option>
                ))}
              </select>

              <button
                className="input-style-3"
                onClick={handleOpenNewBrandModal}
                type="button"
              >
                Add Brand +
              </button>
            </div>
            <span className="text-red-500 text-xs normal-case">
              {errors.brand_ID?.message}
            </span>
          </div>
        </div>

        {/* VARIANT */}
        <div>
          <label htmlFor="variant_Id" className="block text-sm font-medium">
            Variant
          </label>
          <div className="flex items-center gap-2">
            <select
              id="variant_Id"
              className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
              disabled={productFieldsLoading}
              {...register("variant_Id")}
            >
              <option value="">Select a variant...</option>
              {productFields?.variants.map((v) => (
                <option key={v.variant_ID} value={v.variant_ID}>
                  {v.variant_Name}
                </option>
              ))}
            </select>

            <button
              className="input-style-3"
              onClick={handleOpenNewVariantModal}
              type="button"
            >
              Add Variant +
            </button>
          </div>
          <span className="text-red-500 text-xs normal-case">
            {errors.variant_Id?.message}
          </span>
        </div>

        {/* CATEGORY */}
        <div>
          <label htmlFor="category_Id" className="block text-sm font-medium">
            Category
          </label>
          <div className="flex items-center gap-2">
            <select
              id="category_Id"
              className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
              disabled={productFieldsLoading}
              {...register("category_Id")}
            >
              <option value="">Select a category...</option>{" "}
              {productFields?.categories.map((c) => (
                <option key={c.category_ID} value={c.category_ID}>
                  {c.category_Name}
                </option>
              ))}
            </select>

            <button
              className="input-style-3"
              onClick={handleOpenNewCategoryModal}
              type="button"
            >
              Add Category +
            </button>
          </div>
          <span className="text-red-500 text-xs normal-case">
            {errors.category_Id?.message}
          </span>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            className="w-full p-2 rounded-lg bg-custom-bg-white"
            placeholder="Enter product description..."
            {...register("description")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.description?.message}
          </span>
          <div className="border-t border-gray-300 mt-4"></div>
        </div>
      </div>

      <div className="flex gap-2 justify-between items-center">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 disabled:opacity-50"
        >
          {isSubmitting ? "Adding Product..." : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default AddProductForm;
