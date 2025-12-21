export type InvoiceDTO = {
  LineItem: LineItems[];
  Invoice_Clerk: string | number | undefined;
  Customer_ID: string | number | undefined;
  Term: number | undefined;
  Notes: string;
};
type LineItems = {
  createdAt: string;
  updatedAt: string;
  product_ID: number;
  unit: string;
  uom_ID: number;
  unit_Price: number;
  subtotal: number;
  unit_quantity: number;
  discount: number;
  isPercentageDiscount: boolean;
};
