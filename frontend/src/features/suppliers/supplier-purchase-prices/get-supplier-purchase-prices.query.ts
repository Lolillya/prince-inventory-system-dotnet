import { useQuery } from "@tanstack/react-query";
import { GetSupplierPurchasePrices } from "./get-supplier-purchase-prices.service";
import { SupplierPurchasePriceModel } from "./supplier-purchase-prices.model";

export const useSupplierPurchasePricesQuery = (supplierId: string | null) => {
  return useQuery<SupplierPurchasePriceModel[]>({
    queryKey: ["supplier-purchase-prices", supplierId],
    queryFn: async () => {
      const response = await GetSupplierPurchasePrices(supplierId!);
      if (!response)
        throw new Error("Failed to fetch supplier purchase prices");
      return response.data;
    },
    enabled: !!supplierId,
    staleTime: 60 * 1000,
  });
};
