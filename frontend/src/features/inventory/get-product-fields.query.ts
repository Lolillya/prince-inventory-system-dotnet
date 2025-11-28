import { useQuery } from "@tanstack/react-query";
import { ProductFieldsModel } from "./models/product-fields.model";
import { GetProductFields } from "./get-product-fields.service";

export const UseProductFieldsQuery = () => {
  return useQuery<ProductFieldsModel>({
    queryKey: ["product-fields"],
    queryFn: async () => {
      const response = await GetProductFields();
      if (!response) throw new Error("Failed to fetch product fields");
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};
