import { UserClientModel } from "@/models/user-client.model";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const InvoiceCustomerKey = ["invoice-customer"];

export const useSelectedCustomer = () => {
  return useQuery<UserClientModel>({
    queryKey: InvoiceCustomerKey,
    queryFn: async () => {
      return {
        id: "",
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        companyName: "",
        notes: "",
        phoneNumber: "",
        role: "",
      };
    },
    enabled: false,
  });
};

export const useSetCustomerSelected = () => {
  const queryClient = useQueryClient();

  return (customer: UserClientModel) => {
    queryClient.setQueryData(InvoiceCustomerKey, customer);
  };
};
