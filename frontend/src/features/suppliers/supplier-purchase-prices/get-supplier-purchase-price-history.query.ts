import { useQuery } from "@tanstack/react-query";
import { GetSupplierPurchasePriceHistory } from "./get-supplier-purchase-price-history.service";
import { PurchasePriceAuditLogModel } from "./supplier-purchase-prices.model";

export const useSupplierPurchasePriceHistoryQuery = (
  supplierId: string | null,
  productId: number | null,
  presetId: number | null,
) => {
  return useQuery<PurchasePriceAuditLogModel[]>({
    queryKey: [
      "supplier-purchase-price-history",
      supplierId,
      productId,
      presetId,
    ],
    queryFn: async () => {
      const response = await GetSupplierPurchasePriceHistory(
        supplierId!,
        productId!,
        presetId!,
      );
      if (!response)
        throw new Error("Failed to fetch supplier purchase price history");
      return response.data;
    },
    enabled: !!supplierId && !!productId && !!presetId,
    staleTime: 30 * 1000,
  });
};
