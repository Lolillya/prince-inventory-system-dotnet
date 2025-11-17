import { InvoiceItemsModel_2 } from "@/models/invoice-restockBatch.model";
import { useQuery } from "@tanstack/react-query";
import { GetAllInvoiceBatch } from "./invoice-get-all-batches.service";

export const useInvoiceBatchQuery = () => {
  return useQuery<InvoiceItemsModel_2[]>({
    queryKey: ["invoice-batch-items"],
    queryFn: async () => {
      const response = await GetAllInvoiceBatch();
      if (!response) throw new Error("Failed to fetch invoice batches");
      return response.data;
    },
  });
};
