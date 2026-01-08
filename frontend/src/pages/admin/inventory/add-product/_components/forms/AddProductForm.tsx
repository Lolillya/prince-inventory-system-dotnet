import * as yup from "yup";
import { useAuth } from "@/context/use-auth";
import {
  AddProductPayloadQuery,
  updateAddProductPayload,
} from "@/features/inventory/add-product.query";
import { UseProductFieldsQuery } from "@/features/inventory/get-product-fields.query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { addProductService } from "@/features/inventory/add-product.service";

const schema = yup.object().shape({
  productName: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  productCode: yup.string(),
  brand_ID: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Brand is required"),
  category_Id: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Category is required"),
  variant_Id: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Variant is required"),
});

type AddProductFormValues = {
  productName: string;
  description: string;
  productCode?: string;
  brand_ID: number;
  category_Id: number;
  variant_Id: number;
};

interface AddProductFormProps {
  isBrandModalOpen: boolean;
  isCategoryModalOpen: boolean;
  isVariantModalOpen: boolean;
  isAddProductModalOpen: boolean;

  setIsBrandModalOpen: (isOpen: boolean) => void;
  setIsCategoryModalOpen: (isOpen: boolean) => void;
  setIsVariantModalOpen: (isOpen: boolean) => void;
  setIsAddProductModalOpen: (isOpen: boolean) => void;
}

const AddProductForm = ({
  isBrandModalOpen,
  isCategoryModalOpen,
  isVariantModalOpen,
  isAddProductModalOpen,
  setIsBrandModalOpen,
  setIsCategoryModalOpen,
  setIsVariantModalOpen,
  setIsAddProductModalOpen,
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
  const { data: newProductData } = AddProductPayloadQuery();

  const [generatedProductCode, setGeneratedProductCode] = useState<string>("");

  // Watch form fields for auto-generation
  const watchedBrandId = watch("brand_ID");
  const watchedCategoryId = watch("category_Id");
  const watchedVariantId = watch("variant_Id");
  const watchedProductName = watch("productName");

  // Function to generate product code
  const generateProductCode = () => {
    if (!productFields || !watchedBrandId || !watchedVariantId) {
      setGeneratedProductCode("");
      return;
    }

    // Find selected brand, category, and variant
    const brand = productFields.brands.find(
      (b) => b.brand_ID === Number(watchedBrandId)
    );
    const category = productFields.categories.find(
      (c) => c.category_ID === Number(watchedCategoryId)
    );
    const variant = productFields.variants.find(
      (v) => v.variant_ID === Number(watchedVariantId)
    );

    if (!brand || !variant) {
      setGeneratedProductCode("");
      return;
    }

    // Extract codes from each field
    const brandCode = brand.brandName.substring(0, 4).toUpperCase();
    const variantCode = variant.variant_Name.substring(0, 3).toUpperCase();
    const categoryCode = category
      ? category.category_Name.substring(0, 2).toUpperCase()
      : "XX";

    // Extract abbreviation from product name (first 3 letters of each word)
    let nameCode = "XXX";
    if (watchedProductName && watchedProductName.trim()) {
      const words = watchedProductName.trim().split(/\s+/);
      nameCode = words
        .slice(0, 2) // Take first 2 words
        .map((word) => word.substring(0, 3).toUpperCase())
        .join("");
      // Pad or truncate to 3 characters
      nameCode = (nameCode + "XXX").substring(0, 3);
    }

    // Combine into product code: BRAND-VARIANT-CATEGORY-NAME
    const code = `${brandCode}-${variantCode}-${categoryCode}-${nameCode}`;
    setGeneratedProductCode(code);
  };

  // Auto-generate code when dependencies change
  useEffect(() => {
    generateProductCode();
  }, [
    watchedBrandId,
    watchedCategoryId,
    watchedVariantId,
    watchedProductName,
    productFields,
  ]);

  const onSubmit = (data: AddProductFormValues) => {
    UPDATE_ADD_PRODUCT_PAYLOAD({
      ...data,
      productCode: generatedProductCode || "",
      inventory_Clerk: user?.user_ID || "",
    });
    if (newProductData && user) {
      addProductService(newProductData);
      reset();
      setGeneratedProductCode("");
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

  return (
    <form
      className=" flex flex-col gap-5 overflow-y-scroll flex-1"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col space-y-4 mb-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <label className="text-nowrap text-sm font-semibold">
              Product Code:{" "}
            </label>
            <input
              className="w-full drop-shadow-none bg-custom-gray p-2"
              placeholder="AUTO GENERATED"
              value={generatedProductCode || ""}
              disabled
            />
          </div>
          <span className="text-green-600 text-xs normal-case">
            {generatedProductCode
              ? "Auto-generated based on your selections"
              : "Fill in the fields below to generate"}
          </span>
        </div>
        {/* PRODUCT NAME */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium">
            Product Name
          </label>
          <input
            id="productName"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            {...register("productName")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.productName?.message}
          </span>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            className="w-full p-2 rounded-lg "
            {...register("description")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.description?.message}
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
              >
                Add Brand +
              </button>
            </div>
            <span className="text-red-500 text-xs normal-case">
              {errors.brand_ID?.message}
            </span>
          </div>
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
            >
              Add Category +
            </button>
          </div>
          <span className="text-red-500 text-xs normal-case">
            {errors.category_Id?.message}
          </span>
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
            >
              Add Variant +
            </button>
          </div>
          <span className="text-red-500 text-xs normal-case">
            {errors.variant_Id?.message}
          </span>
        </div>
      </div>

      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProductForm;
