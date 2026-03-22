import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SupplierDataModel } from "./get-all-suppliers.model";

const supplierSelectedKey = ["supplier-selected"];

export const useSelectedSupplierQuery = () => {
  return useQuery<SupplierDataModel>({
    queryKey: supplierSelectedKey,
    queryFn: async () => {
      return null as unknown as SupplierDataModel;
    },
    enabled: false,
  });
};

export const useSetSupplierSelected = () => {
  const queryClient = useQueryClient();

  return (supplier: SupplierDataModel) => {
    queryClient.setQueryData<SupplierDataModel>(supplierSelectedKey, supplier);
  };
};
