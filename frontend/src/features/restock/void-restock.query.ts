import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voidRestock } from "./void-restock.service";

export const useVoidRestockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (restockId: number) => voidRestock(restockId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["restock-items"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-with-batches"] }),
      ]);
    },
  });
};
