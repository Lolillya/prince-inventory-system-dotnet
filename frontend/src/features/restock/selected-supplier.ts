import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SupplierDataModel } from "../suppliers/get-all-suppliers.model";

const RestockSupplierKey = ["restock-supplier"];

export const useSelectedRestockSupplier = () => {
  return useQuery<SupplierDataModel>({
    queryKey: RestockSupplierKey,
    queryFn: async () => {
      return null as unknown as SupplierDataModel;
    },
    enabled: false,
  });
};

export const updateSelectedSupplier = () => {
  const queryClient = useQueryClient();

  const UPDATE_SELECTED_SUPPLIER = (supplier: SupplierDataModel) => {
    queryClient.setQueryData(RestockSupplierKey, supplier);
  };

  return {
    UPDATE_SELECTED_SUPPLIER,
  };
};
