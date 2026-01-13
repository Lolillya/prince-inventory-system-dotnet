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

      unitPresets?: UnitPresets[];
    };
    uom_ID: number;
    unit_quantity: number;
    unit_price: number;
    unitConversions?: UnitConversion[];
  };
};

type UnitPresets = {
  assigned_At: string;
  preset: Preset;
  preset_ID: number;
  product_Preset_ID: number;
  low_Stock_Level?: number;
  very_Low_Stock_Level?: number;
};

type Preset = {
  created_At: string;
  main_Unit_ID: number;
  presetLevels: PresetLevel[];
  preset_ID: number;
  preset_Name: string;
  updated_At: string;
};

type PresetLevel = {
  conversion_Factor: number;
  created_At: string;
  level: number;
  level_ID: number;
  unitOfMeasure: UnitOfMeasure;
  uoM_ID: number;
};

type UnitOfMeasure = {
  uom_ID: number;
  uom_Name: string;
};
