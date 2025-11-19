export type InvoiceAllModel = {
  invoice_ID: number;
  invoice_Number: number;
  notes: string;
  total_Amount: number;
  discount: number;
  status: string;
  term: number;
  createdAt: string;
  customer: InvoiceCustomer;
  clerk: InvoiceClerk;
  lineItems: LineItems;
};

type InvoiceCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

type InvoiceClerk = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type LineItems = {};
