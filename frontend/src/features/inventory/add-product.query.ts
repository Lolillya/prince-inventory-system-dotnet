import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type ProductFields = {
  brands: { brand_ID: number; brandName: string }[];
  categories: { category_ID: number; category_Name: string }[];
  variants: { variant_ID: number; variant_Name: string }[];
};

const fetchProductFields = async (): Promise<ProductFields> => {
  const { data } = await axios.get(
    "http://localhost:5055/api/get-product-fields"
  );
  return data;
};

export const useProductFields = () => {
  return useQuery<ProductFields, Error>({
    queryKey: ["productFields"],
    queryFn: fetchProductFields,
  });
};
