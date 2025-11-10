import { InventoryProductModel } from "./inventory.model";

export type RestockModel = {
  restock: {
    items: InventoryProductModel;
    unit: string;
    unit_quantity: number;
    unit_price: number;
    total: number;
  };
};
