import { UnitConversion } from "@/models/unit-conversion.model";

export type NewRestockModel = {
  restock: {
    items: {
      product: {
        product_ID: number;
        product_Code: string;
        product_Name: string;
        desc: string;
        brand_ID: number;
        category_ID: number;
        created_At: string;
        updated_At: string;
      };
      variant: {
        variant_Name: string;
        created_At: string;
        updated_At: string;
      };
      brand: {
        brand_Name: string;
        created_At: string;
        updated_At: string;
      };
    };
    uom_ID: number;
    unit_quantity: number;
    unit_price: number;
    total: number;
    unitConversions?: UnitConversion[];
  };
};
