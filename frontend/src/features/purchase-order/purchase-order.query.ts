import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PurchaseOrderCreatePayload,
  PurchaseOrderRecord,
  PurchaseOrderStatus,
} from "./purchase-order.model";
import { purchaseOrderService } from "./purchase-order.service";

const purchaseOrderKeys = {
  all: ["purchase-orders"] as const,
  byId: (id: number) => [...purchaseOrderKeys.all, "id", id] as const,
  bySupplier: (supplierId: string) =>
    [...purchaseOrderKeys.all, "supplier", supplierId] as const,
};

export const useGetAllPurchaseOrdersQuery = () => {
  return useQuery<PurchaseOrderRecord[]>({
    queryKey: purchaseOrderKeys.all,
    queryFn: () => purchaseOrderService.getAllPurchaseOrders(),
    staleTime: 30 * 1000,
  });
};

export const useGetPurchaseOrderByIdQuery = (id?: number) => {
  return useQuery<PurchaseOrderRecord>({
    queryKey: id ? purchaseOrderKeys.byId(id) : ["purchase-orders", "id", null],
    queryFn: () => purchaseOrderService.getPurchaseOrderById(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
};

export const usePurchaseOrdersBySupplierQuery = (supplierId?: string) => {
  return useQuery<PurchaseOrderRecord[]>({
    queryKey: supplierId
      ? purchaseOrderKeys.bySupplier(supplierId)
      : [...purchaseOrderKeys.all, "supplier", "none"],
    queryFn: () =>
      purchaseOrderService.getPurchaseOrdersBySupplier(supplierId!),
    enabled: Boolean(supplierId),
    staleTime: 60 * 1000,
  });
};

export const useCreatePurchaseOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchaseOrderCreatePayload) =>
      purchaseOrderService.createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
    },
  });
};

export const useUpdatePurchaseOrderStatusMutation = (supplierId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purchaseOrderId,
      status,
    }: {
      purchaseOrderId: number;
      status: PurchaseOrderStatus;
    }) =>
      purchaseOrderService.updatePurchaseOrderStatus(purchaseOrderId, {
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      if (supplierId) {
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.bySupplier(supplierId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
