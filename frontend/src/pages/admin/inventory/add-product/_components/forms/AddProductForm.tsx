import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useProductFields } from "@/features/inventory/add-product.query";
import { addProductService } from "@/features/inventory/add-product.service";

const schema = yup.object().shape({
  productName: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  productCode: yup.string().required("Product code is required"),
  brand_Id: yup.number().required("Brand is required"),
  category_Id: yup.number().required("Category is required"),
  variant_Id: yup.number().required("Variant is required"),
});

type AddProductFormValues = {
  productName: string;
  description: string;
  productCode: string;
  brand_Id: number;
  category_Id: number;
  variant_Id: number;
};

const addProduct = async (product: AddProductFormValues) => {
  const data = await addProductService(product);
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
    useProductFields();

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
    console.log("Form Values:", data);
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" flex flex-col gap-5 overflow-y-scroll flex-1"
    >
      <div className="flex flex-col space-y-4 mb-auto">
        {/* PRODUCT NAME */}
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

        {/* DESCRIPTION */}
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

        {/* PRODUCT CODE */}
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
          <label htmlFor="Brand_Id" className="block text-sm font-medium">
            Brand
          </label>
          <select
            id="Brand_Id"
            {...register("brand_Id")}
            disabled={productFieldsLoading}
            className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
          >
            <option value="">
              {productFieldsLoading ? "Loading..." : "Select Brand"}
            </option>
            {productFields?.brands.map((b) => (
              <option key={b.brand_ID} value={b.brand_ID}>
                {b.brandName}
              </option>
            ))}
          </select>
          {errors.brand_Id && (
            <p className="text-red-500 text-xs mt-1">
              {errors.brand_Id.message}
            </p>
          )}
        </div>

        {/* CATEGORY */}
        <div>
          <label htmlFor="category_Id" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="category_Id"
            {...register("category_Id")}
            className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
            disabled={productFieldsLoading}
          >
            <option value="">
              {productFieldsLoading ? "Loading..." : "Select Category"}
            </option>
            {productFields?.categories.map((c) => (
              <option key={c.category_ID} value={c.category_ID}>
                {c.category_Name}
              </option>
            ))}
          </select>
          {errors.category_Id && (
            <p className="text-red-500 text-xs mt-1">
              {errors.category_Id.message}
            </p>
          )}
        </div>

        {/* VARIANT */}
        <div>
          <label htmlFor="variant_Id" className="block text-sm font-medium">
            Variant
          </label>
          <select
            id="variant_Id"
            {...register("variant_Id")}
            className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
            disabled={productFieldsLoading}
          >
            <option value="">
              {productFieldsLoading ? "Loading..." : "Select Variant"}
            </option>
            {productFields?.variants.map((v) => (
              <option key={v.variant_ID} value={v.variant_ID}>
                {v.variant_Name}
              </option>
            ))}
          </select>
          {errors.variant_Id && (
            <p className="text-red-500 text-xs mt-1">
              {errors.variant_Id.message}
            </p>
          )}
        </div>
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding Product..." : "Add Product"}
      </button>
    </form>
  );
};

export default AddProductForm;
