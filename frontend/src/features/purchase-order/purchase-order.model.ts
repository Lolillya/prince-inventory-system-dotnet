export type PurchaseOrderStatus =
  | "NOT_DELIVERED"
  | "PARTIAL"
  | "FULLY_DELIVERED"
  | "CANCELLED";

export type PurchaseOrderCreateLineItem = {
  product_ID: number;
  preset_ID?: number;
  uom_ID: number;
  quantity: number;
  unit_Price: number;
};

export type PurchaseOrderCreatePayload = {
  supplier_ID: string;
  purchase_Order_Clerk: string;
  preferred_Delivery: string;
  notes?: string;
  lineItems: PurchaseOrderCreateLineItem[];
};

export type PurchaseOrderRecord = {
  purchase_Order_ID: number;
  purchase_Order_Number: string;
  status: PurchaseOrderStatus;
  preferred_Delivery: string;
  notes: string;
  created_At: string;
  updated_At: string;
  supplier: {
    supplier_Id: string;
    first_Name: string;
    last_Name: string;
    company_Name: string;
    email: string;
  };
  clerk: {
    id: string;
    first_Name: string;
    last_Name: string;
  };
  line_Items: Array<{
    purchase_Order_LineItem_ID: number;
    product_ID: number;
    preset_ID: number | null;
    uom_ID: number;
    quantity: number;
    unit_Price: number;
    sub_Total: number;
    received_quantity: number;
    remaining_quantity: number;
    product: {
      product_ID: number;
      product_Name: string;
      brand: string;
      variant: string;
    } | null;
    unit: {
      uom_ID: number;
      uom_Name: string;
    } | null;
    unit_Preset: {
      preset_ID: number;
      preset_Name: string;
      preset_Levels: Array<{
        level: number;
        uom_Name: string;
      }>;
    } | null;
  }>;
  grand_Total: number;
};

export type PurchaseOrderUpdateStatusPayload = {
  status: PurchaseOrderStatus;
};
