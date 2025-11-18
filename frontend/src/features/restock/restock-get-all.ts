import { useQuery } from "@tanstack/react-query";
import { GetAllRestocks } from "./restock-get-all.service";
import { RestockAllModel } from "./models/restock-all.model";

export const useRestockQuery = () => {
  return useQuery<RestockAllModel[]>({
    queryKey: ["restock-items"],
    queryFn: async () => {
      const response = await GetAllRestocks();
      if (!response) throw new Error("Failed to fetch restocks");
      return response.data;
    },
  });
};
