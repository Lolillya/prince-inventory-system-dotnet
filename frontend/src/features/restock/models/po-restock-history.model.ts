export type PORestockHistoryLineItem = {
  product: {
    product_ID: number;
    product_Name: string;
    brand: string;
    variant: string;
  } | null;
  base_Unit: {
    uom_ID: number;
    uom_Name: string;
  } | null;
  base_Unit_Quantity: number;
};

export type PORestockHistoryRecord = {
  restock_ID: number;
  restock_Number: string;
  status: string;
  delivery_Resolution: string | null;
  restock_Notes: string;
  created_At: string;
  updated_At: string;
  is_Reversed: boolean;
  voided_At: string | null;
  clerk: {
    Id: string;
    FirstName: string;
    LastName: string;
  } | null;
  voided_By_User: {
    Id: string;
    FirstName: string;
    LastName: string;
  } | null;
  total_Quantity: number;
  line_Items: PORestockHistoryLineItem[];
};
