export type InvoiceAllModel = {
  invoice_ID: number;
  invoice_Number: number;
  notes: string;
  total_Amount: number;
  discount: number;
  balance: number;
  status: string;
  term: number;
  createdAt: string;
  customer: InvoiceCustomer;
  clerk: InvoiceClerk;
  lineItems: InvoiceLineItem[];
};

export type InvoiceCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

export type InvoiceClerk = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type InvoiceLineItem = {
  lineItem_ID: number;
  product_ID: number;
  product: {
    product_ID: number;
    product_Name: string;
  };
  unit: string;
  unit_Price: number;
  sub_Total: number;
  unit_Quantity: number;
};
