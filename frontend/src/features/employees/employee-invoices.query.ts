import { useQuery } from "@tanstack/react-query";
import { GetEmployeeInvoices } from "./get-employee-invoices.service";
import { InvoiceAllModel } from "../invoice/models/invoice-all.model";

export const useEmployeeInvoicesQuery = (employeeId: string) => {
  return useQuery<InvoiceAllModel[]>({
    queryKey: ["employee-invoices", employeeId],
    queryFn: async () => {
      const response = await GetEmployeeInvoices(employeeId);
      if (!response) throw new Error("Failed to fetch employee invoices");
      return response.data;
    },
    enabled: !!employeeId,
  });
};
