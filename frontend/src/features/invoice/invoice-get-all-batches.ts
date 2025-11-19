import { useQuery } from "@tanstack/react-query";
import { GetAllInvoiceBatch } from "./invoice-get-all-batches.service";
import { InvoiceRestockBatchModel } from "./models/invoice-restock-batch.model";

export const useInvoiceBatchQuery = () => {
  return useQuery<InvoiceRestockBatchModel[]>({
    queryKey: ["invoice-batch-items"],
    queryFn: async () => {
      const response = await GetAllInvoiceBatch();
      if (!response) throw new Error("Failed to fetch invoice batches");
      return response.data;
    },
  });
};
