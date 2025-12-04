import { useQuery } from "@tanstack/react-query";
import { GetInventory } from "./get-inventory.service";
import { InventoryProductModel } from "@/models/trash/inventory.model";

export const UseInventoryQuery = () => {
  return useQuery<InventoryProductModel[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await GetInventory();
      if (!response) throw new Error("Failded to fetch inventory");
      // MODIFY LATER ANY AS DATA TYPE
      return response.data as any;
    },
    staleTime: 60 * 1000,
  });
};
