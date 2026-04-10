export type BenchmarkUomModel = {
  uom_ID: number;
  uom_Name: string;
};

export type BenchmarkPresetLevelModel = {
  level_ID: number;
  level: number;
  uoM_ID: number;
  conversion_Factor: number;
  unit: BenchmarkUomModel | null;
  selling_Price: number;
};

export type BenchmarkPresetItem = {
  product_Preset_ID: number;
  preset_ID: number;
  preset_Name: string;
  main_Unit_ID: number;
  main_Unit: BenchmarkUomModel | null;
  preset_Levels: BenchmarkPresetLevelModel[];
  main_Unit_Selling_Price: number;
  supplier_count: number;
  has_loss: boolean;
};

export type BenchmarkProductItem = {
  product_ID: number;
  product_Name: string;
  product_Code: string;
  presets: BenchmarkPresetItem[];
};

export type BenchmarkSupplierItem = {
  supplier_ID: string;
  supplier_Name: string;
  price_Per_Unit: number;
  updated_At: string;
  is_loss: boolean;
};

export type BenchmarkPresetDetailModel = {
  main_Unit_ID: number;
  main_Unit: BenchmarkUomModel | null;
  preset_Levels: BenchmarkPresetLevelModel[];
  main_Unit_Selling_Price: number;
  suppliers: BenchmarkSupplierItem[];
};
