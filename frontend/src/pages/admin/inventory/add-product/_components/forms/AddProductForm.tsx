import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { UseProductFieldsQuery } from "@/features/inventory/get-product-fields.query";

const schema = yup.object().shape({
  productName: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  productCode: yup.string().required("Product code is required"),
  brandId: yup.number().required("Brand is required"),
  categoryId: yup.number().required("Category is required"),
  variantId: yup.number().required("Variant is required"),
});

type AddProductFormValues = {
  productName: string;
  description: string;
  productCode: string;
  brandId: number;
  categoryId: number;
  variantId: number;
};

const addProduct = async (product: AddProductFormValues) => {
  const { data } = await axios.post(
    "http://localhost:5055/api/products",
    product
  );
  return data;
};

const AddProductForm = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddProductFormValues>({
    resolver: yupResolver(schema),
  });

  const { data: productFields, isLoading: productFieldsLoading } =
    UseProductFieldsQuery();

  console.log(productFields);

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success("Product added successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
    },
    onError: () => {
      toast.error("Failed to add product.");
    },
  });

  const onSubmit = (data: AddProductFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="productName" className="block text-sm font-medium">
          Product Name
        </label>
        <input
          id="productName"
          type="text"
          {...register("productName")}
          className="w-full drop-shadow-none bg-custom-gray p-2"
        />
        {errors.productName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.productName.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          className="w-full p-2 rounded-lg "
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="productCode" className="block text-sm font-medium">
          Product Code
        </label>
        <input
          id="productCode"
          type="text"
          {...register("productCode")}
          className="w-full drop-shadow-none bg-custom-gray p-2"
        />
        {errors.productCode && (
          <p className="text-red-500 text-xs mt-1">
            {errors.productCode.message}
          </p>
        )}
      </div>
      {/* BRANDS */}
      <div>
        <label htmlFor="brandId" className="block text-sm font-medium">
          Brand
        </label>
        <select
          id="brandId"
          {...register("brandId")}
          disabled={productFieldsLoading}
          className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
        >
          <option value="">
            {productFieldsLoading ? "Loading..." : "Select Brand"}
          </option>
          {productFields?.map((brand, i) => (
            <option key={i} value={brand.brandName}>
              {brand.brandName}
            </option>
          ))}
        </select>
        {errors.brandId && (
          <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>
        )}
      </div>

      {/* CATEGORY */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="categoryId"
          {...register("categoryId")}
          className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
          disabled={productFieldsLoading}
        >
          <option value="">
            {productFieldsLoading ? "Loading..." : "Select Category"}
          </option>
          {productFields?.map((category, i) => (
            <option key={i} value={category.category_Name}>
              {category.category_Name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-500 text-xs mt-1">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* VARIANT */}
      <div>
        <label htmlFor="variantId" className="block text-sm font-medium">
          Variant
        </label>
        <select
          id="variantId"
          {...register("variantId")}
          className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
          disabled={productFieldsLoading}
        >
          <option value="">
            {productFieldsLoading ? "Loading..." : "Select Variant"}
          </option>
          {productFields?.map((variant, i) => (
            <option key={i} value={variant.variant_Name}>
              {variant.variant_Name}
            </option>
          ))}
        </select>
        {errors.variantId && (
          <p className="text-red-500 text-xs mt-1">
            {errors.variantId.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Adding Product..." : "Add Product"}
      </button>
    </form>
  );
};

export default AddProductForm;
