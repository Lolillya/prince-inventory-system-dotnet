import { UserClientModel } from "@/models/user-client.model";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const supplierPayloadKey = "supplier-payload";

export const useNewSupplierPayload = () => {
  return useQuery<UserClientModel>({
    queryKey: [supplierPayloadKey],
    queryFn: async () => {
      return null as unknown as UserClientModel;
    },
    enabled: false,
  });
};

export const UPDATE_SUPPLIER_PAYLOAD = () => {
  const queryClient = useQueryClient();

  return (supplierPayload: UserClientModel) => {
    queryClient.setQueryData<UserClientModel>(
      [supplierPayloadKey],
      supplierPayload
    );
  };
};
