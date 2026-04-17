export type PaymentMethod = "Cash" | "Check" | "BankTransfer" | "Ewallet";

export type InvoicePaymentModel = {
  payment_ID: number;
  invoice_ID: number;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo: string | null;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  isInvalidated: boolean;
  invalidatedAt: string | null;
  invalidatedBy: string | null;
  invalidatedByName: string | null;
  invalidationReason: string | null;
};

export type RecordPaymentPayload = {
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
};

export type InvalidatePaymentPayload = {
  password: string;
  reason: string;
};
