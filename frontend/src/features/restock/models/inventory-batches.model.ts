export type InventoryBatchesModel = {
  product: {
    product_ID: number;
    product_Code: string;
    product_Name: string;
    description: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
  };
  brand: brand;
  variant: variant;
  category: category;
  unitPresets: UnitPresets[];
  restockInfo: RestockInfo[];
  isComplete: boolean;
};

type brand = {
  brand_ID: number;
  brandName: string;
  createdAt: string;
  updatedAt: string;
};

type variant = {
  variant_ID: number;
  variant_Name: string;
  createdAt: string;
  updatedAt: string;
};

type category = {
  category_ID: number;
  category_Name: string;
  createdAt: string;
  updatedAt: string;
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
  mainUnit: {
    uom_ID: number;
    unit_Name: string;
    abbreviation: string;
  };
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
  abbreviation: string;
};

type RestockInfo = {
  restockId: number;
  restockNumber: string;
  clerk: {
    id: string;
    firstName: string;
    lastName: string;
  };
  batchId: number;
  batchNumber: number;
  supplier: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
  };
  base_Unit_Price: number;
  base_Unit_Quantity: number;
  presetPricing: PresetPricing[];
};

type PresetPricing = {
  pricing_ID: number;
  level: number;
  uoM_ID: number;
  unitName: string;
  price_Per_Unit: number;
  created_At: string;
};
