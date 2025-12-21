import { UserClientModel } from "@/models/user-client.model";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const InvoiceCustomerKey = ["invoice-customer"];

export const useSelectedInvoiceCustomer = () => {
  return useQuery<UserClientModel>({
    queryKey: InvoiceCustomerKey,
    queryFn: async () => {
      return null as unknown as UserClientModel;
    },
    enabled: false,
  });
};

export const updateSelectedCustomer = () => {
  const queryClient = useQueryClient();

  const UPDATE_SELECTED_CUSTOMER = (customer: UserClientModel) => {
    queryClient.setQueryData(InvoiceCustomerKey, customer);
  };

  return {
    UPDATE_SELECTED_CUSTOMER,
  };
};
