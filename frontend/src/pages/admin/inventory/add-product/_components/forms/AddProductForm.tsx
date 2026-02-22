import * as yup from "yup";
import { useAuth } from "@/context/use-auth";
import { updateAddProductPayload } from "@/features/inventory/add-product.query";
import { UseProductFieldsQuery } from "@/features/inventory/get-product-fields.query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { addProductService } from "@/features/inventory/add-product.service";
import { Info } from "lucide-react";
import { PresetSelectorModal } from "../preset-selector.modal";
import { AddProductUnitCard } from "./_components/add-product-unit-card";
import { useUnitPresetQuery } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.state";
import { UnitPresetLevel } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.model";
import { toast } from "sonner";

const schema = yup.object().shape({
  productName: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  productCode: yup.string(),
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
  unitPresets: yup
    .array()
    .of(
      yup.object().shape({
        preset_ID: yup.number().required(),
        low_Stock_Level: yup
          .number()
          .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? undefined : value,
          )
          .required("Low stock level is required")
          .positive("Must be greater than 0"),
        very_Low_Stock_Level: yup
          .number()
          .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? undefined : value,
          )
          .required("Very low stock level is required")
          .positive("Must be greater than 0")
          .test(
            "less-than-low-stock",
            "Very low stock must be less than low stock",
            function (value) {
              const { low_Stock_Level } = this.parent;
              if (!value || !low_Stock_Level) return true;
              return value < low_Stock_Level;
            },
          ),
      }),
    )
    .min(1, "You must assign at least 1 packaging preset"),
});

type AddProductFormValues = {
  productName: string;
  description: string;
  productCode?: string;
  brand_ID: number;
  category_Id: number;
  variant_Id: number;
  unitPresets?: Array<{
    preset_ID: number;
    low_Stock_Level: number;
    very_Low_Stock_Level: number;
  }>;
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
    setValue,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      unitPresets: [],
    },
  });

  const { user } = useAuth();
  const { data: productFields, isLoading: productFieldsLoading } =
    UseProductFieldsQuery();
  const { data: unitPresets } = useUnitPresetQuery();

  const { UPDATE_ADD_PRODUCT_PAYLOAD } = updateAddProductPayload();

  const [generatedProductCode, setGeneratedProductCode] = useState<string>("");
  const [isPresetSelectorOpen, setIsPresetSelectorOpen] = useState(false);
  const [selectedPresetIds, setSelectedPresetIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      (b) => b.brand_ID === Number(watchedBrandId),
    );
    const category = productFields.categories.find(
      (c) => c.category_ID === Number(watchedCategoryId),
    );
    const variant = productFields.variants.find(
      (v) => v.variant_ID === Number(watchedVariantId),
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

  // Handle preset selection
  const handleSelectPresets = (presetIds: number[]) => {
    setSelectedPresetIds(presetIds);

    // Update form values with selected presets
    const presetValues = presetIds.map((presetId) => ({
      preset_ID: presetId,
      low_Stock_Level: undefined as any,
      very_Low_Stock_Level: undefined as any,
    }));

    setValue("unitPresets", presetValues);
  };

  // Remove a preset
  const handleRemovePreset = (presetId: number) => {
    const newSelectedIds = selectedPresetIds.filter((id) => id !== presetId);
    setSelectedPresetIds(newSelectedIds);

    const currentPresets = watch("unitPresets") || [];
    const filteredPresets = currentPresets.filter(
      (p) => p.preset_ID !== presetId,
    );
    setValue("unitPresets", filteredPresets);
  };

  // Get selected preset details
  const getSelectedPresets = (): UnitPresetLevel[] => {
    if (!unitPresets) return [];
    return selectedPresetIds
      .map((id) => unitPresets.find((p) => p.preset_ID === id))
      .filter((p): p is UnitPresetLevel => p !== undefined);
  };

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

      toast.success(
        `Product added successfully! ${selectedPresetIds.length} packaging preset(s) assigned.`,
      );

      reset();
      setGeneratedProductCode("");
      setSelectedPresetIds([]);
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
              {generatedProductCode
                ? generatedProductCode
                : " (Auto-generated)"}
            </label>
            {/* <input
              className="w-full drop-shadow-none bg-custom-gray p-2"
              placeholder="AUTO GENERATED"
              value={generatedProductCode || ""}
              disabled
            /> */}
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
            Item
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

        {/* PACKAGING PRESET */}
        <div className="flex flex-col gap-2 h-full overflow-y-hidden">
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <label className="font-semibold">Packaging Preset(s)</label>
              <span className="text-sm text-gray-500">
                - {selectedPresetIds.length} preset(s) selected
              </span>
            </div>
            <button
              type="button"
              className="text-sm font-semibold"
              onClick={() => setIsPresetSelectorOpen(true)}
            >
              Associate to a Packaging Preset
            </button>
          </div>

          {selectedPresetIds.length === 0 ? (
            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 flex items-start gap-2">
              <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-orange-700">
                  No packaging presets assigned
                </span>
                <span className="text-xs text-orange-600">
                  You need to assign at least 1 unit preset to continue. Click
                  "Associate to a Packaging Preset" to select.
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full inset-shadow-sm border rounded-lg p-2 flex flex-col gap-2 overflow-y-scroll flex-1">
              {getSelectedPresets().map((preset, i) => (
                <AddProductUnitCard
                  key={preset.preset_ID}
                  preset={preset}
                  register={register}
                  index={i}
                  errors={errors}
                  onRemove={handleRemovePreset}
                />
              ))}
            </div>
          )}

          {errors.unitPresets &&
            typeof errors.unitPresets.message === "string" && (
              <span className="text-red-500 text-sm">
                {errors.unitPresets.message}
              </span>
            )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || selectedPresetIds.length === 0}
        className="w-full"
      >
        {isSubmitting ? "Adding Product..." : "Add Product"}
      </button>

      {/* Preset Selector Modal */}
      {isPresetSelectorOpen && (
        <PresetSelectorModal
          onClose={() => setIsPresetSelectorOpen(false)}
          onSelectPresets={handleSelectPresets}
          alreadySelectedPresetIds={selectedPresetIds}
        />
      )}
    </form>
  );
};

export default AddProductForm;
