import { useQuery } from "@tanstack/react-query";
import { InventoryBatchesModel } from "./models/inventory-batches.model";
import { GetInventory } from "./get-inventory-batches";

export const UseInventoryQuery = () => {
  return useQuery<InventoryBatchesModel[]>({
    queryKey: ["inventory-batches"],
    queryFn: async () => {
      const response = await GetInventory();
      if (!response) throw new Error("Failded to fetch inventory");
      return response.data as any;
    },
    staleTime: 60 * 1000,
  });
};
