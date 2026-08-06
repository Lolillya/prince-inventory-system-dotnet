import { InvoiceAllModel } from "./models/invoice-all.model";

export type InvoicePaymentStatus =
  | "Pending"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Voided";

// Voided always wins. A fully paid invoice is never Overdue just because its
// due date has passed. Otherwise, still-collectible invoices are Overdue
// once past their due date, Partially Paid once any amount has been paid,
// and Pending otherwise.
export const getInvoicePaymentStatus = (
  invoice: Pick<InvoiceAllModel, "status" | "balance" | "total_Amount" | "term" | "createdAt">,
): InvoicePaymentStatus => {
  if (invoice.status === "VOIDED") return "Voided";
  if (invoice.balance <= 0) return "Paid";

  const dueDate = new Date(invoice.createdAt);
  dueDate.setDate(dueDate.getDate() + invoice.term);
  if (new Date() > dueDate) return "Overdue";

  const paidAmount = invoice.total_Amount - invoice.balance;
  return paidAmount > 0 ? "Partially Paid" : "Pending";
};

export const invoicePaymentStatusColor: Record<InvoicePaymentStatus, string> = {
  Voided: "bg-gray-500 text-white",
  Paid: "bg-green-500 text-white",
  Overdue: "bg-red-500 text-white",
  "Partially Paid": "bg-yellow-400 text-white",
  Pending: "bg-blue-500 text-white",
};

export const invoicePaymentStatusDot: Record<InvoicePaymentStatus, string> = {
  Voided: "bg-gray-500",
  Paid: "bg-green-500",
  Overdue: "bg-red-500",
  "Partially Paid": "bg-yellow-400",
  Pending: "bg-blue-500",
};
