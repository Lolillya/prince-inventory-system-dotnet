export type PORestockDeliveryStatus = "PARTIAL" | "FULLY_DELIVERED";

export type PORestockLineItem = {
  product_ID: number;
  preset_ID: number;
  main_Unit_Quantity: number;
};

export type PORestockPayload = {
  purchase_Order_ID: number;
  delivery_Status: PORestockDeliveryStatus;
  lineItems: PORestockLineItem[];
  restock_Clerk: string;
  notes?: string;
};

export type PORestockResponse = {
  message: string;
  restock_id: number;
  restock_number: string;
  purchase_order_id: number;
  delivery_status: string;
};
