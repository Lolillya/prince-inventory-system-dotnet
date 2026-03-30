import { useQuery, useQueryClient } from "@tanstack/react-query";

const InvoiceTermKey = ["invoice-term"];

export const useInvoiceTermQuery = () => {
  return useQuery<number>({
    queryKey: InvoiceTermKey,
    queryFn: async () => {
      return 0;
    },
    enabled: false,
  });
};

export const setInvoiceTermQuery = () => {
  const queryClient = useQueryClient();

  const UPDATE_INVOICE_TERM = (term: number) => {
    queryClient.setQueryData<number>(InvoiceTermKey, term);
  };

  const CLEAR_INVOICE_TERM = () => {
    queryClient.setQueryData<number>(InvoiceTermKey, 0);
  };

  return {
    UPDATE_INVOICE_TERM,
    CLEAR_INVOICE_TERM,
  };
};
