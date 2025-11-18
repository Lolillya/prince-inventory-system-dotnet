import { InventoryProductModel } from "./inventory.model";
import { UnitConversion } from "./unit-conversion.model";

export type RestockModel = {
  restock: {
    items: InventoryProductModel;
    unit: string;
    unit_quantity: number;
    unit_price: number;
    total: number;
    unitConversions?: UnitConversion[]; // multi-level conversions for this product
  };
};
