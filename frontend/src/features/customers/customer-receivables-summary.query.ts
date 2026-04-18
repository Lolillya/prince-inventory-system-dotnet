import { useQuery } from "@tanstack/react-query";
import { GetCustomerReceivablesSummary } from "./get-customer-receivables-summary.service";
import { CustomerReceivablesSummary } from "./models/customer-receivables-summary.model";

export const useCustomerReceivablesSummaryQuery = () => {
  return useQuery<CustomerReceivablesSummary[]>({
    queryKey: ["customer-receivables-summary"],
    queryFn: async () => {
      const response = await GetCustomerReceivablesSummary();
      if (!response) throw new Error("Failed to fetch receivables summary");
      return response.data;
    },
  });
};
