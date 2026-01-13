/**
 * Models for Unit Preset-based Restock
 */

export interface UnitPresetRestockPayload {
  lineItems: UnitPresetRestockLineItem[];
  supplier_ID: string;
  restock_Clerk: string;
  notes?: string;
}

export interface UnitPresetRestockLineItem {
  product_ID: number;
  preset_ID: number;
  main_Unit_Quantity: number;
  levelPricing: UnitPresetPricing[];
}

export interface UnitPresetPricing {
  level: number;
  uom_ID: number;
  price_Per_Unit: number;
}

/**
 * Local state model for managing restock in the UI
 */
export interface UnitPresetRestockItem {
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
  unitPresets: UnitPreset[];
  // Selected preset data
  selectedPreset?: {
    preset_ID: number;
    main_Unit_Quantity: number;
    levelPricing: {
      level: number;
      uom_ID: number;
      uom_Name: string;
      price_Per_Unit: number;
    }[];
  };
}

export interface UnitPreset {
  assigned_At: string;
  preset: Preset;
  preset_ID: number;
  product_Preset_ID: number;
  low_Stock_Level?: number;
  very_Low_Stock_Level?: number;
}

export interface Preset {
  created_At: string;
  main_Unit_ID: number;
  mainUnit: {
    uom_ID: number;
    uom_Name: string;
  };
  presetLevels: PresetLevel[];
  preset_ID: number;
  preset_Name: string;
  updated_At: string;
}

export interface PresetLevel {
  conversion_Factor: number;
  created_At: string;
  level: number;
  level_ID: number;
  unitOfMeasure: UnitOfMeasure;
  uoM_ID: number; // Backend returns this with capital M
  uom_ID?: number; // Optional for backward compatibility
}

export interface UnitOfMeasure {
  uom_ID: number;
  uom_Name: string;
}
