export type UomModel = {
  uom_ID: number;
  uom_Name: string;
};

export type PresetLevelModel = {
  level_ID: number;
  level: number;
  uoM_ID: number;
  conversion_Factor: number;
  unit: UomModel | null;
  selling_Price: number;
};

export type ProductWithPresetItem = {
  product_Preset_ID: number;
  preset_ID: number;
  preset_Code: string;
  main_Unit_ID: number;
  main_Unit: UomModel | null;
  preset_Levels: PresetLevelModel[];
  main_Unit_Selling_Price: number;
};

export type ProductWithPresetsModel = {
  product_ID: number;
  product_Name: string;
  product_Code: string;
  category_Name: string | null;
  presets: ProductWithPresetItem[];
};

export type PurchasePriceAuditLogModel = {
  auditLog_ID: number;
  userId: string;
  userName: string;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  description: string;
  createdAt: string;
};

export type SupplierPurchasePriceModel = {
  price_ID: number;
  supplier_ID: string;
  product_ID: number;
  preset_ID: number;
  price_Per_Unit: number;
  created_At: string;
  updated_At: string;
  product: {
    product_ID: number;
    product_Name: string;
    product_Code: string;
  };
  preset: {
    preset_ID: number;
    preset_Code: string;
    main_Unit_ID: number;
    main_Unit: UomModel | null;
  };
};
