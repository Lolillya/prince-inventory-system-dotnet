import { InvoiceItemsModel } from "@/models/invoice-items.model";
import { useQuery } from "@tanstack/react-query";
import { GetAllInvoices } from "./invoice-get-all.service";

export const useInvoiceQuery = () => {
  return useQuery<InvoiceItemsModel[]>({
    queryKey: ["invoice-items"],
    queryFn: async () => {
      const response = await GetAllInvoices();
      if (!response) throw new Error("Failed to fetch invoices");
      return response.data;
    },
  });
};
