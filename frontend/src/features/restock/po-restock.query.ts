import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PORestockPayload } from "./models/po-restock.model";
import { createPORestock } from "./po-restock.service";
import { toast } from "sonner";

export const useCreatePORestockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PORestockPayload) => createPORestock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["restocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      toast.success("PO Restock created successfully.");
    },
    onError: () => {
      toast.error("Failed to create PO restock.");
    },
  });
};
