import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VoidRestockPayload, voidRestock } from "./void-restock.service";

export const useVoidRestockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VoidRestockPayload) => voidRestock(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["restock-items"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-with-batches"] }),
      ]);
    },
  });
};
