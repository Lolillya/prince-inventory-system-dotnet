import { useQuery } from "@tanstack/react-query";
import { PORestockHistoryRecord } from "./models/po-restock-history.model";
import { poRestockHistoryService } from "./po-restock-history.service";

export const useRestocksByPurchaseOrderQuery = (purchaseOrderId?: number) => {
  return useQuery<PORestockHistoryRecord[]>({
    queryKey: ["restocks", "purchase-order", purchaseOrderId ?? "none"],
    queryFn: () =>
      poRestockHistoryService.getRestocksByPurchaseOrder(purchaseOrderId!),
    enabled: Boolean(purchaseOrderId),
    staleTime: 30 * 1000,
  });
};
