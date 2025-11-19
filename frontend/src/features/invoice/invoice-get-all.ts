import { useQuery } from "@tanstack/react-query";
import { GetAllInvoices } from "./invoice-get-all.service";
import { InvoiceAllModel } from "./models/invoice-all.model";

export const useInvoiceQuery = () => {
  return useQuery<InvoiceAllModel[]>({
    queryKey: ["invoice-items"],
    queryFn: async () => {
      const response = await GetAllInvoices();
      if (!response) throw new Error("Failed to fetch invoices");
      return response.data;
    },
  });
};
