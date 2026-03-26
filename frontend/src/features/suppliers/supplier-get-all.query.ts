import { useQuery } from "@tanstack/react-query";
import { GetAllSuppliers } from "./get-all-suppliers.service";
import { SupplierDataModel } from "./get-all-suppliers.model";

export const useSuppliersQuery = () => {
  return useQuery<SupplierDataModel[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await GetAllSuppliers();
      if (!response) throw new Error("Failed to fetch suppliers");
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};
