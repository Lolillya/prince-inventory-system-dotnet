export type SupplierDataModel = {
  supplier_Id: string;
  first_Name: string;
  last_Name: string;
  company_Name: string;
  email: string;
  phone_Number: string;
  address: string;
  notes: string;
  username: string;
  restocks: RestockBatchModel[];
  total_Restock_Value: number;
};

export type RestockBatchModel = {
  batch_Id: number;
  batch_Number: number;
  restock_Id: number;
  created_At: string;
  updated_At: string;
  restock_Info: RestockInfoModel;
  line_Items: RestockLineItemModel[];
};

export type RestockInfoModel = {
  restock_ID: number;
  restock_Number: string;
  restock_Notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type RestockLineItemModel = {
  line_Item_ID: number;
  product_ID: number;
  base_UOM_ID: number;
  preset_ID: number | null;
  base_Unit_Price: number;
  base_Unit_Quantity: number;
  line_Item_Total: number;
  product: ProductModel | null;
  unit_Preset: UnitPresetModel | null;
  preset_Pricing: PresetPricingModel[];
};

export type ProductModel = {
  product_ID: number;
  product_Code: string;
  product_Name: string;
  description: string;
  brand: BrandModel | null;
  category: CategoryModel | null;
  variant: VariantModel | null;
};

export type BrandModel = {
  brand_ID: number;
  brandName: string;
};

export type CategoryModel = {
  category_ID: number;
  category_Name: string;
};

export type VariantModel = {
  variant_ID: number;
  variant_Name: string;
};

export type UnitPresetModel = {
  preset_ID: number;
  preset_Name: string;
  main_Unit_ID: number;
  main_Unit: UnitOfMeasureModel | null;
  preset_Levels: PresetLevelModel[];
};

export type PresetLevelModel = {
  level_ID: number;
  level: number;
  uoM_ID: number;
  conversion_Factor: number;
  unit: UnitOfMeasureModel | null;
};

export type PresetPricingModel = {
  pricing_ID: number;
  uoM_ID: number;
  price_Per_Unit: number;
  unit: UnitOfMeasureModel | null;
};

export type UnitOfMeasureModel = {
  uom_ID: number;
  uom_Name: string;
};
