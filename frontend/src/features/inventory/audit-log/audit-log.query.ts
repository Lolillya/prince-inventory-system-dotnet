import { useQuery } from "@tanstack/react-query";
import { getProductAuditLogs } from "./audit-log.service";
import { ProductAuditLog } from "./audit-log.model";

export const useProductAuditLogQuery = (
  productId?: number,
  presetId?: number,
) => {
  return useQuery<ProductAuditLog[]>({
    queryKey: ["product-audit-logs", productId, presetId],
    queryFn: () => getProductAuditLogs(productId!, presetId),
    enabled: productId !== undefined,
  });
};
