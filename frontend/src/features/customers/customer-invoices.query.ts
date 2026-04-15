import { useQuery } from "@tanstack/react-query";
import { GetCustomerInvoices } from "./get-customer-invoices.service";
import { InvoiceAllModel } from "../invoice/models/invoice-all.model";

export const useCustomerInvoicesQuery = (customerId: string) => {
  return useQuery<InvoiceAllModel[]>({
    queryKey: ["customer-invoices", customerId],
    queryFn: async () => {
      const response = await GetCustomerInvoices(customerId);
      if (!response) throw new Error("Failed to fetch customer invoices");
      return response.data;
    },
    enabled: !!customerId,
  });
};
