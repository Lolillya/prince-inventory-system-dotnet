import { useQuery } from "@tanstack/react-query";
import { GetProductsWithPresets } from "./get-products-with-presets.service";
import { ProductWithPresetsModel } from "./supplier-purchase-prices.model";

export const useProductsWithPresetsQuery = () => {
  return useQuery<ProductWithPresetsModel[]>({
    queryKey: ["products-with-presets"],
    queryFn: async () => {
      const response = await GetProductsWithPresets();
      if (!response) throw new Error("Failed to fetch products with presets");
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};
