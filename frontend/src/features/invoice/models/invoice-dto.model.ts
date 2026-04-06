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
  preset_ID?: number | null;
  supplement_Preset_IDs?: number[];
  auto_Replenish?: boolean;
  unit: string;
  uom_ID: number;
  unit_Price: number;
  subtotal: number;
  unit_quantity: number;
  discount: number;
  isPercentageDiscount: boolean;
};
