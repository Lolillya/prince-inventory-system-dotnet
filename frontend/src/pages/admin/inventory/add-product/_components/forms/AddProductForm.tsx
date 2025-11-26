import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

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

const fetchBrands = async () => {
  const { data } = await axios.get("http://localhost:5055/api/brands");
  return data;
};

const fetchCategories = async () => {
  const { data } = await axios.get("http://localhost:5055/api/categories");
  return data;
};

const fetchVariants = async () => {
  const { data } = await axios.get("http://localhost:5055/api/variants");
  return data;
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

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: variants, isLoading: variantsLoading } = useQuery({
    queryKey: ["variants"],
    queryFn: fetchVariants,
  });

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
        <textarea id="description" {...register("description")} />
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
      <div>
        <label htmlFor="brandId" className="block text-sm font-medium">
          Brand
        </label>
        <select
          id="brandId"
          {...register("brandId")}
          disabled={brandsLoading}
          className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
        >
          <option value="">
            {brandsLoading ? "Loading..." : "Select Brand"}
          </option>
          {brands?.map((brand: any) => (
            <option key={brand.brand_ID} value={brand.brand_ID}>
              {brand.brandName}
            </option>
          ))}
        </select>
        {errors.brandId && (
          <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="categoryId"
          {...register("categoryId")}
          className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
          disabled={categoriesLoading}
        >
          <option value="">
            {categoriesLoading ? "Loading..." : "Select Category"}
          </option>
          {categories?.map((category: any) => (
            <option key={category.category_ID} value={category.category_ID}>
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
      <div>
        <label htmlFor="variantId" className="block text-sm font-medium">
          Variant
        </label>
        <select
          id="variantId"
          {...register("variantId")}
          className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
          disabled={variantsLoading}
        >
          <option value="">
            {variantsLoading ? "Loading..." : "Select Variant"}
          </option>
          {variants?.map((variant: any) => (
            <option key={variant.variant_ID} value={variant.variant_ID}>
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
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding Product..." : "Add Product"}
      </button>
    </form>
  );
};

export default AddProductForm;
