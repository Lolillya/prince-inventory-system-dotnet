import { useQuery } from "@tanstack/react-query";
import { GetEmployeeRestocks } from "./get-employee-restocks.service";
import { RestockAllModel } from "../restock/models/restock-all.model";

export const useEmployeeRestocksQuery = (employeeId: string) => {
  return useQuery<RestockAllModel[]>({
    queryKey: ["employee-restocks", employeeId],
    queryFn: async () => {
      const response = await GetEmployeeRestocks(employeeId);
      if (!response) throw new Error("Failed to fetch employee restocks");
      return response.data;
    },
    enabled: !!employeeId,
  });
};
