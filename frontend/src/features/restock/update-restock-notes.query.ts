import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRestockNotes } from "./update-restock-notes.service";

export const useUpdateRestockNotesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restockId, notes }: { restockId: number; notes: string }) =>
      updateRestockNotes(restockId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock-items"] });
    },
  });
};
