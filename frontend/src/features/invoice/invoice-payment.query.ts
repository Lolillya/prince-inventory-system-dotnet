import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicePaymentService } from "./invoice-payment.service";
import {
  InvalidatePaymentPayload,
  RecordPaymentPayload,
} from "./models/invoice-payment.model";

export const invoicePaymentKeys = {
  all: (invoiceId: number) => ["invoice-payments", invoiceId] as const,
};

export const useInvoicePaymentsQuery = (invoiceId: number) => {
  return useQuery({
    queryKey: invoicePaymentKeys.all(invoiceId),
    queryFn: () => invoicePaymentService.getInvoicePayments(invoiceId),
    enabled: invoiceId > 0,
  });
};

export const useRecordPaymentMutation = (
  invoiceId: number,
  customerId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) =>
      invoicePaymentService.recordPayment(invoiceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoicePaymentKeys.all(invoiceId),
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-invoices", customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-receivables-summary"],
      });
    },
  });
};

export const useInvalidatePaymentMutation = (
  invoiceId: number,
  customerId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: number;
      payload: InvalidatePaymentPayload;
    }) => invoicePaymentService.invalidatePayment(paymentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoicePaymentKeys.all(invoiceId),
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-invoices", customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-receivables-summary"],
      });
    },
  });
};
