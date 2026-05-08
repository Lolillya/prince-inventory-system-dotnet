import * as yup from "yup";
import { UseProductFieldsQuery } from "@/features/inventory/get-product-fields.query";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { EditProductUnitCard } from "./_components/edit-product-unit-card";
import { useEditProductMutation } from "@/features/inventory/edit-product/edit-product.mutation";
import { EditProductPayload } from "@/features/inventory/edit-product/edit-product-payload.model";
import { Plus } from "lucide-react";

const schema = yup.object().shape({
  productName: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  productCode: yup.string().required("Product code is required"),
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
  unitPresets: yup.array().of(
    yup.object().shape({
      low_Stock_Level: yup
        .number()
        .transform((value, originalValue) =>
          String(originalValue).trim() === "" ? undefined : value,
        )
        .typeError("Must be a number")
        .positive("Must be a positive number")
        .integer("Must be a whole number")
        .required("Low stock level is required"),
      very_Low_Stock_Level: yup
        .number()
        .transform((value, originalValue) =>
          String(originalValue).trim() === "" ? undefined : value,
        )
        .typeError("Must be a number")
        .positive("Must be a positive number")
        .integer("Must be a whole number")
        .required("Very low stock level is required"),
    }),
  ),
});

interface EditProductFormProps {
  selectedProduct: InventoryProductModel;
  onEditSuccess: () => void;
  handleAddPackagingPreset: () => void;
  setIsEditProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditProductForm = ({
  selectedProduct,
  onEditSuccess,
  handleAddPackagingPreset,
  setIsEditProductModalOpen,
}: EditProductFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      productName: selectedProduct.product.product_Name,
      description: selectedProduct.product.description,
      productCode: selectedProduct.product.product_Code,
      brand_ID: selectedProduct.brand.brand_ID,
      category_Id: selectedProduct.category.category_ID,
      variant_Id: selectedProduct.variant.variant_ID,
      unitPresets: selectedProduct.unitPresets.map((u) => ({
        low_Stock_Level: u.low_Stock_Level,
        very_Low_Stock_Level: u.very_Low_Stock_Level,
      })),
    },
  });

  const { data: productFields, isLoading: productFieldsLoading } =
    UseProductFieldsQuery();

  const { mutate: editProduct, isPending } = useEditProductMutation();

  const onSubmit = (data: any) => {
    const payload: EditProductPayload = {
      productName: data.productName,
      description: data.description,
      productCode: data.productCode,
      brand_ID: data.brand_ID,
      category_Id: data.category_Id,
      variant_Id: data.variant_Id,
      unitPresets: selectedProduct.unitPresets.map((preset, index) => ({
        product_Preset_ID: preset.product_Preset_ID,
        low_Stock_Level: data.unitPresets[index].low_Stock_Level,
        very_Low_Stock_Level: data.unitPresets[index].very_Low_Stock_Level,
      })),
    };

    console.log("Submitting Edit Product Payload:", payload);
    editProduct(payload, {
      onSuccess: () => {
        onEditSuccess();
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-5 overflow-y-hidden flex-1"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col space-y-4 mb-auto">
        {/* PRODUCT CODE */}
        <div className="flex flex-col">
          <label
            htmlFor="productCode"
            className="block text-sm font-semibold text-nowrap text-green-600"
          >
            Product Code (Auto-generated)
          </label>
          <span className="text-green-600 text-lg font-semibold my-1">
            {watch("productCode") || "N/A"}
          </span>
          <span className="text-red-500 text-xs normal-case">
            {errors.productCode?.message}
          </span>
        </div>

        {/* ITEM */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium">
            Item
          </label>
          <input
            id="productName"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2 text-gray-400"
            {...register("productName")}
            disabled
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.productName?.message}
          </span>
        </div>

        {/* BRANDS */}
        <div className="flex gap-2 items-center w-full">
          <div className="w-full">
            <label htmlFor="Brand_ID" className="block text-sm font-medium">
              Brand
            </label>
            <div className="flex items-center gap-2">
              <select
                id="Brand_ID"
                className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white text-gray-400"
                disabled={true}
                value={watch("brand_ID")}
                {...register("brand_ID")}
              >
                <option value="">Select a brand...</option>
                {productFields?.brands.map((b) => (
                  <option key={b.brand_ID} value={b.brand_ID}>
                    {b.brandName}
                  </option>
                ))}
              </select>
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
              className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white text-gray-400"
              disabled={true}
              value={watch("variant_Id")}
              {...register("variant_Id")}
            >
              <option value="">Select a variant...</option>
              {productFields?.variants.map((v) => (
                <option key={v.variant_ID} value={v.variant_ID}>
                  {v.variant_Name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-red-500 text-xs normal-case">
            {/* {errors.variant_Id?.message} */}
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
              value={watch("category_Id")}
              {...register("category_Id")}
            >
              <option value="">Select a category...</option>{" "}
              {productFields?.categories.map((c) => (
                <option key={c.category_ID} value={c.category_ID}>
                  {c.category_Name}
                </option>
              ))}
            </select>
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
            className="w-full p-2 rounded-lg "
            {...register("description")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.description?.message}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 h-full overflow-y-hidden">
        <div className="flex gap-2 items-center">
          <label>Packaging Preset(s)</label>
          <span className="text-sm text-gray-500">
            - {selectedProduct.unitPresets.length || 0} preset(s) found
          </span>
        </div>

        <div className="w-full inset-shadow-sm border rounded-lg p-2 flex flex-col gap-2 overflow-y-scroll flex-1">
          {selectedProduct.unitPresets.length === 0 ? (
            <div className="p-2 rounded-lg shadow-sm border flex items-center">
              <span className="text-vesper-gray text-sm font-semibold p-2">
                No presets found
              </span>
            </div>
          ) : (
            selectedProduct.unitPresets.map((u, i) => (
              <EditProductUnitCard
                selectedProduct={u}
                register={register}
                index={i}
                errors={errors}
                key={i}
              />
            ))
          )}
          <div
            className="px-2 py-4 rounded-lg border border-border bg-custom-gray-lighter inset-shadow-sm flex items-center justify-center cursor-pointer"
            onClick={handleAddPackagingPreset}
          >
            <label className="text-gray-400 text-sm tracking-wider font-semibold text-center flex gap-2 items-center cursor-pointer">
              <Plus size={18} />
              Add Another Packaging Preset to this Product
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-between items-center">
        <button
          type="button"
          onClick={() => setIsEditProductModalOpen(false)}
          className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium"
        >
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
          {isPending ? "Updating..." : "Confirm Edit"}
        </button>
      </div>
    </form>
  );
};
