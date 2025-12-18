export type RestockAllModel = {
  restock_Id: number;
  restock_Number: string;
  restock_Notes: string;
  clerk: Clerk | null;
  created_At: string;
  updated_At: string;
  batches: RestockBatch[];
  grand_Total: number;
};

type Clerk = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type RestockBatch = {
  batch_Id: number;
  batch_Number: number;
  supplier: Supplier | null;
  created_At: string;
  updated_At: string;
  line_Items: RestockLineItems[];
  batch_Total: number;
};

type RestockLineItems = {
  line_Item_ID: number;
  product: Product | null;
  base_Unit: UnitOfMeasure | null;
  base_Unit_Price: number;
  base_Unit_Quantity: number;
  line_Item_Total: number;
  unit_Conversions: UnitConversion[];
};

type Product = {
  product_ID: number;
  product_Code: string;
  product_Name: string;
  description: string;
  brand: Brand | null;
  category: Category | null;
  variant: Variant | null;
};

type Brand = {
  brand_ID: number;
  brandName: string;
};

type Category = {
  category_ID: number;
  category_Name: string;
};

type Variant = {
  variant_ID: number;
  variant_Name: string;
};

type UnitOfMeasure = {
  uom_ID: number;
  uom_Name: string;
};

type UnitConversion = {
  product_UOM_Id: number;
  unit: UnitOfMeasure | null;
  parent_UOM_ID: number | null;
  conversion_Factor: number;
  unit_Price: number;
};

type Supplier = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};
