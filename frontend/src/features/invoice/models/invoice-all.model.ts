export type InvoiceItemsModel = {
  invoice_ID: number;
  invoice_Number: number;
  notes: string;
  total_Amount: number;
  status: string;
  term: number;
  createdAt: string;
  customer: InvoiceCustomer;
  clerk: InvoiceClerk;
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
