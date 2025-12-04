import { InventoryProductModel } from "../../features/inventory/models/inventory.model";

export type InvoiceProductModel = {
  invoice: {
    item: InventoryProductModel;
    unit: units[];
    unit_quantity: number;
    unit_price: number;
    discount: number;
    total: number;
  };
};

type units = {
  uoM_Name: string;
  conversion_Factor: number;
  price: number;
};
