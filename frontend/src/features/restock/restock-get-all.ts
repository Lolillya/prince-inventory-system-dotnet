import { RestockItemsModel } from "@/models/restock-items.model";
import { useQuery } from "@tanstack/react-query";
import { GetAllRestocks } from "./restock-get-all.service";

export const useRestockQuery = () => {
  return useQuery<RestockItemsModel[]>({
    queryKey: ["restock-items"],
    queryFn: async () => {
      const response = await GetAllRestocks();
      if (!response) throw new Error("Failed to fetch restocks");
      return response.data;
    },
  });
};
